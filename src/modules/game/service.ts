import { ObjectId } from 'mongodb'
import { Service } from 'typedi'
import {
	Game,
	Level,
	Question,
	Stage,
	LevelInput,
	QuestionInput,
	StageInput,
	Roadmap,
} from '../../entities'
import { GameInput } from '../../entities/game/game'
import { PaginationInput } from '../utils/pagination'
import {
	LANGUAGES,
	PaginatedGameResponse,
	SORT_OPTIONS,
	UpdateGame,
	NewGame,
	NewInstance,
} from './input'
import GameModel from './model'
import CommentModel from '../comment/model'
import GameProgressModel from '../gameProgress/model'
import { Deleted } from '../utils/output'
import { createQuestion as questionBuilder } from '../../tests/data/question-builder'
import { createRoadmap } from '../../tests/data/subgameroadmap-builder'

@Service() // Dependencies injection
export default class GameService {
	constructor(
		private readonly gameModel: GameModel,
		private readonly gameProgressModel: GameProgressModel,
		private readonly commentModel: CommentModel
	) {}

	public async getById(id: string) {
		const game = await this.gameModel.getById(id)
		if (!game) throw new Error('No game found')
		return game
	}

	public async createGame(gameInput: NewGame, userId: string) {
		const game: GameInput = {
			...gameInput,
			commentCount: 0,
			commentsRef: [],
			createdBy: userId,
			dateCreated: new Date().toISOString(),
			lastUpdated: new Date().toISOString(),
			totalStars: 0,
			roadmap: [],
			questions: [],
			levels: [],
			stages: [],
			playCount: 0,
			rating: 0,
		}
		const newGame = await this.gameModel.createGame(game)
		if (!game) throw new Error('Unable to create game')
		return newGame
	}

	public async getFilterGames(
		language: LANGUAGES | null,
		sort: SORT_OPTIONS | null,
		sortDir: number | null,
		pagination: PaginationInput
	): Promise<PaginatedGameResponse> {
		const games = await this.gameModel.getFilterGames(
			language,
			sortDir,
			sort,
			pagination
		)
		return games
	}

	public async getUserCreatedGames(userId: string) {
		const games = await this.gameModel.getGames({ createdBy: userId })
		return games
	}

	public async getSearch(
		query: string,
		pagination: PaginationInput
	): Promise<PaginatedGameResponse> {
		const results = await this.gameModel.search(query, pagination)
		return results
	}

	public async getLevel(levelId: string, gameId: string) {
		const game = await this.gameModel.findById(gameId)
		if (!game) throw new Error('Game not found')
		const gameLevels = game.levels
		for (var i = 0; i < gameLevels.length; i++) {
			if (gameLevels[i]._id.toHexString() === levelId)
				return gameLevels[i]
		}
		throw new Error('Level not found')
	}

	public async getStage(stageId: string, gameId: string) {
		const game = await this.gameModel.findById(gameId)
		if (!game) throw new Error('Game not found')
		const gameStages = game.stages
		for (var i = 0; i < gameStages.length; i++) {
			if (gameStages[i]._id.toHexString() === stageId)
				return gameStages[i]
		}
		throw new Error('Stage not found')
	}

	public async getQuestion(questionId: string, gameId: string) {
		const game = await this.gameModel.findById(gameId)
		if (!game) throw new Error('Game not found')
		const gameQuestions = game.questions
		for (var i = 0; i < gameQuestions.length; i++) {
			if (gameQuestions[i]._id.toHexString() === questionId)
				return gameQuestions[i]
		}
		throw new Error('Question not found')
	}

	public async getRoadmap(gameId: string) {
		const game = await this.gameModel.findById(gameId)
		if (!game) throw new Error('Game not found')
		if (!game.roadmap) throw new Error('Roadmap not found')
		else return game.roadmap
	}

	public async updateGame(newGameData: UpdateGame) {
		const {
			newCodingLanguage,
			newTitle,
			newDifficulty,
			newTags,
			newDescription,
		} = newGameData
		const oldGame = await this.gameModel.findById(
			newGameData.gameId.toHexString()
		)
		if (!oldGame)
			throw new Error(
				`Game could not be found with ID: ${newGameData.gameId}`
			)
		if (newCodingLanguage) oldGame.codingLanguage = newCodingLanguage
		if (newTitle) oldGame.title = newTitle
		if (newDifficulty) oldGame.difficulty = newDifficulty
		if (newTags) oldGame.tags = newTags
		if (newDescription) oldGame.description = newDescription
		const updatedGame = await oldGame.save()
		if (!updatedGame) throw new Error('Error updating levels')
		return updatedGame.toObject() as Game
	}

	public async createLevel(level: LevelInput, gameId: string) {
		const _id = new ObjectId()
		await this.gameModel.updateById(gameId, {
			$push: {
				levels: { ...level, _id },
			},
		})
		const game = await this.gameModel.findById(gameId)
		if (!game) throw new Error(`Game could not be found with ID: ${gameId}`)
		console.log(_id)
		const newLevel = game.levels.find(
			(l) => l._id.toHexString() === _id.toHexString()
		)
		if (!newLevel) throw new Error('Could not create level')
		return newLevel
	}

