import { ObjectId } from 'mongodb'
import { Query, Resolver, Arg, Mutation, InputType, UseMiddleware } from 'type-graphql'
import { Service } from 'typedi'
import { GameProgress } from '../../entities'
import { isLoggedIn } from '../middleware/isLoggedIn'
import { GameProgressMongooseModel } from './model'
import GameProgressService from './service'

@Service() // Dependencies injection
@Resolver((of) => GameProgress)
export default class GameProgressResolver {
	constructor(private readonly gameprogressService: GameProgressService) {}
	@Query((returns) => GameProgress, { nullable: true })
	async getGameProgress(@Arg('id') id: ObjectId) {
		const GameProgress = await this.gameprogressService.getById(id)

		return GameProgress
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
