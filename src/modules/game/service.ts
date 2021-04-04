import { ObjectId } from 'mongodb'
import { Service } from 'typedi'
import { Game } from '../../entities'
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
		const user = await this.userModel.findById(new ObjectId(userId))
		if (!user) throw new Error('User not found')
		const createdGameIds = user.gamesCreated
		const userCreatedGames: Game[] = []
		for (var i = 0; i < createdGameIds.length; i++) {
			const game = await this.gameModel.findById(createdGameIds[i])
			if (game) userCreatedGames.push(game)
		}
		return userCreatedGames
	}

	public async getUserCompletedGames(userId: string) {
		const user = await this.userModel.findById(new ObjectId(userId))
		if (!user) throw new Error('User not found')
		const gameCompletedIds = user.gamesCompleted
		const userCompletedGames: Game[] = []
		for (var i = 0; i < gameCompletedIds.length; i++) {
			const game = await this.gameModel.findById(gameCompletedIds[i])
			if (game) userCompletedGames.push(game)
		}
		return userCompletedGames
	}
}
