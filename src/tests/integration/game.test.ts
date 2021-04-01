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
	await clearDatabase()
})

afterAll(async (done) => {
	// await closeDatabase()
	done()
})

describe('Game', () => {})
