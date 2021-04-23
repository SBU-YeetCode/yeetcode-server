import { ObjectId } from 'mongodb'
import { Service } from 'typedi'
import GameModel from '../game/model'
import GameProgressModel from './model'
import { GameProgressInput, Game, User, QuestionProgress } from '../../entities'
import buildGameProgress from './utils/buildGameProgress'
import UserModel from '../user/model'
import { Deleted } from '../utils/output'
@Service() // Dependencies injection
export default class GameProgressService {
	constructor(
		private readonly gameprogressModel: GameProgressModel,
		private readonly gameModel: GameModel,
		private readonly userModel: UserModel
	) {}
	public async getById(id: ObjectId) {
		const gameprogress = await this.gameprogressModel.getById(id)
		if (!gameprogress) throw new Error('No gameprogress found')
		return gameprogress
	}

	public async getByUserId(userId: ObjectId, gameId: ObjectId) {
		const gameprogress = await this.gameprogressModel
			.findOne({
				userId: userId.toHexString(),
				gameId: gameId.toHexString(),
			})
			.lean()
			.exec()
		if (!gameprogress)
			throw new Error('Cant find game prgoress. Start first.')
		return gameprogress
	}

	public async createGameProgress(userId: string, gameId: string) {
		const exists = await this.gameprogressModel.exists({ userId, gameId })
		if (exists)
			throw new Error(
				'This user already has an instance of the game being played. Please clear before starting new instance'
			)
		const game: Game = (await this.gameModel.getById(gameId)) as Game
		const buildedGameProgress: GameProgressInput = buildGameProgress(
			game,
			userId
		)
		const gameProgress = await this.gameprogressModel.createGameProgress(
			buildedGameProgress
		)
		if (!gameProgress) throw new Error('Unable to create gameprogress')
		return gameProgress
	}
	public async getUserRecentGames(userId: string) {
		const userRecentGames = await this.gameprogressModel.getGameProgresses(
			{
				userId: userId,
				isCompleted: false,
			},
			{
				startedAt: -1,
			}
		)
		return userRecentGames
	}

	public async getUserCompletedGames(userId: string) {
		const userRecentGames = await this.gameprogressModel.getGameProgresses(
			{
				userId: userId,
				isCompleted: true,
			},
			{
				completedAt: -1,
			}
		)
		return userRecentGames
	}

	public async deleteGameProgress(
		userId: ObjectId,
		gameProgressId: string
	): Promise<Deleted> {
		const gameProgress = await this.gameprogressModel.getById(
			new ObjectId(gameProgressId)
		)
		if (gameProgress?.isCompleted && gameProgress?.totalPoints > 0) {
			const user = await this.userModel.findById(userId)
			if (!user) throw new Error('No user found')
			// @ts-ignore
			user.points[gameProgress./* @ts-ignore */ codingLanguage] =
				user.points[gameProgress.codingLanguage] -
				gameProgress.totalPoints
			user.save()
		}
		const deleted = await this.gameprogressModel.deleteMany({
			userId: userId,
			_id: gameProgressId,
		})
		return {
			amountDeleted: deleted.n || 0,
			err: null,
			success: Boolean(deleted.ok),
		}
	}

	public async updateQuestionProgress(
		userId: string,
		gameId: string,
		questionProgress: QuestionProgress
	) {
		const game = await this.gameModel.getById(gameId)
		if (!gameId)
			throw new Error(
				`Game with the following ID does not exist: ${gameId}`
			)
		const gameProgress = await this.gameprogressModel.findOne({
			userId,
			gameId,
		})
		if (!gameProgress)
			throw new Error(
				`User (ID: ${userId}) does not have game progress for the game with the following ID: ${gameId}`
			)
		// Check if question has been started
		let progressReturn = {}
		gameProgress.questions = gameProgress.questions.map((question) => {
			if (question.questionId === questionProgress.questionId) {
				// Check if question has been started
				if (question.dateStarted) {
					// Question has been started before
					delete questionProgress.dateStarted
					question = { ...questionProgress }
				} else {
					// Question never started
					question.dateStarted = new Date().toISOString()
				}
				progressReturn = question
			}
			return question
		})
		const newGameProgress = await gameProgress.save()
		if (!newGameProgress)
			throw new Error('Error updating question progress')
		return progressReturn
	}

	public async submitQuestion(
		userId: string,
		gameId: string,
		questionId: string,
		submittedAnswer: string
	) {
		// Get game
		const game = await this.gameModel.getById(gameId)
		if (!game)
			throw new Error(`Game does not exist for the given ID: ${gameId}`)
		// Get game question
		const gameQuestion = game.questions.find(
			(question) => question._id.toHexString() === questionId
		)
		if (!gameQuestion)
			throw new Error(
				`Question does not exist for the given ID: ${questionId}`
			)
		// Validate if question is correct
		const isCorrect: boolean =
			gameQuestion.correctChoice === submittedAnswer
		// Get game progress to update
		const gameProgress = await this.gameprogressModel.findOne({
			userId,
			gameId,
		})
		if (!gameProgress)
			throw new Error(
				`Game progress does not exist for the given user/game combination: User ID = ${userId}, Game ID = ${gameId}`
			)
		// Update game progress
		const currentDate = new Date().getTime()
		gameProgress.questions = gameProgress.questions.map(
			(questionProgress) => {
				if (questionProgress.questionId === questionId) {
					// Ensure question is not already completed
					if (questionProgress.completed) return questionProgress
					// Ensure question has been started
					if (!questionProgress.dateStarted) return questionProgress
					// Ensure time limit is not exceeded
					if (
						currentDate -
							new Date(questionProgress.dateStarted).getTime() >=
						gameQuestion.timeLimit
					) {
						// Time limit exceeded
						questionProgress.completed = true
						questionProgress.pointsReceived = 0
					} else {
						// Alter progress depending on if it was correct
						if (isCorrect) {
							questionProgress.completed = true
							// Calculate points gained
							const percentElapsed =
								(currentDate -
									new Date(
										gameProgress.startedAt
									).getTime()) /
								gameQuestion.timeLimit
							questionProgress.pointsReceived = Math.round(
								(1 - percentElapsed) * gameQuestion.points
							)
						} else {
							// Update lives left if the question has limited lives
							if (gameQuestion.lives !== -1)
								questionProgress.livesLeft -= 1
							// No more attempts can be made
							if (questionProgress.livesLeft === 0) {
								questionProgress.completed = true
								questionProgress.pointsReceived = 0
							}
						}
					}
				}
				return questionProgress
			}
		)
		gameProgress.save()
		return { isCorrect }
	}
}
