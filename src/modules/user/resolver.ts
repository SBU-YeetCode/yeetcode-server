import { ObjectId } from 'mongodb'
import { Query, Resolver, Arg, Mutation, Ctx, Args } from 'type-graphql'
import { Service } from 'typedi'
import { User } from '../../entities'
import { isLoggedIn } from '../middleware/isLoggedIn'
import { PaginationInput } from '../utils/pagination'
import { GetLeaderboardInput, PaginatedUserResponse } from './input'
import { UserMongooseModel } from './model'
import UserService from './service'

@Service() // Dependencies injection
@Resolver((of) => User)
export default class UserResolver {
	constructor(private readonly userService: UserService) {}

	@Query((returns) => User, { nullable: true })
	async getMe(@Ctx() { req }: Context) {
		if (!req.user) return null
		const user = await this.userService.getById(req!.user._id)
		return user
	}

	@Query((returns) => User, { nullable: true })
	async getUser(@Arg('id') id: ObjectId) {
		const user = await this.userService.getById(id)

		return user
	}

	@Query((returns) => PaginatedUserResponse)
	async getLeaderboard(
		@Args() { language }: GetLeaderboardInput,
		@Args() pagination: PaginationInput
	) {
		const users = await this.userService.getLeaderboard(
			language,
			pagination
		)
		return users
	}

	@Mutation((returns) => User)
	async createUser(@Arg('user') user: User) {
		const newUser = await this.userService.createUser(user)
		return newUser
	}
}
