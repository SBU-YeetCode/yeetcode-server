import mongoose from 'mongoose'
import { config } from '../../config'

/**
 * Populate db with a schema and data for test purpose only
 */
export const populateDatabase = async (model: any, data: any[]) => {
	try {
		const result = await model.insertMany(data)
		return result
	} catch (err) {
		console.error('populateDatabase failed', err)
		return err
	}
}

/**
 * Connect to the in-memory database.
 */
export const connect = async () => {
	jest.setTimeout(10000)
	const uri = config.mongoDB.testUri

	const mongooseOpts = {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		socketTimeoutMS: 10000,
		autoIndex: false,
		// autoReconnect: true,
		// reconnectTries: Number.MAX_VALUE,
		// reconnectInterval: 1000,
		// // useMongoClient: true, // remove this line if you use mongoose 5 and above
	}
	mongoose.connection.on('error', (e) => {
		if (e.message.code === 'ETIMEDOUT') {
			console.log(e)
			mongoose.connect(uri, mongooseOpts)
		}
		console.log(e)
	})

	await mongoose.connect(uri, mongooseOpts)
}

/**
 * Drop database, close the connection and stop mongod.
 */
export const closeDatabase = async () => {
	try {
		await mongoose.connection.dropDatabase()
		await mongoose.connection.close()
		await mongoose.disconnect()
		// await mongod.stop()
	} catch (err) {
		console.error('ERROR: closeDatabase :', closeDatabase)
		console.log(err)
		return err
	}
}

/**
 * Remove all the data for all db collections.
 */
export const clearDatabase = async () => {
	const collections = mongoose.connection.collections

	for (const key in collections) {
		const collection = collections[key]
		await collection.deleteMany({})
	}
}
