import { ObjectId } from 'mongodb'
import {
	Query,
	Resolver,
	Arg,
	Mutation,
	Args,
	UseMiddleware,
	FieldResolver,
	Ctx,
} from 'type-graphql'
import { Service } from 'typedi'
import {
	Game,
	Level,
	Stage,
	Question,
	Roadmap,
	LevelInput,
	StageInput,
	QuestionInput,
	RoadmapInput,
} from '../../entities'
import GameService from './service'
import {
	LANGUAGES,
	SORT_OPTIONS,
	GetFilterGamesInput,
	UpdateGame,
	NewGame,
	NewInstance,
} from './input'
import { PaginatedGameResponse } from './input'
import { PaginationInput } from '../utils/pagination'
import { GameInput } from '../../entities/game/game'
import { isLoggedIn } from '../middleware/isLoggedIn'
import { Deleted } from '../utils/output'
import { canEdit } from '../middleware/canEdit'

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

	@Query((returns) => PaginatedGameResponse)
	async getSearch(
		@Arg('query') query: string,
		@Args() pagination: PaginationInput
	): Promise<PaginatedGameResponse> {
		const searchResult = await this.gameService.getSearch(query, pagination)
		return searchResult
	}

	@Query((returns) => [Game])
	async getUserCreatedGames(@Arg('userId') userId: string) {
		const userCreatedGames = await this.gameService.getUserCreatedGames(
			userId
		)
		return userCreatedGames
	}

	// @Query((returns) => [Game])
	// async getUserCompletedGames(@Arg('userId') userId: string) {
	// 	const userCreatedGames = await this.gameService.getUserCompletedGames(
	// 		userId
	// 	)
	// 	return userCreatedGames
	// }

	// @Query((returns) => [Game])
	// async getUserRecentGames(@Arg('userId') userId: string) {
	// 	const userCreatedGames = await this.gameService.getUserRecentGames(
	// 		userId
	// 	)
	// 	return userCreatedGames
	// }

	@Query((returns) => Level)
	async getLevel(
		@Arg('levelId') levelId: string,
		@Arg('gameId') gameId: string
	) {
		const level = await this.gameService.getLevel(levelId, gameId)
		return level
	}

	@Query((returns) => Stage)
	async getStage(
		@Arg('stageId') stageId: string,
		@Arg('gameId') gameId: string
	) {
		const stage = await this.gameService.getStage(stageId, gameId)
		return stage
	}

	@Query((returns) => Question)
	async getQuestion(
		@Arg('questionId') questionId: string,
		@Arg('gameId') gameId: string
	) {
		const question = await this.gameService.getQuestion(questionId, gameId)
		return question
	}

	@Query((returns) => [Roadmap])
	async getRoadmap(@Arg('gameId') gameId: string) {
		const roadmap = await this.gameService.getRoadmap(gameId)
		return roadmap
	}

	@UseMiddleware(isLoggedIn)
	@Mutation((returns) => Game)
	async createGame(@Args() game: NewGame, @Ctx() { req }: Context) {
		const userId = req.user._id.toHexString() as string
		const newGame = await this.gameService.createGame(game, userId)
		return newGame
	}

	@Mutation((returns) => Game)
	async updateGame(@Args() newGameData: UpdateGame) {
		const updatedGame = await this.gameService.updateGame(newGameData)
		return updatedGame
	}

	@Mutation((returns) => [Roadmap])
	async updateRoadmap(
		@Arg('roadmap', () => [RoadmapInput]) roadmap: Roadmap[],
		@Arg('gameId') gameId: string
	) {
		return this.gameService.updateRoadmap(roadmap, gameId)
	}

	@Mutation((returns) => [Level])
	async updateLevels(
		@Arg('levelsToUpdate', () => [Level]) levelsToUpdate: Level[],
		@Arg('gameId') gameId: string
	) {
		let allLevels = await this.gameService.updateLevels(
			levelsToUpdate,
			gameId
		)
		return allLevels
	}

	@Mutation((returns) => Level)
	async createLevel(
		@Arg('level', () => LevelInput) level: LevelInput,
		@Arg('gameId') gameId: string
	) {
		let newLevel = await this.gameService.createLevel(level, gameId)
		return newLevel
	}

	@Mutation((returns) => Question)
	async createQuestion(
		@Arg('question', () => QuestionInput) question: QuestionInput,
		@Arg('gameId') gameId: string
	) {
		let newQuestion = await this.gameService.createQuestion(
			question,
			gameId
		)
		return newQuestion
	}

	@Mutation((returns) => Stage)
	async createStage(
		@Arg('stage', () => StageInput) stage: StageInput,
		@Arg('gameId') gameId: string
	) {
		let newStage = await this.gameService.createStage(stage, gameId)
		return newStage
	}

	/**
	 * Create instance
	 *  title, kind: "Question" | "stage" etc, --parentId--, sequence
	 */
	@Mutation((returns) => Roadmap, {
		description: 'Used to create a Level, Stage, or Question',
	})
	async createInstance(
		@Args() newInstance: NewInstance,
		@Arg('gameId') gameId: string,
		@Arg('userId') userId: ObjectId
	) {
		const updatedRoadmap = await this.gameService.createInstance(
			newInstance,
			gameId,
			userId
		)
		return updatedRoadmap
	}

	@Mutation((returns) => [Question])
	async updateQuestions(
		@Arg('questionsToUpdate', () => [Question])
		questionsToUpdate: Question[],
		@Arg('gameId') gameId: string
	) {
		let allQuestions = await this.gameService.updateQuestions(
			questionsToUpdate,
			gameId
		)
		return allQuestions
	}

	@Mutation((returns) => [Stage])
	async updateStages(
		@Arg('stagesToUpdate', () => [Stage]) stagesToUpdate: Stage[],
		@Arg('gameId') gameId: string
	) {
		let allStages = await this.gameService.updateStages(
			stagesToUpdate,
			gameId
		)
		return allStages
	}

	@Mutation(() => Deleted)
	@canEdit()
	async deleteGame(
		@Arg('gameId') gameId: string,
		@Arg('userId') userId: ObjectId
	) {
		const deletedObj = await this.gameService.deleteGame(
			gameId,
			userId.toHexString()
		)
		return deletedObj
	}
}
