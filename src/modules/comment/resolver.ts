import { ObjectId } from 'mongodb'
import { Query, Resolver, Arg, Mutation, InputType } from 'type-graphql'
import { Service } from 'typedi'
import { Comment } from '../../entities'
import { CommentMongooseModel } from './model'
import CommentService from './service'

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
	async createComment(@Arg('comment') comment: Comment) {
		const newComment = await this.commentService.createComment(comment)
		return newComment
	}
}
