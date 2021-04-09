import { ApolloServer, gql } from 'apollo-server-express'
import { createTestClient } from 'apollo-server-testing'
import { GraphQLSchema } from 'graphql'
import { Game, GameProgress, Level, Question, Stage } from '../../entities'
import { PaginatedGameResponse } from '../../modules/game/input'
import { GameMongooseModel } from '../../modules/game/model'
import { GameProgressMongooseModel } from '../../modules/gameProgress/model'
import { UserMongooseModel } from '../../modules/user/model'
import { buildSchema } from '../../utils'
import { createGame } from '../data/game-builder'
import { createGameProgress } from '../data/gameProgress-builder'
import { createLevel } from '../data/level-builder'
import { createQuestion } from '../data/question-builder'
import { createStage } from '../data/stage-builder'
import { createUser } from '../data/user-builder'
import buildGameProgress from '../../modules/gameProgress/utils/buildGameProgress'
import {
	clearDatabase,
	closeDatabase,
	connect,
	populateDatabase,
} from '../utils'

afterEach(async (done) => {
	await clearDatabase()
	done()
})

afterAll(async (done) => {
	await closeDatabase()
	done()
})

describe('Game Progress', () => {
	let graphqlSchema: GraphQLSchema
	beforeAll(async (done) => {
		connect()
		graphqlSchema = await buildSchema()
		done()
	})

	it('should get game progress for completed games in db', async () => {
		// Create User
		const user = createUser({})
		let gamesProgress: GameProgress[] = []
		for (let i = 0; i < 5; i++) {
			// Generate 5 games
			gamesProgress.push(
				createGameProgress({
					userId: user._id.toHexString(),
					isCompleted: false,
				})
			)
		}
		gamesProgress[1].isCompleted = true
		// Send data to db
		await populateDatabase(GameProgressMongooseModel, gamesProgress)
		await populateDatabase(UserMongooseModel, [user])
		const server = new ApolloServer({ schema: graphqlSchema }) as any
		// use the test server to create a query function
		const { query } = createTestClient(server)
		const res = await query<{ getUserCompletedGames: GameProgress[] }>({
			query: GET_USER_COMPLETED_GAMES,
			variables: { userId: user._id.toHexString() },
		})
		const {
			_id,
			levels,
			questions,
			stages,
			...gameProgressToMatch
		} = gamesProgress[1]
		expect(res.data?.getUserCompletedGames.length).toEqual(1)
		expect(res.data?.getUserCompletedGames[0]).toEqual(gameProgressToMatch)
	})

	it('should get no game progress for completed games in db', async () => {
		// Create User
		const user = createUser({})
		let gamesProgress: GameProgress[] = []
		for (let i = 0; i < 5; i++) {
			// Generate 5 games
			gamesProgress.push(
				createGameProgress({
					userId: user._id.toHexString(),
					isCompleted: false,
				})
			)
		}
		// Send data to db
		await populateDatabase(GameProgressMongooseModel, gamesProgress)
		await populateDatabase(UserMongooseModel, [user])
		const server = new ApolloServer({ schema: graphqlSchema }) as any
		// use the test server to create a query function
		const { query } = createTestClient(server)
		const res = await query<{ getUserCompletedGames: GameProgress[] }>({
			query: GET_USER_COMPLETED_GAMES,
			variables: { userId: user._id.toHexString() },
		})
		expect(res.data?.getUserCompletedGames.length).toEqual(0)
	})

	it('should get games played by user in db', async () => {
		// Create User
		const user = createUser({})
		const gameProgress = createGameProgress({
			userId: user._id.toHexString(),
			isCompleted: false,
		})
		// Add game[1] to user's played games array

		await populateDatabase(UserMongooseModel, [user])
		await populateDatabase(GameProgressMongooseModel, [gameProgress])
		const server = new ApolloServer({ schema: graphqlSchema }) as any
		// use the test server to create a query function
		const { query } = createTestClient(server)
		const res = await query<{ getUserRecentGames: GameProgress[] }>({
			query: GET_USER_RECENT_GAMES,
			variables: { userId: user._id.toHexString() },
		})
		const {
			_id,
			levels,
			questions,
			stages,
			...gameProgressToMatch
		} = gameProgress
		expect(res.data?.getUserRecentGames.length).toEqual(1)
		expect(res.data?.getUserRecentGames[0]).toEqual(gameProgressToMatch)
	})

	it('should get no games played by user in db', async () => {
		// Create User
		const user = createUser({})
		let games: Game[] = []
		for (let i = 0; i < 5; i++) {
			// Generate 5 games
			games.push(createGame({}))
		}
		// Send data to db
		await populateDatabase(GameMongooseModel, games)
		await populateDatabase(UserMongooseModel, [user])
		const server = new ApolloServer({ schema: graphqlSchema }) as any
		// use the test server to create a query function
		const { query } = createTestClient(server)
		const res = await query<{ getUserRecentGames: Game[] }>({
			query: GET_USER_RECENT_GAMES,
			variables: { userId: user._id.toHexString() },
		})
		expect(res.data?.getUserRecentGames.length).toEqual(0)
	})

	it('should create a new game progress in the database', async () => {
		const user = createUser({})
		const game = createGame({
			levels: [createLevel()],
			createdBy: user._id.toHexString(),
		})

		await populateDatabase(UserMongooseModel, [user])
		await populateDatabase(GameMongooseModel, [game])

		const graphqlSchema = await buildSchema()
		const server = new ApolloServer({
			schema: graphqlSchema,
			context: () => ({
				req: { user },
			}),
		}) as any

		const { query } = createTestClient(server)

		const res = await query({
			query: CREATE_GAME_PROGRESS,
			variables: {
				userId: user._id,
				gameId: game._id.toHexString(),
			},
		})
		const {questions, stages, ...expected} = buildGameProgress(game, user._id.toHexString())
		const toMatch = res?.data?.createGameProgress
		expect ({...toMatch, levels: Array.from(toMatch.levels)}).toEqual(expected)
	})
})

const GET_USER_RECENT_GAMES = gql`
	query getUserRecentGames($userId: String!) {
		getUserRecentGames(userId: $userId) {
			userId
			completedAt
			isCompleted
			startedAt
			gameId
		}
	}
`

const GET_USER_COMPLETED_GAMES = gql`
	query getUserCompletedGames($userId: String!) {
		getUserCompletedGames(userId: $userId) {
			userId
			completedAt
			isCompleted
			startedAt
			gameId
		}
	}
`

const CREATE_GAME_PROGRESS = gql`

	mutation createGameProgress($userId: ObjectId!, $gameId: String!) {
		createGameProgress(userId: $userId, gameId:$gameId) {
			userId
			completedAt
			isCompleted
			gameId
			levels {
				completed
				levelId
			}

		}
	}

`
