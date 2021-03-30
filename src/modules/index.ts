import UserResolver from './user/resolver'
import CommentResolver from './comment/resolver'
import GameProgressResolver from './gameProgress/resolver'
import GameResolver from './game/resolver'
// Important: Add all your module's resolver in this
export const resolvers: any | [Function, ...Function[]] = [
	UserResolver,
	CommentResolver,
	GameProgressResolver,
	GameResolver,
	// AuthResolver
	// ...
]
