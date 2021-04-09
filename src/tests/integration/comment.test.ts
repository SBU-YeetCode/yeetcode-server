import { ApolloServer, gql } from 'apollo-server-express'
import { createTestClient } from 'apollo-server-testing'
import { ObjectId } from 'mongodb'
import { CommentMongooseModel } from '../../modules/comment/model'
import { buildSchema } from '../../utils'
import { createComment } from '../data/comment-builder'
import { createGame } from '../data/game-builder'
import { createUser } from '../data/user-builder'
import { createGameProgress } from '../data/gameProgress-builder'
import {
	clearDatabase,
	closeDatabase,
	connect,
	populateDatabase,
} from '../utils'
import { Comment } from '../../entities'
import { PaginatedCommentResponse } from '../../modules/comment/input'
import { GameMongooseModel } from '../../modules/game/model'
import { UserMongooseModel } from '../../modules/user/model'
import { GameProgressMongooseModel } from '../../modules/gameProgress/model'

beforeAll(async (done) => {
	await connect()
	done()
})

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

describe('Comment', () => {
	it('should get comment in db', async () => {
		const comment = createComment({})
		const { _id, ...commentToMatch } = comment
		await populateDatabase(CommentMongooseModel, [comment])
		const graphqlSchema = await buildSchema()
		const server = new ApolloServer({ schema: graphqlSchema }) as any
		// use the test server to create a query function
		const { query } = createTestClient(server)

		const res = await query({
			query: GET_COMMENT,
			variables: { id: comment._id },
		})
		expect(res.data!.getComment!).toEqual<Omit<Comment, '_id'>>(
			commentToMatch
		)
	})

	it('should get paginated game comments in db', async () => {
		let comments: Comment[] = []
		const gameId = new ObjectId().toHexString()
		for (var i = 0; i < 20; i++) {
			comments.push(
				createComment({
					gameId: i > 17 ? new ObjectId().toHexString() : gameId,
				})
			)
		}
		await populateDatabase(CommentMongooseModel, comments)
		const graphqlSchema = await buildSchema()
		const server = new ApolloServer({ schema: graphqlSchema }) as any
		// use the test server to create a query function
		const { query } = createTestClient(server)
		const res = await query<{ getGameComments: PaginatedCommentResponse }>({
			query: GET_GAME_COMMENTS,
			variables: { gameId, amount: 18 },
		})
		const resComments = comments
			.filter((c) => c.gameId === gameId)
			.map((r) => ({ ...r, _id: r._id.toHexString() }))
		for (const node of res?.data?.getGameComments.nodes ?? []) {
			expect(node).toEqual(
				resComments.find((r) => r._id === (node._id as any))
			)
		}
		expect(res?.data?.getGameComments.hasMore).toBeFalsy()
		expect(res.data?.getGameComments.nextCursor).toBeNull()
	})

	it('should get comments by user id in db', async () => {
		let comments: Comment[] = []
		let desiredUserId = new ObjectId().toHexString()
		for (let i = 0; i < 5; i++) {
			// Generate 5 comments with random IDs
			comments.push(createComment())
		}
		// Alter comment in index 1 to desired ID
		comments[1].userId = desiredUserId
		await populateDatabase(CommentMongooseModel, comments)
		const graphqlSchema = await buildSchema()
		const server = new ApolloServer({ schema: graphqlSchema }) as any
		// use the test server to create a query function
		const { query } = createTestClient(server)
		const res = await query<{ getUserReviews: Comment[] }>({
			query: GET_USER_COMMENTS,
			variables: { userId: desiredUserId },
		})
		const { _id, ...commentToMatch } = comments[1]
		expect(res.data?.getUserReviews.length).toEqual(1)
		expect(res.data?.getUserReviews[0]).toEqual(commentToMatch)
	})

	it('should get no comments by user id in db', async () => {
		let comments: Comment[] = []
		let desiredUserId = new ObjectId().toHexString()
		for (let i = 0; i < 5; i++) {
			// Generate 5 comments with random IDs
			comments.push(createComment())
		}
		await populateDatabase(CommentMongooseModel, comments)
		const graphqlSchema = await buildSchema()
		const server = new ApolloServer({ schema: graphqlSchema }) as any
		// use the test server to create a query function
		const { query } = createTestClient(server)
		const res = await query<{ getUserReviews: Comment[] }>({
			query: GET_USER_COMMENTS,
			variables: { userId: desiredUserId },
		})
		expect(res.data?.getUserReviews.length).toEqual(0)
	})

	it('should create a new comment in db', async () => {
		const game = createGame({})
		const user = createUser({})
		const comment = createComment({
			gameId: game._id.toHexString(),
			userId: user._id.toHexString(),
		})
		const gameProgress = createGameProgress({
			gameId: game._id.toHexString(),
			userId: user._id.toHexString(),
			isCompleted: true,
		})
		const { _id, dateCreated, lastUpdated, ...commentToSend } = comment
		await populateDatabase(GameMongooseModel, [game])
		await populateDatabase(UserMongooseModel, [user])
		await populateDatabase(GameProgressMongooseModel, [gameProgress])
		const graphqlSchema = await buildSchema()
		const server = new ApolloServer({
			schema: graphqlSchema,
			context: () => ({
				req: { user },
			}),
		}) as any

		const { query } = createTestClient(server)
		const res = await query({
			query: CREATE_COMMENT,
			variables: {
				userId: user._id,
				comment: commentToSend,
			},
		})
		expect(res?.data?.createComment).toEqual(commentToSend)
	})

	it('should throw an error when creating comment without valid args', async () => {
		const user = createUser({})
		const comment = createComment({})
		const { _id, dateCreated, lastUpdated, ...commentToSend } = comment
		await populateDatabase(UserMongooseModel, [user])
		const graphqlSchema = await buildSchema()
		const server = new ApolloServer({
			schema: graphqlSchema,
			context: () => ({
				req: { user },
			}),
		}) as any

		const { query } = createTestClient(server)
		const res = await query({
			query: CREATE_COMMENT,
			variables: {
				userId: user._id,
				comment: commentToSend,
			},
		})
		expect(res?.errors?.length).toBeGreaterThan(0)
	})
})

const GET_USER_COMMENTS = gql`
	query getUserReviews($userId: String!) {
		getUserReviews(userId: $userId) {
			userId
			gameId
			review
			rating
			lastUpdated
			dateCreated
		}
	}
`

const GET_COMMENT = gql`
	query getComment($id: ObjectId!) {
		getComment(id: $id) {
			gameId
			userId
			review
			rating
			dateCreated
			lastUpdated
		}
	}
`

const GET_GAME_COMMENTS = gql`
	query getGameComments($gameId: String!, $amount: Int, $cursor: String) {
		getGameComments(gameId: $gameId, amount: $amount, cursor: $cursor) {
			nodes {
				_id
				gameId
				userId
				review
				rating
				dateCreated
				lastUpdated
			}
			nextCursor
			hasMore
		}
	}
`

const CREATE_COMMENT = gql`
	mutation createComment($userId: ObjectId!, $comment: CommentInput!) {
		createComment(userId: $userId, comment: $comment) {
			gameId
			userId
			review
			rating
		}
	}
`
