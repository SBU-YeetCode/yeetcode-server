import { ObjectId } from 'mongodb'
import { Service } from 'typedi'
import { CommentInput } from '../../entities'
import GameModel from '../game/model'
import GameProgressModel from '../gameProgress/model'
import { PaginationInput } from '../utils/pagination'
import { PaginatedCommentResponse } from './input'
import CommentModel from './model'

@Service() // Dependencies injection
export default class CommentService {
	constructor(
		private readonly commentModel: CommentModel,
		private readonly gameProgressModel: GameProgressModel,
		private readonly gameModel: GameModel
	) {}
	public async getById(id: ObjectId) {
		const comment = await this.commentModel.getById(id)
		if (!comment) throw new Error('No comment found')
		return comment
	}

	public async createComment(comment: CommentInput) {
		const commentExists = await this.commentModel.findOne({
			userId: comment.userId,
			gameId: comment.gameId,
		})
		const game = await this.gameModel.findById(comment.gameId)
		if (!game) throw new Error('Game not found')
		if (commentExists) {
			game.totalStars = game.totalStars + comment.rating - commentExists.rating
			game.rating = game.totalStars / game.commentCount
			commentExists.rating = comment.rating
			commentExists.review = comment.review
			await commentExists.save()
			await game.save()
			return commentExists
		} 
		else {
		const gameProgressCompleted = await this.gameProgressModel.exists({
			userId: comment.userId,
			gameId: comment.gameId,
			isCompleted: true,
		})
		if (!gameProgressCompleted)
			throw new Error(
				'User has not completed the game they are trying to write a comment for'
			)
		const newComment = await this.commentModel.createComment(comment)
		if (!newComment) throw new Error('Unable to create comment')
		game!.commentCount = game!.commentCount + 1
		game.totalStars = game.totalStars + comment.rating
		game.rating = game.totalStars / game.commentCount
		await game.save()
		return newComment
			}
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
