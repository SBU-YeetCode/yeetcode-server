import * as faker from 'faker'
import { ObjectId } from 'mongodb'
import { User } from '../../entities'

export const createUser = (user: Partial<User>): User => {
	const { points, profilePicture, ...other } = user
	const name = faker.name.findName()

	return {
		_id: new ObjectId(),
		name,
		roles: ['USER'],
		email: faker.internet.email(),
		googleId: faker.datatype.uuid(),
		accessToken: faker.datatype.uuid(),
		// comments: [],
		// gamesCreated: [],
		// gamesRecent: [],
		// gamesCompleted: [],
		lastUpdated: new Date().toISOString(),
		username: name,
		points: {
			c: 0,
			cpp: 0,
			java: 0,
			javascript: 0,
			python: 0,
			total: 0,
			...points,
		},
		profilePicture: {
			avatar: faker.image.imageUrl(),
			large: faker.image.imageUrl(),
			...profilePicture,
		},
		bio: '',
		...other,
	}
}
