import { ObjectId } from 'mongodb'
import { Service } from 'typedi'
import { Game, Level, Question, Stage } from '../../entities'
import { GameInput } from '../../entities/game/game'
import { PaginationInput } from '../utils/pagination'
import { LANGUAGES, PaginatedGameResponse, SORT_OPTIONS } from './input'
import GameModel from './model'
import UserModel from '../user/model'

@Service() // Dependencies injection
export default class GameService {
	constructor(
		private readonly gameModel: GameModel,
		private readonly userModel: UserModel
	) {}
	public async getById(id: string) {
		const game = await this.gameModel.getById(id)
		if (!game) throw new Error('No game found')
		return game
	}

	public async createGame(game: GameInput) {
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

	public async updateLevels(levelsToUpdate: Level[], gameId: string) {
		var game = await this.gameModel.findById(gameId)
		if (!game)
			throw new Error(`Game could not be found with ID: ${gameId}`)
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

	public async updateQuestions(questionsToUpdate: Question[], gameId: string) {
		var game = await this.gameModel.findById(gameId)
		if (!game)
			throw new Error(`Game could not be found with ID: ${gameId}`)
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
		if (!game)
			throw new Error(`Game could not be found with ID: ${gameId}`)
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
}
