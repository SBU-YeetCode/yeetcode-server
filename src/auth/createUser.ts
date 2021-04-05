import * as faker from 'faker'
import { ObjectId } from 'mongodb'
import { User } from '../entities'
import createUsername from './createUsername'

export const createUser = ({profilePicture, name, email, accessToken, googleId }: Pick<User, 'email' | 'name' | 'accessToken' | 'googleId' | 'profilePicture'>): User => {

	return {
		_id: new ObjectId(),
		name,
		email,
		googleId,
		accessToken,
		comments: [],
		gamesCreated: [],
		gamesPlayed: [],
		gamesCompleted: [],
		lastUpdated: new Date().toISOString(),
		username: createUsername(name),
		points: {
			c: 0,
			cpp: 0,
			java: 0,
			javascript: 0,
			python: 0,
			total: 0,
		},
		profilePicture
	}
}
