import { ObjectId } from 'mongodb'
import { Service } from 'typedi'
import { CommentInput } from '../../entities'
import { PaginationInput } from '../utils/pagination'
import { PaginatedCommentResponse } from './input'
import CommentModel from './model'

@Service() // Dependencies injection
export default class CommentService {
	constructor(private readonly commentModel: CommentModel) {}
	public async getById(id: ObjectId) {
		const comment = await this.commentModel.getById(id)
		if (!comment) throw new Error('No comment found')
		return comment
	}

	public async createComment(comment: CommentInput) {
		const newComment = await this.commentModel.createComment(comment)
		if (!comment) throw new Error('Unable to create comment')
		return newComment
	}

	public async getGameComments(
		pagination: PaginationInput,
		gameId: string
	): Promise<PaginatedCommentResponse> {
		const comments = await this.commentModel.getPaginatedGameComments(
			pagination,
			gameId
		)
		return comments
	}

	public async getUserComments(id: string) {
		const userComments = await this.commentModel.getUserComments(id)
		return userComments
	}
}
