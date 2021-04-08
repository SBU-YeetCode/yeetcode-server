import { createMethodDecorator } from 'type-graphql'

export function canEdit() {
	return createMethodDecorator<Context>(({ context, args }, next) => {
		const userId = args ? args.userId : null
		if (!userId) throw new Error('User ID not given.') // Must provide UserID
		if (!context.req.user) throw new Error('Not signed in.') // Must be signed in
		if (
			userId.toHexString() !== context.req.user._id.toHexString() &&
			!context.req.user.roles.includes('ADMIN')
		)
			throw new Error('Do not have permission to edit/create')
		return next()
	})
}
