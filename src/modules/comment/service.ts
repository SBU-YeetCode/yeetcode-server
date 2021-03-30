import { ObjectId } from 'mongodb'
import { Service } from 'typedi'
import { Comment } from '../../entities'
import CommentModel from './model'

@Service() // Dependencies injection
export default class CommentService {
	constructor(private readonly commentModel: CommentModel) {}
	public async getById(id: ObjectId) {
		const comment = await this.commentModel.getById(id)
		if (!comment) throw new Error('No comment found')
		return comment
	}

	public async createComment(comment: Comment) {
		const newComment = await this.commentModel.createComment(comment)
		if (!comment) throw new Error('Unable to create comment')
		return newComment
	}
}
