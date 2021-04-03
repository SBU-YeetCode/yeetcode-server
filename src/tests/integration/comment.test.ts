import { ApolloServer, gql } from 'apollo-server-express'
import { createTestClient } from 'apollo-server-testing'
import { ObjectId } from 'mongodb'
import { CommentMongooseModel } from '../../modules/comment/model'
import { buildSchema } from '../../utils'
import { createComment } from '../data/comment-builder'
import {
	clearDatabase,
	closeDatabase,
	connect,
	populateDatabase,
} from '../utils'
import { Comment } from '../../entities'
import { PaginatedCommentResponse } from '../../modules/comment/input'

beforeAll(async () => connect())

// beforeEach(async () => {
// 	await populateDatabase(WcifMongooseModel, [wcif1])
// })

afterEach(async () => {
	await clearDatabase()
})

afterAll(async (done) => {
	// await closeDatabase()
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
})

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