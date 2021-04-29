import { ObjectId } from 'mongodb'
import {
	Arg,

	Args,


	FieldResolver, Mutation, Query,
	Resolver,




	Root
} from 'type-graphql'
import { Service } from 'typedi'
import { Comment, CommentInput, User } from '../../entities'
import { canEdit } from '../middleware/canEdit'
import UserService from '../user/service'
import { PaginationInput } from '../utils/pagination'
import { PaginatedCommentResponse } from './input'
import CommentService from './service'

@Service() // Dependencies injection
@Resolver((of) => Comment)
export default class CommentResolver {
	constructor(
		private readonly commentService: CommentService,
		private readonly userService: UserService
	) {}

	@FieldResolver(() => User)
	async userInfo(@Root() comment: Comment) {
		const user = await this.userService.getById(
			new ObjectId(comment.userId)
		)
		return user
	}

	@Query((returns) => Comment, { nullable: true })
	async getComment(@Arg('id') id: ObjectId) {
		const Comment = await this.commentService.getById(id)

		return Comment
	}

	@Query((returns) => PaginatedCommentResponse)
	async getGameComments(
		@Args() pagination: PaginationInput,
		@Arg('gameId') gameId: string
	) {
		const gameComments = await this.commentService.getGameComments(
			pagination,
			gameId
		)
		return gameComments
	}

	@Query((returns) => [Comment])
	async getUserReviews(@Arg('userId') id: string) {
		const userComments = await this.commentService.getUserComments(id)
		return userComments
	}

	@Query((returns) => Comment, {nullable: true})
	async getUserGameReview(@Arg('userId') id: string, @Arg('gameId') gameId: string) {
		const userComments = await this.commentService.getUserGameComment(id, gameId)
		return userComments
	}

	@canEdit()
	@Mutation((returns) => Comment)
	async createComment(
		@Arg('userId') _: ObjectId,
		@Arg('comment') comment: CommentInput
	) {
		const newComment = await this.commentService.createComment(comment)
		return newComment
	}
}
