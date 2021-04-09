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
	Args,
} from 'type-graphql'
import { Service } from 'typedi'
import { GameProgress, Game } from '../../entities'
import {CreateGameProgress} from './input'
import GameProgressService from './service'
import GameService from '../game/service'
import { canEdit } from '../middleware/canEdit'

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

	@canEdit()
	@Mutation((returns) => GameProgress)
	async createGameProgress(@Args() {gameId, userId}: CreateGameProgress) {
		const newGameProgress = await this.gameprogressService.createGameProgress(
			userId.toHexString(), gameId
		)
		return newGameProgress
	}
}
