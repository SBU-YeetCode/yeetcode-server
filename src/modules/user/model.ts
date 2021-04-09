import { getModelForClass, DocumentType } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'
import { Service } from 'typedi'
import { User } from '../../entities'

// This generates the mongoose model for us
export const UserMongooseModel = getModelForClass(User)

@Service()
export default class UserModel {
	async getById(_id: ObjectId): Promise<User | null> {
		// Use mongoose as usual
		return UserMongooseModel.findById(_id).lean().exec()
	}

	async findById(_id: ObjectId): Promise<DocumentType<User> | null> {
		return UserMongooseModel.findById(_id).exec()
	}

	async createUser(user: User) {
		let newUser = new UserMongooseModel(user)
		await newUser.save()
		return newUser
	}

	async deleteUser(userId: string) {
		return UserMongooseModel.deleteOne({ _id: userId })
	}
}
