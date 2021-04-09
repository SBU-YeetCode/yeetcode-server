import { ObjectId } from 'mongodb'
import { Service } from 'typedi'
import { CommentInput, Comment } from '../../entities'
import { PaginationInput } from '../utils/pagination'
import { PaginatedCommentResponse } from './input'
import CommentModel from './model'
import GameProgressModel from '../gameProgress/model'

@Service() // Dependencies injection
export default class CommentService {
	constructor(private readonly commentModel: CommentModel, private readonly gameProgressModel: GameProgressModel) {}
	public async getById(id: ObjectId) {
		const comment = await this.commentModel.getById(id)
		if (!comment) throw new Error('No comment found')
		return comment
	}


	public async createComment(comment: CommentInput) {
		const commentExists = await this.commentModel.exists({userId: comment.userId, gameId: comment.gameId})
		if(commentExists) throw new Error('Comment already by user in game')
		const gameProgressCompleted = await this.gameProgressModel.exists({userId: comment.userId, gameId: comment.gameId, isCompleted: true})
		if(!gameProgressCompleted) throw new Error('User has not completed the game they are trying to write a comment for')
		const newComment = await this.commentModel.createComment(comment)
		if (!newComment) throw new Error('Unable to create comment')
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
