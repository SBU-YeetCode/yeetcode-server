import { ObjectId } from 'mongodb'
import {
	Arg,
	Args,
	FieldResolver,
	Mutation,
	Query,
	Resolver,
	Root,
} from 'type-graphql'
import { Service } from 'typedi'
import { Game, GameProgress, QuestionProgress } from '../../entities'
import GameService from '../game/service'
import { canEdit } from '../middleware/canEdit'
import { Deleted, SubmitQuestion } from '../utils/output'
import {
	CreateGameProgress,
	DeleteGameProgress,
	SubmitGameInput,
} from './input'
import GameProgressService from './service'

@Service() // Dependencies injection
@Resolver((of) => GameProgress)
export default class GameProgressResolver {
	constructor(
		private readonly gameProgressService: GameProgressService,
		private readonly gameService: GameService
	) {}

	@FieldResolver(() => Game)
	async game(@Root() gameProgress: GameProgress) {
		const game = await this.gameService.getById(gameProgress.gameId)
		return game
	}

	@Query((returns) => GameProgress, { nullable: true })
	async getGameProgress(@Arg('id') id: ObjectId) {
		const GameProgress = await this.gameProgressService.getById(id)

		return GameProgress
	}

	@canEdit()
	@Query((returns) => GameProgress, { nullable: true })
	async getGameProgressByUser(
		@Arg('userId') userId: ObjectId,
		@Arg('gameId') gameId: ObjectId
	) {
		const GameProgress = await this.gameProgressService.getByUserId(
			userId,
			gameId
		)
		return GameProgress
	}

	@Query((returns) => [GameProgress])
	async getUserCompletedGames(@Arg('userId') userId: string) {
		const userCreatedGames = await this.gameProgressService.getUserCompletedGames(
			userId
		)
		return userCreatedGames
	}

	@Query((returns) => [GameProgress])
	async getUserRecentGames(@Arg('userId') userId: string) {
		const userCreatedGames = await this.gameProgressService.getUserRecentGames(
			userId
		)
		return userCreatedGames
	}

	@canEdit()
	@Mutation((returns) => GameProgress)
	async createGameProgress(@Args() { gameId, userId }: CreateGameProgress) {
		const newGameProgress = await this.gameProgressService.createGameProgress(
			userId.toHexString(),
			gameId
		)
		return newGameProgress
	}

	@canEdit()
	@Mutation((returns) => Deleted)
	async deleteGameProgress(
		@Args() { gameProgressId, userId }: DeleteGameProgress
	) {
		const newGameProgress = await this.gameProgressService.deleteGameProgress(
			userId,
			gameProgressId
		)
		return newGameProgress
	}

	@canEdit()
	@Mutation((returns) => QuestionProgress)
	async updateQuestionProgress(
		@Arg('userId') userId: ObjectId,
		@Arg('gameId') gameId: string,
		@Arg('questionProgress') questionProgress: QuestionProgress
	) {
		const updatedGameProgress = await this.gameProgressService.updateQuestionProgress(
			userId.toHexString(),
			gameId,
			questionProgress
		)
		return updatedGameProgress
	}

	@canEdit()
	@Mutation((returns) => SubmitQuestion)
	async submitQuestion(
		@Args() { userId, gameId, questionId, submittedAnswer }: SubmitGameInput
	) {
		const submitted = (await this.gameProgressService.submitQuestion(
			userId.toHexString(),
			gameId,
			questionId,
			submittedAnswer
		)) as SubmitQuestion
		return submitted
	}

	@canEdit()
	@Mutation((returns) => GameProgress)
	async revealHints(
		@Arg('userId') _: ObjectId,
		@Arg('gameProgressId') gameProgressId: ObjectId,
		@Arg('questionId') questionId: string
	) {
		const gameProgress = await this.gameProgressService.revealHints(gameProgressId, questionId)
		return gameProgress
	}
}
