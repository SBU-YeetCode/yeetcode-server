import { ObjectId } from 'mongodb'
import {
	Query,
	Resolver,
	Arg,
	Mutation,
	Ctx,
	Args,
	FieldResolver,
	Root,
} from 'type-graphql'
import { Service } from 'typedi'
import { Comment, User, Game, GameProgress } from '../../entities'
import { isLoggedIn } from '../middleware/isLoggedIn'
import { PaginationInput } from '../utils/pagination'
import {
	GetLeaderboardInput,
	PaginatedUserResponse,
	UpdateUserInput,
} from './input'
import { UserMongooseModel } from './model'
import UserService from './service'
import { canEdit } from '../middleware/canEdit'
import CommentService from '../comment/service'
import GameService from '../game/service'
import GameProgressService from '../gameProgress/service'

@Service() // Dependencies injection
@Resolver((of) => User)
export default class UserResolver {
	constructor(
		private readonly userService: UserService,
		private readonly commentService: CommentService,
		private readonly gameService: GameService,
		private readonly gameProgressService: GameProgressService
	) {}

	@FieldResolver(() => [Comment])
	async comments(@Root() user: User) {
		return await this.commentService.getUserComments(user._id.toHexString())
	}

	@FieldResolver(() => [GameProgress])
	async gamesRecent(@Root() user: User) {
		return await this.gameProgressService.getUserRecentGames(
			user._id.toHexString()
		)
	}

	@FieldResolver(() => [GameProgress])
	async gamesCompleted(@Root() user: User) {
		return await this.gameProgressService.getUserCompletedGames(
			user._id.toHexString()
		)
	}

	@FieldResolver(() => [Game])
	async gamesCreated(@Root() user: User) {
		return await this.gameService.getUserCreatedGames(
			user._id.toHexString()
		)
	}

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

	@Mutation((returns) => User)
	@canEdit()
	async updateUser(@Args() newUserData: UpdateUserInput) {
		// Signed in user can only make changes to his own profile
		let updatedUser = await this.userService.updateUser(newUserData)
		return updatedUser
	}

	@Mutation((returns) => User)
	@canEdit()
	async deleteUser(@Arg('userId') userId: ObjectId) {
		const deletedUser = await this.userService.deleteUser(userId)
	}
}
