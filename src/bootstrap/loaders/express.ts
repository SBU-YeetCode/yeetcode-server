import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { config, PRODUCTION } from '../../config'
import passportConfig from './passport'
import sessionConfig from './session'

export default async (app: express.Application) => {
	// Lets us accept JSON as a return from clients
	app.use(express.json())
	// Cors configuration
	app.use(
		'*',
		cors({
			origin: ['http://localhost:3000', config.clientOrigin],
			credentials: true,
		})
	)
	// Sets various HTTP headers to help protect our app
	app.use(
		helmet({
			contentSecurityPolicy: false,
		})
	)

	await sessionConfig(app)

	await passportConfig(app)
}
