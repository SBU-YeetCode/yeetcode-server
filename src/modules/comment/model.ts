import { getModelForClass, DocumentType } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'
import { FilterQuery } from 'mongoose'
import { Service } from 'typedi'
import { CommentInput, Comment } from '../../entities'
import { PaginationInput } from '../utils/pagination'
import { PaginatedCommentResponse } from './input'

// This generates the mongoose model for us
export const CommentMongooseModel = getModelForClass(Comment)

@Service()
export default class CommentModel {
	async exists(q: any) {
		return CommentMongooseModel.exists(q)
	}

	findOne = (
		conditions: FilterQuery<DocumentType<Comment>>,
		callback?:
			| ((err: any, res: DocumentType<Comment>[]) => void)
			| undefined
	) => CommentMongooseModel.findOne(conditions, callback)

	async getById(_id: ObjectId): Promise<Comment | null> {
		// Use mongoose as usual
		return CommentMongooseModel.findById(_id).lean().exec()
	}

	async findById(_id: ObjectId): Promise<DocumentType<Comment> | null> {
		return CommentMongooseModel.findById(_id).exec()
	}

	async createComment(Comment: CommentInput) {
		let newComment = new CommentMongooseModel(Comment)
		await newComment.save()
		return newComment
	}

	async getPaginatedGameComments(
		pagination: PaginationInput,
		gameId: string
	): Promise<PaginatedCommentResponse> {
		let criteria = pagination.cursor
			? {
					_id: {
						$lt: pagination.cursor,
					},
			  }
			: {}
		let nodes = await CommentMongooseModel.find(criteria)
			.sort({ _id: -1 })
			.where('gameId')
			.equals(gameId)
			.limit(pagination.amount + 1)
			.lean()
			.exec()
		const hasMore = nodes.length > pagination.amount
		if (hasMore) {
			nodes = nodes.slice(0, nodes.length - 1)
		}
		return {
			hasMore,
			nextCursor: hasMore
				? nodes[nodes.length - 1]._id.toHexString()
				: null,
			nodes,
		}
	}

	async getUserComments(id: string) {
		return CommentMongooseModel.find({ userId: id }).lean().exec()
	}

	async deleteMany(query: any) {
		return await CommentMongooseModel.deleteMany(query).exec()
	}
}
