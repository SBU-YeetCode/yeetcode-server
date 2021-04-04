import { ApolloServer, gql } from 'apollo-server-express'
import { createTestClient } from 'apollo-server-testing'
import { GraphQLSchema } from 'graphql'
import { Game, Level, Stage, Question } from '../../entities'
import { PaginatedGameResponse } from '../../modules/game/input'
import { GameMongooseModel } from '../../modules/game/model'
import { UserMongooseModel } from '../../modules/user/model'
import { buildSchema } from '../../utils'
import { createGame } from '../data/game-builder'
import { createUser } from '../data/user-builder'
import { createLevel } from '../data/level-builder'
import { createStage } from '../data/stage-builder'
import { createQuestion } from '../data/question-builder'
import {
	clearDatabase,
	closeDatabase,
	connect,
	populateDatabase,
} from '../utils'

// beforeEach(async () => {
// 	await populateDatabase(WcifMongooseModel, [wcif1])
// })

afterEach(async (done) => {
	await clearDatabase()
	done()
})

afterAll(async (done) => {
	await closeDatabase()
	done()
})

describe('Game', () => {
	let graphqlSchema: GraphQLSchema
	beforeAll(async (done) => {
		connect()
		graphqlSchema = await buildSchema()
		done()
	})

	it('should get games created by user in db', async () => {
		// Create User
		const user = createUser({})
		let games: Game[] = []
		for (let i = 0; i < 5; i++) {
			// Generate 5 games
			games.push(createGame({}))
		}
		// Set games from index 1 to have desired user id
		games[1].createdBy = user._id.toHexString()
		// Add this game is user's created games array
		user.gamesCreated.push(games[1]._id.toHexString())
		// Send data to db
		await populateDatabase(GameMongooseModel, games)
		await populateDatabase(UserMongooseModel, [user])
		const server = new ApolloServer({ schema: graphqlSchema }) as any
		// use the test server to create a query function
		const { query } = createTestClient(server)
		const res = await query<{ getUserCreatedGames: Game[] }>({
			query: GET_USER_CREATED_GAMES,
			variables: { userId: user._id.toHexString() },
		})
		const {
			_id,
			questions,
			stages,
			levels,
			roadmap,
			...gamesToMatch
		} = games[1]
		expect(res.data?.getUserCreatedGames.length).toEqual(1)
		expect(res.data?.getUserCreatedGames[0]).toEqual(gamesToMatch)
	})

	it('should get no games created by user in db', async () => {
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
		const res = await query<{ getUserCreatedGames: Game[] }>({
			query: GET_USER_CREATED_GAMES,
			variables: { userId: user._id.toHexString() },
		})
		expect(res.data?.getUserCreatedGames.length).toEqual(0)
	})

	it('should get game completed by user in db', async () => {
		// Create User
		const user = createUser({})
		let games: Game[] = []
		for (let i = 0; i < 5; i++) {
			// Generate 5 games
			games.push(createGame({}))
		}
		// Add this game to user's completed games array
		user.gamesCompleted.push(games[1]._id.toHexString())
		// Send data to db
		await populateDatabase(GameMongooseModel, games)
		await populateDatabase(UserMongooseModel, [user])
		const server = new ApolloServer({ schema: graphqlSchema }) as any
		// use the test server to create a query function
		const { query } = createTestClient(server)
		const res = await query<{ getUserCompletedGames: Game[] }>({
			query: GET_USER_COMPLETED_GAMES,
			variables: { userId: user._id.toHexString() },
		})
		const {
			_id,
			questions,
			stages,
			levels,
			roadmap,
			...gameToMatch
		} = games[1]
		expect(res.data?.getUserCompletedGames.length).toEqual(1)
		expect(res.data?.getUserCompletedGames[0]).toEqual(gameToMatch)
	})

	it('should get no games completed by user in db', async () => {
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
		const res = await query<{ getUserCompletedGames: Game[] }>({
			query: GET_USER_COMPLETED_GAMES,
			variables: { userId: user._id.toHexString() },
		})
		expect(res.data?.getUserCompletedGames.length).toEqual(0)
	})

	it('gets paginated filtered game results', async () => {
		const games: Game[] = []
		for (let i = 0; i < 15; i++) {
			games.push(
				createGame({ language: i < 10 ? 'javascript' : 'c', rating: i })
			)
		}
		await populateDatabase(GameMongooseModel, games)
		const server = new ApolloServer({ schema: graphqlSchema }) as any
		// use the test server to create a query function
		const { query } = createTestClient(server)
		const res = await query<{ getFilterGames: PaginatedGameResponse }>({
			query: GET_FILTER_GAMES,
			variables: {
				sort: 'RATING',
				sortDir: -1,
				amount: 9,
				language: 'JAVASCRIPT',
			},
		})
		const expected = games
			.filter((g) => g.language === 'javascript')
			.sort(
				(a: Game, b: Game) =>
					b.rating - a.rating ||
					parseInt(b._id.toHexString()) -
						parseInt(b._id.toHexString())
			)
			.map((g) => {
				const {
					_id,
					questions,
					stages,
					levels,
					roadmap,
					...gameToMatch
				} = g
				return { ...gameToMatch, _id: _id.toHexString() }
			})
		expect(res?.data?.getFilterGames.nodes).toEqual(
			expected.slice(0, expected.length - 1)
		)
		expect(res?.data?.getFilterGames.hasMore).toBeTruthy()
		expect(res?.data?.getFilterGames.nextCursor).toEqual(
			expected[expected.length - 2]._id
		)
	})
	
	it('should get a level in db', async () => {
		// Create Game
		let games: Game[] = []
		games.push(createGame({}))
		const game = games[0]
		for (let i = 0; i < 3; i++) {
			// Generate 3 levels
			game.levels.push(createLevel({}))
		}
		// Get the id of second level in the game
		const levelIdToCheck = game.levels[1]._id.toHexString()
		// Send data to db
		await populateDatabase(GameMongooseModel, games)
		const server = new ApolloServer({ schema: graphqlSchema }) as any
		// use the test server to create a query function
		const { query } = createTestClient(server)
		const res = await query<{ getLevel: Level }>({
			query: GET_LEVEL,
			variables: { levelId: levelIdToCheck, gameId: game._id.toHexString() },
		})
		expect(res.data?.getLevel._id).toEqual(levelIdToCheck)
	})

	it('should get a stage in db', async () => {
		// Create Game
		let games: Game[] = []
		games.push(createGame({}))
		const game = games[0]
		for (let i = 0; i < 3; i++) {
			// Generate 3 stages
			game.stages.push(createStage({}))
		}
		// Get the id of second stage in the game
		const stageIdToCheck = game.stages[1]._id.toHexString()
		// Send data to db
		await populateDatabase(GameMongooseModel, games)
		const server = new ApolloServer({ schema: graphqlSchema }) as any
		// use the test server to create a query function
		const { query } = createTestClient(server)
		const res = await query<{ getStage: Stage }>({
			query: GET_STAGE,
			variables: { stageId: stageIdToCheck, gameId: game._id.toHexString() },
		})
		expect(res.data?.getStage._id).toEqual(stageIdToCheck)
	})

	it('should get a question in db', async () => {
		// Create Game
		let games: Game[] = []
		games.push(createGame({}))
		const game = games[0]
		for (let i = 0; i < 3; i++) {
			// Generate 3 questions
			game.questions.push(createQuestion({}))
		}
		// Get the id of second question in the game
		const questionIdToCheck = game.questions[1]._id.toHexString()
		// Send data to db
		await populateDatabase(GameMongooseModel, games)
		const server = new ApolloServer({ schema: graphqlSchema }) as any
		// use the test server to create a query function
		const { query } = createTestClient(server)
		const res = await query<{ getQuestion: Question }>({
			query: GET_QUESTION,
			variables: { questionId: questionIdToCheck, gameId: game._id.toHexString() },
		})
		expect(res.data?.getQuestion._id).toEqual(questionIdToCheck)
	})
})

