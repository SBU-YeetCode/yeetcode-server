import { ApolloServer } from 'apollo-server-express'
import express from 'express'
// loaders
import apolloLoader from './apollo'
import expressLoader from './express'
import mongooseLoader from './mongoose'


export default async (app: express.Application): Promise<ApolloServer> => {
	// Load everything related to express
	// loading expressLoader and mongooseLoader
	const waiting = [expressLoader(app), mongooseLoader()]

	// @ts-ignore
	await Promise.all(waiting)

	// load apollo server config
	return apolloLoader()
}