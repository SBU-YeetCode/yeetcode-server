import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { config, PRODUCTION } from '../../config'
import passportConfig from './passport'
import sessionConfig from './session'

export default async (app: express.Application) => {
	// Body parser only needed during POST on the graphQL path
	app.use(express.json())
	// Cors configuration
	app.use('*', cors({ origin: config.clientOrigin, credentials: true }))

	// Sets various HTTP headers to help protect our app
	app.use(helmet({
		contentSecurityPolicy: PRODUCTION ? undefined : false
	}))

	await sessionConfig(app)

	await passportConfig(app)
}