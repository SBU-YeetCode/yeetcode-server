import { ObjectId } from 'mongodb'
import { Service } from 'typedi'
import GameModel from '../game/model'
import GameProgressModel from './model'
import { GameProgressInput, Game, User, QuestionProgress, GAMETYPE, GameProgress } from '../../entities'
import buildGameProgress from './utils/buildGameProgress'
import UserModel from '../user/model'
import { Deleted } from '../utils/output'
import { SubmittedAnswer } from './input'
import { differenceInMilliseconds } from 'date-fns'
import axios from 'axios'
import { config } from '../../config'
import { de } from 'date-fns/locale'
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
		if (!gameprogress) throw new Error('Cant find game prgoress. Start first.')
		return gameprogress
	}

	public async createGameProgress(userId: string, gameId: string) {
		const oldProgress = await this.gameprogressModel.findOne({ userId, gameId })
		let prevPoints: number = 0
		if (oldProgress) {
			if (oldProgress.isCompleted) {
				prevPoints = oldProgress.totalPoints
			}
			await oldProgress.deleteOne()
		}
		const game = await this.gameModel.findById(gameId)
		if (!game) throw new Error(`Game could not be found for the given ID: ${gameId}`)
		const buildedGameProgress: GameProgressInput = buildGameProgress(game as Game, userId, prevPoints)
		const gameProgress = await this.gameprogressModel.createGameProgress(buildedGameProgress)
		if (!gameProgress) throw new Error('Unable to create gameprogress')
		// Update play count
		game.playCount += 1
		game.save()
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

	public async deleteGameProgress(userId: ObjectId, gameProgressId: string): Promise<Deleted> {
		const gameProgress = await this.gameprogressModel.getById(new ObjectId(gameProgressId))
		if (gameProgress?.isCompleted && gameProgress?.totalPoints > 0) {
			const user = await this.userModel.findById(userId)
			if (!user) throw new Error('No user found')
			// @ts-ignore
			user.points[gameProgress./* @ts-ignore */ codingLanguage] =
				user.points[gameProgress.codingLanguage] - gameProgress.totalPoints
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

	public async updateQuestionProgress(userId: string, gameId: string, questionProgress: QuestionProgress) {
		const game = await this.gameModel.getById(gameId)
		if (!gameId) throw new Error(`Game with the following ID does not exist: ${gameId}`)
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
		if (!newGameProgress) throw new Error('Error updating question progress')
		return progressReturn
	}

	public async submitQuestion(userId: string, gameId: string, questionId: string, submittedAnswer: SubmittedAnswer) {
		// Get game
		const game = await this.gameModel.getById(gameId)
		if (!game) throw new Error(`Game does not exist for the given ID: ${gameId}`)
		// Get game question
		const gameQuestion = game.questions.find((question) => question._id.toHexString() === questionId)
		if (!gameQuestion) throw new Error(`Question does not exist for the given ID: ${questionId}`)
		// Validate if question is correct
		let isCorrect: boolean = false
		switch (gameQuestion.gameType) {
			case GAMETYPE.FILLINBLANK:
				// Ensure fill in the blank is part of submitted question
				if (submittedAnswer.fillInTheBlank == null)
					throw new Error(
						`Submitted question is for ${GAMETYPE.FILLINBLANK} but did not recieve fillInTheBlank from mutation.`
					)
				if (submittedAnswer.fillInTheBlank.length !== gameQuestion.fillInTheBlank?.solutions.length) break // Incorrect matching length, no need to check
				// Loop through matching
				isCorrect = true
				for (var i = 0; i < submittedAnswer.fillInTheBlank.length; i++) {
					if (submittedAnswer.fillInTheBlank[i] !== gameQuestion.fillInTheBlank?.solutions[i]) {
						isCorrect = false
						break
					}
				}
				break
			case GAMETYPE.LIVECODING:
				if (submittedAnswer.liveCoding == null)
					throw new Error(
						`Submitted question is for ${GAMETYPE.LIVECODING} but did not recieve matching from mutation.`
					)
				let compileLanguage = ''
				switch (game.codingLanguage.toLowerCase()) {
					case 'python':
						compileLanguage = 'python3'
						break
					case 'javascript':
						compileLanguage = 'nodejs'
						break
					default:
						compileLanguage = game.codingLanguage.toLowerCase()
				}
				const resp = await axios.post('https://api.jdoodle.com/v1/execute', {
					clientId: config.jDoodle.clientId,
					clientSecret: config.jDoodle.clientSecret,
					script: submittedAnswer.liveCoding + '\n' + gameQuestion.liveCoding?.matcherCode,
					language: compileLanguage,
					stdin: gameQuestion.liveCoding?.stdin,
				})
				// Make sure no error has occured
				if (resp.data.statusCode !== 200) {
					isCorrect = false
					break
				}
				// Check if output matches expected output
				if (resp.data.output === 'true' || resp.data.output === 'true\n') {
					isCorrect = true
					break
				} else isCorrect = false
				break
			case GAMETYPE.MATCHING:
				// Ensure matching is part of submitted question
				if (submittedAnswer.matching == null)
					throw new Error(
						`Submitted question is for ${GAMETYPE.MATCHING} but did not recieve matching from mutation.`
					)
				if (submittedAnswer.matching.length !== gameQuestion.matching?.matching.length) break // Incorrect matching length, no need to check
				// Check if submission is correct
				isCorrect = true
				for (var i = 0; i < submittedAnswer.matching.length; i++) {
					const submittedPair = submittedAnswer.matching[i]
					let pairIsCorrect = false
					for (var j = 0; j < gameQuestion.matching.matching.length; j++) {
						// Check if submittedPair matches any inside the question
						pairIsCorrect = gameQuestion.matching.matching.some((correctCard) => {
							if (
								(correctCard.pairOne === submittedPair.pairOne ||
									correctCard.pairOne === submittedPair.pairTwo) &&
								(correctCard.pairTwo === submittedPair.pairTwo ||
									correctCard.pairTwo === submittedPair.pairOne)
							)
								return true
							else return false
						})
						if (pairIsCorrect) {
							// Move on to next card
							pairIsCorrect = false
						} else {
							// Incorrect pair found
							isCorrect = false
							break
						}
					}
					if (!isCorrect) break
				}
				break
			case GAMETYPE.MULTIPLECHOICE:
				// Ensure multiple choice is part of submitted question
				if (submittedAnswer.multipleChoice == null)
					throw new Error(
						`Submitted question is for ${GAMETYPE.MULTIPLECHOICE} but did not recieve multipleChoice from mutation.`
					)
				if (submittedAnswer.multipleChoice === gameQuestion.multipleChoice?.correctChoice) isCorrect = true
				break
			case GAMETYPE.SPOTTHEBUG:
				// Ensure spot the bug is part of submitted question
				if (submittedAnswer.spotTheBug == null)
					throw new Error(
						`Submitted question is for ${GAMETYPE.SPOTTHEBUG} but did not recieve spotTheBug from mutation.`
					)
				if (submittedAnswer.spotTheBug == gameQuestion.spotTheBug?.bugLine) isCorrect = true
				break
			default:
				throw new Error(`Unknown question type: ${gameQuestion.gameType}`)
		}

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
		gameProgress.questions = gameProgress.questions.map((questionProgress) => {
			if (questionProgress.questionId === questionId) {
				// Ensure question is not already completed
				if (questionProgress.completed) return questionProgress
				// Ensure question has been started
				if (!questionProgress.dateStarted) return questionProgress
				// Ensure time limit is not exceeded
				if (currentDate - new Date(questionProgress.dateStarted).getTime() >= gameQuestion.timeLimit) {
					// Time limit exceeded
					questionProgress.completed = true
					questionProgress.dateCompleted = new Date().toISOString()
					questionProgress.pointsReceived = 0
				} else {
					// Alter progress depending on if it was correct
					if (isCorrect) {
						questionProgress.completed = true
						questionProgress.dateCompleted = new Date().toISOString()
						// Calculate points gained
						const percentElapsed =
							(currentDate - new Date(questionProgress.dateStarted).getTime()) / gameQuestion.timeLimit
						questionProgress.pointsReceived = Math.round((1 - percentElapsed) * gameQuestion.points)
					} else {
						// Update lives left if the question has limited lives
						if (gameQuestion.lives !== -1) questionProgress.livesLeft -= 1
						// No more attempts can be made
						if (questionProgress.livesLeft === 0) {
							questionProgress.dateCompleted = new Date().toISOString()
							questionProgress.completed = true
							questionProgress.pointsReceived = 0
						}
					}
				}
			}
			return questionProgress
		})
		// Check if last question submitted is completed, and if so, update points to user profile and mark game as completed
		let lastQuestion = null
		for (var i = 0; i < game.roadmap.length; i++) {
			let latestIndex = 0
			if (game.roadmap[i].kind === 'Question') {
				if (game.roadmap[i].sequence > latestIndex) {
					latestIndex = game.roadmap[i].sequence
					lastQuestion = game.questions.find(
						(question) => question._id.toHexString() === game.roadmap[i].refId
					)
				}
			}
		}
		if (
			lastQuestion?._id.toHexString() === questionId &&
			gameProgress.questions.some((qProg) => qProg.completed && qProg.questionId === questionId)
		) {
			// Is last question and was completed
			gameProgress.isCompleted = true
			gameProgress.completedAt = new Date().toISOString()
			// Get user and update points
			const user = await this.userModel.findById(new ObjectId(userId))
			if (!user) throw new Error(`User could not be found with the given ID: ${userId}`)
			// Check if points are better than last attempt
			let newTotal = 0
			for (var i = 0; i < gameProgress.questions.length; i++) {
				newTotal += gameProgress.questions[i].pointsReceived
			}
			if (gameProgress.totalPoints < newTotal) {
				// Adjust points
				const oldPoints = gameProgress.totalPoints
				gameProgress.totalPoints = newTotal
				user.points.total += newTotal - oldPoints
				// @ts-ignore
				user.points[game.codingLanguage.toLowerCase()] += newTotal - oldPoints
				await user.save()
			}
		}
		await gameProgress.save()
		return { isCorrect }
	}

	public async revealHints(gameProgressId: ObjectId, questionId: string) {
		const gameProgress = await this.gameprogressModel.findById(gameProgressId)
		if (!gameProgress) throw new Error('Cannot find game progress')
		const game = await this.gameModel.getById(gameProgress.gameId)
		const question = game?.questions.find((q) => q._id.toHexString() === questionId)
		const progress = gameProgress.questions.find((q) => q.questionId === questionId)
		if (!question || !progress) throw new Error('Error finding documents')
		if (!progress.dateStarted || progress.dateCompleted)
			throw new Error('Question not started yet or has already been completed')
		for (const hint of question.hints.filter((h) => !progress.hintsRevealed.includes(h._id.toHexString()))) {
			const difference = differenceInMilliseconds(new Date(), new Date(progress.dateStarted))
			if (difference >= hint.timeToReveal) {
				progress.hintsRevealed.push(hint._id.toHexString())
			}
		}
		await gameProgress.save()
		return gameProgress
	}
}
