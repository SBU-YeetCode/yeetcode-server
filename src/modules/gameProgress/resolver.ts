import { ObjectId } from 'mongodb'
import {
	Query,
	Resolver,
	Arg,
	Mutation,
	InputType,
	UseMiddleware,
	FieldResolver,
	Root,
} from 'type-graphql'
import { Service } from 'typedi'
import { GameProgress, Game } from '../../entities'
import { isLoggedIn } from '../middleware/isLoggedIn'
import { GameProgressMongooseModel } from './model'
import GameProgressService from './service'
import GameService from '../game/service'

@Service() // Dependencies injection
@Resolver((of) => GameProgress)
export default class GameProgressResolver {
	constructor(
		private readonly gameprogressService: GameProgressService,
		private readonly gameService: GameService
	) {}

	@FieldResolver(() => Game)
	async game(@Root() gameProgress: GameProgress) {
		const game = await this.gameService.getById(
			gameProgress._id.toHexString()
		)
		return game
	}

	@Query((returns) => GameProgress, { nullable: true })
	async getGameProgress(@Arg('id') id: ObjectId) {
		const GameProgress = await this.gameprogressService.getById(id)

		return GameProgress
	}

	@Query((returns) => [GameProgress])
	async getUserCompletedGames(@Arg('userId') userId: string) {
		const userCreatedGames = await this.gameprogressService.getUserCompletedGames(
			userId
		)
		return userCreatedGames
	}

	@Query((returns) => [GameProgress])
	async getUserRecentGames(@Arg('userId') userId: string) {
		const userCreatedGames = await this.gameprogressService.getUserRecentGames(
			userId
		)
		return userCreatedGames
	}

	@UseMiddleware(isLoggedIn)
	@Mutation((returns) => GameProgress)
	async createGameProgress(@Arg('gameprogress') gameprogress: GameProgress) {
		const newGameProgress = await this.gameprogressService.createGameProgress(
			gameprogress
		)
		return newGameProgress
	}
}
