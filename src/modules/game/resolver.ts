import { ObjectId } from 'mongodb'
import { Query, Resolver, Arg, Mutation, InputType } from 'type-graphql'
import { Service } from 'typedi'
import { Game } from '../../entities'
import { GameMongooseModel } from './model'
import GameService from './service'

@Service() // Dependencies injection
@Resolver((of) => Game)
export default class GameResolver {
	constructor(private readonly gameService: GameService) {}
	@Query((returns) => Game, { nullable: true })
	async getGame(@Arg('id') id: ObjectId) {
		const Game = await this.gameService.getById(id)

		return Game
	}

	@Mutation((returns) => Game)
	async createGame(@Arg('game') game: Game) {
		const newGame = await this.gameService.createGame(game)
		return newGame
	}
}