	public async createQuestion(question: QuestionInput, gameId: string) {
		const _id = new ObjectId()
		await this.gameModel.updateById(gameId, {
			$push: {
				questions: { ...question, _id },
			},
		})
		const game = await this.gameModel.findById(gameId)
		if (!game) throw new Error(`Game could not be found with ID: ${gameId}`)
		const newQuestion = game.questions.find(
			(l) => l._id.toHexString() === _id.toHexString()
		)
		if (!newQuestion) throw new Error('Could not create question')
		return newQuestion
	}

	public async createStage(stage: StageInput, gameId: string) {
		const _id = new ObjectId()
		await this.gameModel.updateById(gameId, {
			$push: {
				stages: { ...stage, _id },
			},
		})
		const game = await this.gameModel.findById(gameId)
		if (!game) throw new Error(`Game could not be found with ID: ${gameId}`)
		const newStage = game.stages.find(
			(l) => l._id.toHexString() === _id.toHexString()
		)
		if (!newStage) throw new Error('Could not create stage')
		return newStage
	}

	public async updateRoadmap(newRoadmap: Roadmap[], gameId: string) {
		await this.gameModel.updateById(gameId, {
			$set: {
				roadmap: newRoadmap,
			},
		})
		const game = await this.gameModel.findById(gameId)
		if (!game) throw new Error(`Game could not be found with ID: ${gameId}`)
		return game.roadmap
	}

	public async updateLevels(levelsToUpdate: Level[], gameId: string) {
		var game = await this.gameModel.findById(gameId)
		if (!game) throw new Error(`Game could not be found with ID: ${gameId}`)
		const oldLevelArray = game.levels
		if (!oldLevelArray)
			throw new Error(`Levels could not be found with ID: ${gameId}`)
		for (var i = 0; i < oldLevelArray.length; i++) {
			for (var j = 0; j < levelsToUpdate.length; j++) {
				if (oldLevelArray[i]._id.equals(levelsToUpdate[j]._id))
					oldLevelArray[i] = levelsToUpdate[j]
			}
		}
		const newGame = await game.save()
		if (!newGame) throw new Error('Error updating levels')
		return game.levels
	}

	public async updateQuestions(
		questionsToUpdate: Question[],
		gameId: string
	) {
		var game = await this.gameModel.findById(gameId)
		if (!game) throw new Error(`Game could not be found with ID: ${gameId}`)
		const oldQuestionArray = game.questions
		if (!oldQuestionArray)
			throw new Error(`Questions could not be found with ID: ${gameId}`)
		for (var i = 0; i < oldQuestionArray.length; i++) {
			for (var j = 0; j < questionsToUpdate.length; j++) {
				if (oldQuestionArray[i]._id.equals(questionsToUpdate[j]._id))
					oldQuestionArray[i] = questionsToUpdate[j]
			}
		}
		const newGame = await game.save()
		if (!newGame) throw new Error('Error updating questions')
		return game.questions
	}

	public async updateStages(stagesToUpdate: Stage[], gameId: string) {
		var game = await this.gameModel.findById(gameId)
		if (!game) throw new Error(`Game could not be found with ID: ${gameId}`)
		const oldStageArray = game.stages
		if (!oldStageArray)
			throw new Error(`Stages could not be found with ID: ${gameId}`)
		for (var i = 0; i < oldStageArray.length; i++) {
			for (var j = 0; j < stagesToUpdate.length; j++) {
				if (oldStageArray[i]._id.equals(stagesToUpdate[j]._id))
					oldStageArray[i] = stagesToUpdate[j]
			}
		}
		const newGame = await game.save()
		if (!newGame) throw new Error('Error updating stages')
		return game.stages
	}

	/**
	 * Deletes the game as well as all comments and game progress related to game
	 * @param gameId String id of game to be deleted
	 */
	public async deleteGame(gameId: string, userId: string) {
		const toReturn: Deleted = {
			success: false,
			err: null,
			amountDeleted: 0,
		}
		try {
			// Check if game exists
			const gameExists = await this.gameModel.findById(gameId)
			if (!gameExists) throw new Error('Game not found')

			// Check if user owns game
			if (gameExists.createdBy !== userId)
				throw new Error('Game is not owned by specified user')

			// Delete game comments
			const commentsDeleted = await this.commentModel.deleteMany({
				gameId,
			})
			if (commentsDeleted.ok !== 1)
				throw new Error('Error deleting comments on game')
			toReturn.amountDeleted += commentsDeleted.deletedCount!

			// Delete game progress
			const progressDeleted = await this.gameProgressModel.deleteMany({
				gameId,
			})
			if (progressDeleted.ok !== 1)
				throw new Error('Error deleting game progress for game')
			toReturn.amountDeleted += progressDeleted.deletedCount!

			// Delete game
			const gameDeleted = await this.gameModel.deleteGame({
				_id: new ObjectId(gameId),
			})
			if (gameDeleted.ok !== 1) throw new Error('Error deleting game')
			toReturn.amountDeleted += gameDeleted.deletedCount!
		} catch (err) {
			if (err instanceof Error) {
				toReturn.err = err.message
				return toReturn
			} else {
				toReturn.err = 'An unexpected error has occured'
				return toReturn
			}
		}
		toReturn.success = true
		return toReturn
	}

