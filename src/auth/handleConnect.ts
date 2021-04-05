import { UserMongooseModel } from '../modules/user/model'
import { createUser } from './createUser'

interface PassportGoogleCallback {
	accessToken: string
	refreshToken: string
	profile: any
	done: (err: any, user: any) => void
}

export async function handleConnect({
	accessToken,
	refreshToken,
	profile,
	done,
}: PassportGoogleCallback) {
	const user = await UserMongooseModel.findOne({ googleId: profile.id })
	if (user) {
		return done(false, user)
	} else {
		let newUser = createUser({
			email: profile.emails.length > 0 ? profile.emails[0].value : '',
			name: `${profile.name.givenName} ${profile.name.familyName}`,
			googleId: profile.id,
			profilePicture: {
				avatar:  profile.photos.length > 0 ? profile.photos[0].value : '',
				large: profile.photos.length > 0 ? profile.photos[0].value : '',
			},
            accessToken
		})
        const user = new UserMongooseModel(newUser)
        await user.save()
		return done(false, user)
	}
}

export function handleAuthorize() {}