const GET_USER_COMPLETED_GAMES = gql`
	query getUserCompletedGames($userId: String!) {
		getUserCompletedGames(userId: $userId) {
			createdBy
			dateCreated
			lastUpdated
			commentCount
			totalStars
			playCount
			rating
			commentsRef
			title
			language
			difficulty
			tags
			description
		}
	}
`

const GET_USER_CREATED_GAMES = gql`
	query getUserCreatedGames($userId: String!) {
		getUserCreatedGames(userId: $userId) {
			createdBy
			dateCreated
			lastUpdated
			commentCount
			totalStars
			playCount
			rating
			commentsRef
			title
			language
			difficulty
			tags
			description
		}
	}
`
const GET_FILTER_GAMES = gql`
	query getFilterGames(
		$sort: SORT_OPTIONS
		$sortDir: Int
		$amount: Int
		$language: LANGUAGES
		$cursor: String
	) {
		getFilterGames(
			sort: $sort
			sortDir: $sortDir
			amount: $amount
			language: $language
			cursor: $cursor
		) {
			nodes {
				_id
				createdBy
				dateCreated
				lastUpdated
				commentCount
				totalStars
				playCount
				rating
				commentsRef
				title
				language
				difficulty
				tags
				description
			}
			hasMore
			nextCursor
		}
	}
`

const GET_LEVEL = gql`
	query getLevel($levelId: String!, $gameId: String!) {
		getLevel(levelId: $levelId, gameId: $gameId) {
			_id
			title
			description
		}
	}
`

const GET_STAGE = gql`
	query getStage($stageId: String!, $gameId: String!) {
		getStage(stageId: $stageId, gameId: $gameId) {
			_id
			title
			description
		}
	}
`

const GET_QUESTION = gql`
	query getQuestion($questionId: String!, $gameId: String!) {
		getQuestion(questionId: $questionId, gameId: $gameId) {
			_id
			title
			description
		}
	}
`
