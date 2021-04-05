import express from 'express'
import { ObjectId } from 'mongodb'
import passport from 'passport'
import * as Google from 'passport-google-oauth'
import { config } from '../config'
import { User } from '../entities'
import { UserMongooseModel } from '../modules/user/model'
import { handleConnect } from './handleConnect'

const GoogleStrategy = Google.OAuth2Strategy

export default function (passport: passport.PassportStatic) {
	const router = express.Router()

	const {
		google: { clientId, secret, callbackUrl },
	} = config
	passport.use(
		new GoogleStrategy(
			{
				clientID: clientId,
				clientSecret: secret,
				callbackURL: callbackUrl,
			},
			(accessToken, refreshToken, profile, done) =>
				handleConnect({ accessToken, refreshToken, profile, done })
		)
	)

	// @ts-ignore
	passport.serializeUser((user: User, done) => {
		done(null, {
			id: user._id,
			name: user.name,
			username: user.username,
		})
	})
	// @ts-ignore
	passport.deserializeUser((serializedUser: Partial<User> & { id: ObjectId }, done) => {
		UserMongooseModel.findOne({ _id: serializedUser.id }, (err, user) =>
			done(err, user)
		)
	})

	router.get(
		'/google',
		passport.authenticate('google', {
			scope: [
				'https://www.googleapis.com/auth/plus.login',
				'https://www.googleapis.com/auth/userinfo.email',
			],
		})
	)
	router.get(
		'/google/callback',
		passport.authenticate('google'),
		(req, res) => res.redirect(config.clientOrigin)
	)

	router.get('/logout', async (req, res) => {
		await req.logout()
		req.session?.destroy((err) => console.error(err))
		res.redirect(config.clientOrigin)
	})

	return router
}
