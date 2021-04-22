import { ObjectId } from 'mongodb'
import { Service } from 'typedi'
import GameModel from '../game/model'
import GameProgressModel from './model'
import { GameProgressInput, Game, User, QuestionProgress } from '../../entities'
import buildGameProgress from './utils/buildGameProgress'
import UserModel from '../user/model'
import { Deleted } from '../utils/deleted'
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
			user.points[gameProgress./* @ts-ignore */codingLanguage] = 
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
			}
			return question
		})
		const newGameProgress = await gameProgress.save()
		if (!newGameProgress)
			throw new Error('Error updating question progress')
		return gameProgress.questions
	}
}
