import { getModelForClass, DocumentType } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'
import { Service } from 'typedi'
import { Comment } from '../../entities'

// This generates the mongoose model for us
export const CommentMongooseModel = getModelForClass(Comment)

@Service()
export default class CommentModel {
	async getById(_id: ObjectId): Promise<Comment | null> {
		// Use mongoose as usual
		return CommentMongooseModel.findById(_id).lean().exec()
	}

	async findById(_id: ObjectId): Promise<DocumentType<Comment> | null> {
		return CommentMongooseModel.findById(_id).exec()
	}

	async createComment(Comment: Comment) {
		let newComment = new CommentMongooseModel(Comment)
		await newComment.save()
		return newComment
	}
}
