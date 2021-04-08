import { ApolloServer, gql } from 'apollo-server-express'
import { createTestClient } from 'apollo-server-testing'
import { ObjectId } from 'mongodb'
import { use } from 'passport'
import { User } from '../../entities'
import {
	PaginatedUserResponse,
	UpdateUserInput,
} from '../../modules/user/input'
import { UserMongooseModel } from '../../modules/user/model'
import { buildSchema } from '../../utils'
import { createPoints } from '../data/points-builder'
import { createUser } from '../data/user-builder'
import {
	clearDatabase,
	closeDatabase,
	connect,
	populateDatabase,
} from '../utils'

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

describe('User', () => {
	it('should get user in db', async () => {
		const user = createUser({})
		const { googleId, _id, accessToken, ...userToMatch } = user
		await populateDatabase(UserMongooseModel, [user])
		const graphqlSchema = await buildSchema()
		const server = new ApolloServer({ schema: graphqlSchema }) as any
		// use the test server to create a query function
		const { query } = createTestClient(server)

		const res = await query({
			query: GET_USER,
			variables: { id: user._id },
		})
		expect(res.data!.getUser!).toEqual<
			Omit<User, 'googleId' | '_id' | 'accessToken'>
		>(userToMatch)
	})
	it('should get the logged in user', async () => {
		const user = createUser({})
		const { googleId, _id, accessToken, ...userToMatch } = user
		const graphqlSchema = await buildSchema()
		const server = new ApolloServer({
			schema: graphqlSchema,
			context: () => ({ req: { user: user } }),
		}) as any
		await populateDatabase(UserMongooseModel, [user])
		const { query } = createTestClient(server)

		const res = await query({ query: GET_ME })
		expect(res.data!.getMe).toEqual<
			Omit<User, 'googleId' | 'accessToken' | '_id'>
		>(userToMatch)
	})

	it('should return null since no user is logged in', async () => {
		const graphqlSchema = await buildSchema()
		const server = new ApolloServer({
			schema: graphqlSchema,
		}) as any
		const { query } = createTestClient(server)

		const res = await query({ query: GET_ME })
		expect(res.data!.getMe).toBeNull()
	})

	it('should get users sorted by total points in db', async () => {
		const graphqlSchema = await buildSchema()
		const server = new ApolloServer({
			schema: graphqlSchema,
		}) as any
		// Create users
		let users: User[] = []
		for (let i = 0; i < 5; i++) {
			users.push(createUser({ points: createPoints() }))
		}
		await populateDatabase(UserMongooseModel, users)
		const expectedUsers = users
			.sort((a: User, b: User) => {
				return (
					b.points.total - a.points.total ||
					parseInt(b._id.toHexString()) -
						parseInt(a._id.toHexString())
				)
			})
			.map((user) => {
				const { _id, googleId, accessToken, ...userToMatch } = user
				return { ...userToMatch, _id: _id.toHexString() }
			})
		const { query } = createTestClient(server)
		const queryAmount = 4
		const res = await query<{ getLeaderboard: PaginatedUserResponse }>({
			query: GET_LEADERBOARD,
			variables: { amount: queryAmount },
		})
		expect(res.data?.getLeaderboard.hasMore).toBe(true)
		expect(res.data?.getLeaderboard.nodes).toEqual(
			expectedUsers.slice(0, queryAmount)
		)
	})

	it('should get users sorted by total points after cursor in db', async () => {
		const graphqlSchema = await buildSchema()
		const server = new ApolloServer({
			schema: graphqlSchema,
		}) as any
		// Create users
		let users: User[] = []
		for (let i = 0; i < 5; i++) {
			users.push(createUser({ points: createPoints() }))
		}
		await populateDatabase(UserMongooseModel, users)
		const expectedUsers = users
			.sort((a: User, b: User) => {
				return (
					b.points.total - a.points.total ||
					parseInt(b._id.toHexString()) -
						parseInt(a._id.toHexString())
				)
			})
			.map((user) => {
				const { _id, googleId, accessToken, ...userToMatch } = user
				return { ...userToMatch, _id: _id.toHexString() }
			})
		const { query } = createTestClient(server)
		// Query for 3 users after first three users cursor
		const res = await query<{ getLeaderboard: PaginatedUserResponse }>({
			query: GET_LEADERBOARD,
			variables: { amount: 3, cursor: expectedUsers[2]._id },
		})
		expect(res.data?.getLeaderboard.hasMore).toBe(false)
		expect(res.data?.getLeaderboard.nodes).toEqual(expectedUsers.slice(3))
	})

	it('should update user in db', async () => {
		const graphqlSchema = await buildSchema()
		// Create user
		const user = createUser({})
		const server = new ApolloServer({
			schema: graphqlSchema,
			context: { req: { user } },
		}) as any
		await populateDatabase(UserMongooseModel, [user])
		const newUserInfo: Required<UpdateUserInput> = {
			userId: user._id,
			newName: 'New Name',
			newUsername: 'NewUsername1234',
			newAvatar: 'NewAvatar',
			newLargePicture: 'NewLargePic',
		}
		user.name = newUserInfo.newName
		user.username = newUserInfo.newUsername
		user.profilePicture.avatar = newUserInfo.newAvatar
		user.profilePicture.large = newUserInfo.newLargePicture
		const { mutate } = createTestClient(server)
		const res = await mutate<{ updateUser: User }>({
			mutation: UPDATE_USER,
			variables: { ...newUserInfo },
		})
		const { accessToken, googleId, ...userToMatch } = user
		expect(res.data?.updateUser).toEqual({
			...userToMatch,
			_id: user._id.toHexString(),
		})
	})
})

const UPDATE_USER = gql`
	mutation updateUser(
		$userId: ObjectId!
		$newName: String!
		$newUsername: String!
		$newAvatar: String!
		$newLargePicture: String!
	) {
		updateUser(
			userId: $userId
			newName: $newName
			newUsername: $newUsername
			newAvatar: $newAvatar
			newLargePicture: $newLargePicture
		) {
			_id
			username
			email
			roles
			name
			lastUpdated
			points {
				cpp
				javascript
				c
				python
				total
				java
			}
			profilePicture {
				avatar
				large
			}
		}
	}
`

const GET_LEADERBOARD = gql`
	query getLeaderboard($amount: Int, $cursor: String) {
		getLeaderboard(amount: $amount, cursor: $cursor) {
			nodes {
				_id
				username
				email
				roles
				name
				lastUpdated
				points {
					cpp
					javascript
					c
					python
					total
					java
				}
				profilePicture {
					avatar
					large
				}
			}
			hasMore
			nextCursor
		}
	}
`

const GET_USER = gql`
	query getUser($id: ObjectId!) {
		getUser(id: $id) {
			username
			email
			name
			roles
			lastUpdated
			points {
				cpp
				javascript
				c
				python
				total
				java
			}
			profilePicture {
				avatar
				large
			}
		}
	}
`

const GET_ME = gql`
	query getMe {
		getMe {
			username
			email
			name
			roles
			lastUpdated
			points {
				cpp
				javascript
				c
				python
				total
				java
			}
			profilePicture {
				avatar
				large
			}
		}
	}
`
