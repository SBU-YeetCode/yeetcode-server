import { ApolloServer, gql } from 'apollo-server-express'
import { createTestClient } from 'apollo-server-testing'
import { GraphQLSchema } from 'graphql'
import { Game } from '../../entities'
import { PaginatedGameResponse } from '../../modules/game/input'
import { GameMongooseModel } from '../../modules/game/model'
import { UserMongooseModel } from '../../modules/user/model'
import { buildSchema } from '../../utils'
import { createGame } from '../data/game-builder'
import { createUser } from '../data/user-builder'
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
				createGame({
					codingLanguage: i < 10 ? 'javascript' : 'c',
					rating: i,
				})
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
			.filter((g) => g.codingLanguage === 'javascript')
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

	it('gets paginated search results', async () => {
		let matchingGames: Game[] = []
		let otherGames: Game[] = []
		matchingGames.push(
			createGame({
				codingLanguage: 'javascript',
				title: 'Saransh Grover Cubing',
			})
		)
		matchingGames.push(createGame({ description: 'saransh grover' }))
		matchingGames.push(createGame({ tags: ['javascript'] }))
		for (let i = 0; i < 15; i++) {
			otherGames.push(createGame({}))
		}
		await populateDatabase(GameMongooseModel, [
			...matchingGames,
			...otherGames,
		])
		const server = new ApolloServer({ schema: graphqlSchema }) as any
		const { query } = createTestClient(server)
		const res = await query<{ getSearch: PaginatedGameResponse }>({
			query: GET_SEARCH,
			variables: { query: 'Saransh javascript', amount: 10 },
		})
		const nodes = res?.data?.getSearch.nodes
		for (const node of nodes || []) {
			const gameId = matchingGames
				.find((g) => g._id.toHexString() === (node._id as any))
				?._id.toHexString()
			expect(gameId).toEqual(node._id)
		}
		expect(res?.data?.getSearch.hasMore).toBeFalsy()
		expect(res?.data?.getSearch.nextCursor).toBeNull()
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
			codingLanguage
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
			codingLanguage
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
				codingLanguage
				difficulty
				tags
				description
			}
			hasMore
			nextCursor
		}
	}
`

const GET_SEARCH = gql`
	query getSearch($cursor: String, $query: String!, $amount: Int) {
		getSearch(cursor: $cursor, query: $query, amount: $amount) {
			nodes {
				_id
				title
				tags
			}
			hasMore
			nextCursor
		}
	}
`
