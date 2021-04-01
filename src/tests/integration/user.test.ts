import { ApolloServer, gql } from 'apollo-server-express'
import { createTestClient } from 'apollo-server-testing'
import { ObjectId } from 'mongodb'
import { User } from '../../entities'
import { UserMongooseModel } from '../../modules/user/model'
import { buildSchema } from '../../utils'
import { createUser } from '../data/user-builder'
import {
	clearDatabase,
	closeDatabase,
	connect,
	populateDatabase,
} from '../utils'

beforeAll(async () => connect())

// beforeEach(async () => {
// 	await populateDatabase(WcifMongooseModel, [wcif1])
// })

afterEach(async () => {
	// await clearDatabase()
})

afterAll(async (done) => {
	// await closeDatabase()
	done()
})

describe('User', () => {
	it('should get user in db', async () => {
		const user = createUser({})
		const { password, _id, accessToken, ...userToMatch } = user
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
			Omit<User, 'password' | '_id' | 'accessToken'>
		>(userToMatch)
	})
})

const GET_USER = gql`
	query getUser($id: ObjectId!) {
		getUser(id: $id) {
			username
			email
			name
			gamesPlayed
			gamesCreated
			lastUpdated
			comments
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
