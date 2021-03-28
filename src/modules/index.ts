import UserResolver from './user/resolver'

// Important: Add all your module's resolver in this
export const resolvers: any | [Function, ...Function[]] = [
	UserResolver
	// AuthResolver
	// ...
]