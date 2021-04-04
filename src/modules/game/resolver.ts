import { ObjectId } from 'mongodb'
import { Query, Resolver, Arg, Mutation, Args } from 'type-graphql'
import { Service } from 'typedi'
import { Game } from '../../entities'
import GameService from './service'
import { LANGUAGES, SORT_OPTIONS, GetFilterGamesInput } from './input'
import { PaginatedGameResponse } from './input'
import { PaginationInput } from '../utils/pagination'
import { GameInput } from '../../entities/game/game'

@Service() // Dependencies injection
@Resolver((of) => Game)
export default class GameResolver {
	constructor(private readonly gameService: GameService) {}
	@Query((returns) => Game, { nullable: true })
	async getGame(@Arg('id') id: string) {
		const Game = await this.gameService.getById(id)

		return Game
	}

	@Query((returns) => PaginatedGameResponse)
	async getFilterGames(
		@Args() { language, sort, sortDir }: GetFilterGamesInput,
		@Args() pagination: PaginationInput
	) {
		const filterGames = await this.gameService.getFilterGames(
			language,
			sort,
			sortDir,
			pagination
		)
		return filterGames
	}
	@Query((returns) => [Game])
	async getUserCreatedGames(@Arg('userId') userId: string) {
		const userCreatedGames = await this.gameService.getUserCreatedGames(
			userId
		)
		return userCreatedGames
	}

	@Query((returns) => [Game])
	async getUserCompletedGames(@Arg('userId') userId: string) {
		const userCreatedGames = await this.gameService.getUserCompletedGames(
			userId
		)
		return userCreatedGames
	}

	@Query((returns) => [Game])
	async getUserRecentGames(@Arg('userId') userId: string) {
		const userCreatedGames = await this.gameService.getUserRecentGames(
			userId
		)
		return userCreatedGames
	}

	@Query((returns) => Game)
	async getLevel(
		@Arg('levelId') levelId: string,
		@Arg('gameId') gameId: string
	) {
		const level = await this.gameService.getLevel(levelId, gameId)
		return level
	}

	@Query((returns) => Game)
	async getStage(
		@Arg('stageId') stageId: string,
		@Arg('gameId') gameId: string
	) {
		const stage = await this.gameService.getStage(stageId, gameId)
		return stage
	}

	@Mutation((returns) => Game)
	async createGame(@Arg('game') game: GameInput) {
		const newGame = await this.gameService.createGame(game)
		return newGame
	}
}
