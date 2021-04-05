import { ObjectId } from 'mongodb'
import { Query, Resolver, Arg, Mutation, Args, UseMiddleware } from 'type-graphql'
import { Service } from 'typedi'
import { Comment, CommentInput } from '../../entities'
import { CommentMongooseModel } from './model'
import { PaginationInput, PaginatedResponse } from '../utils/pagination'
import CommentService from './service'
import { PaginatedCommentResponse } from './input'
import { isLoggedIn } from '../middleware/isLoggedIn'

@Service() // Dependencies injection
@Resolver((of) => Comment)
export default class CommentResolver {
	constructor(private readonly commentService: CommentService) {}
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
	
	@UseMiddleware(isLoggedIn)
	@Mutation((returns) => Comment)
	async createComment(@Arg('comment') comment: CommentInput) {
		const newComment = await this.commentService.createComment(comment)
		return newComment
	}
}
