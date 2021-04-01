import { ObjectId } from 'mongodb'
import { Query, Resolver, Arg, Mutation, Args } from 'type-graphql'
import { Service } from 'typedi'
import { Comment, CommentInput } from '../../entities'
import { CommentMongooseModel } from './model'
import { PaginationInput, PaginatedResponse } from '../utils/pagination'
import CommentService from './service'
import { PaginatedCommentResponse } from './input'

@Service() // Dependencies injection
@Resolver((of) => Comment)
export default class CommentResolver {
	constructor(private readonly commentService: CommentService) {}
	@Query((returns) => Comment, { nullable: true })
	async getComment(@Arg('id') id: ObjectId) {
		const Comment = await this.commentService.getById(id)

		return Comment
	}

	@Mutation((returns) => Comment)
	async createComment(@Arg('comment') comment: CommentInput) {
		const newComment = await this.commentService.createComment(comment)
		return newComment
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
}