	public async createInstance(
		newInstance: NewInstance,
		gameId: string,
		userId: ObjectId
	) {
		// Get game
		const game = await this.gameModel.findById(gameId)
		if (!game)
			throw new Error(
				`Game does not exist with the following ID: ${gameId}`
			)
		let currentIndex: number = -1
		let subroadmap: Roadmap
		switch (newInstance.kind) {
			case 'Question':
				if (!newInstance.roadmapId)
					throw new Error(
						'A Question cannot be added as a top level component.'
					)
				// Create a new question
				const newQuestion = questionBuilder({
					title: newInstance.title,
					description: 'Add a description for the question here...',
					points: 50,
					timeLimit: 60000,
				})
				// Find current subroadmap
				currentIndex = game.roadmap.findIndex(
					(element) =>
						element._id.toHexString() === newInstance.roadmapId
				)
				if (currentIndex === -1)
					throw new Error(
						`The roadmap could not be found for the given roadmapId arguement: ${newInstance.roadmapId}`
					)
				// Create subroadmap
				subroadmap = createRoadmap({
					sequence: currentIndex + 1,
					kind: newInstance.kind,
					refId: newQuestion._id.toHexString(),
				})
				// Add parentId to subroadmap
				for (var i = currentIndex; i != -1; i--) {
					if (game.roadmap[i].kind !== 'Question') {
						subroadmap.parent = game.roadmap[i]._id
						break
					}
				}
				if (!subroadmap.parent)
					throw new Error(
						`A higher level type (Stage or Level) could not be found above where the Question is to be added. Questions must be added under Stages or Levels.`
					)
				// Insert question and subroadmap
				game.questions.push(newQuestion)
				game.roadmap = game.roadmap.map((element) => {
					if (element.sequence >= currentIndex + 1) {
						element.sequence += 1
					}
					return element
				})
				game.roadmap.splice(currentIndex + 1, 0, subroadmap)
				break
			case 'Stage':
				if (!newInstance.roadmapId)
					throw new Error(
						'A Stage cannot be added as a top level component.'
					)
				// Create a stage
				const newStage: Stage = {
					_id: new ObjectId(),
					title: newInstance.title,
					description: 'Add your Stage description here...',
				}
				// Find current subroadmap
				currentIndex = game.roadmap.findIndex(
					(element) =>
						element._id.toHexString() === newInstance.roadmapId
				)
				if (currentIndex === -1)
					throw new Error(
						`The roadmap could not be found for the given roadmapId arguement: ${newInstance.roadmapId}`
					)
				// Create subroadmap
				subroadmap = createRoadmap({
					sequence: currentIndex + 1,
					kind: newInstance.kind,
					refId: newStage._id.toHexString(),
				})
				// Add parentId to subroadmap
				for (var i = currentIndex; i != -1; i--) {
					if (
						game.roadmap[i].kind !== 'Question' &&
						game.roadmap[i].kind !== 'Stage'
					) {
						subroadmap.parent = game.roadmap[i]._id
						break
					}
				}
				if (!subroadmap.parent)
					throw new Error(
						`A higher level type (Level) could not be found above where the Stage is to be added. Stages must be added under Levels.`
					)
				// Insert stage and subroadmap
				game.stages.push(newStage)
				game.roadmap = game.roadmap.map((element) => {
					if (element.sequence >= currentIndex + 1) {
						element.sequence += 1
					}
					return element
				})
				game.roadmap.splice(currentIndex + 1, 0, subroadmap)
				break
			case 'Level':
				const newLevel: Level = {
					_id: new ObjectId(),
					title: newInstance.title,
					description: 'Add your level description here...',
				}
				// Create subroadmap
				subroadmap = createRoadmap({
					sequence: 0,
					kind: newInstance.kind,
					refId: newLevel._id.toHexString(),
					parent: undefined,
				})
				currentIndex = -1
				// Insert level and subroadmap
				game.levels.push(newLevel)
				game.roadmap = game.roadmap.map((element) => {
					element.sequence += 1
					return element
				})
				game.roadmap.splice(0, 0, subroadmap)
				break
			default:
				throw new Error(
					`Cannot add unknown instance type: ${newInstance.kind}`
				)
		}
		const savedGame = await game.save()
		if (!savedGame) throw new Error('Error updating roadmap')
		return game.roadmap[currentIndex + 1]
	}
}
