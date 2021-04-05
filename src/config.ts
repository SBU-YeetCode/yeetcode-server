import dotenv from 'dotenv'
dotenv.config()

export const PRODUCTION = process.env.NODE_ENV === 'production'

// Safely get the environment variable in the process
const env = (name: string): string => {
	const value = process.env[name]

	if (!value) {
		throw new Error(`Missing: process.env['${name}'].`)
	}

	return value
}

export interface Config {
	clientOrigin: string
	cookieSecret: string
	port: number
	graphqlPath: string
	isDev: boolean
	mongoDB: {
		uri: string
		testUri: string
	}
	google: {
		clientId: string,
		secret: string,
		callbackUrl: string
	}
}

export const config: Config = {
	clientOrigin: env('CLIENT_ORIGIN'),
	cookieSecret: env('COOKIE_SECRET'),
	port: +env('PORT'),
	graphqlPath: env('GRAPHQL_PATH'),
	isDev: env('NODE_ENV') === 'development',
	mongoDB: {
		uri: env('MONGODB_URI'),
		testUri: env('MONGODB_TEST_URI'),
	},
	google: {
		clientId: env('GOOGLE_CLIENT_ID'),
		secret: env('GOOGLE_CLIENT_SECRET'),
		callbackUrl: env('GOOGLE_CALLBACK_URL')
	}
}
