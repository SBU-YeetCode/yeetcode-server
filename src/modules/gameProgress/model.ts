import { getModelForClass, DocumentType, } from '@typegoose/typegoose'
import { ObjectId, FilterQuery } from 'mongodb'
import { Service } from 'typedi'
import { GameProgress, GameProgressInput } from '../../entities'

// This generates the mongoose model for us
export const GameProgressMongooseModel = getModelForClass(GameProgress)

@Service()
export default class GameProgressModel {
	find = (
		conditions: FilterQuery<DocumentType<GameProgress>>,
		callback?:
			| ((err: any, res: DocumentType<GameProgress>[]) => void)
			| undefined
	) => GameProgressMongooseModel.find(conditions, callback)

	findOne = (
		conditions: FilterQuery<DocumentType<GameProgress>>,
		callback?:
			| ((err: any, res: DocumentType<GameProgress>[]) => void)
			| undefined
	) => GameProgressMongooseModel.findOne(conditions, callback)

	async exists(q: any) {
		return GameProgressMongooseModel.exists(q)
	}

	async getById(_id: ObjectId): Promise<GameProgress | null> {
		// Use mongoose as usual
		return GameProgressMongooseModel.findById(_id).lean().exec()
	}

	async findById(_id: ObjectId): Promise<DocumentType<GameProgress> | null> {
		return GameProgressMongooseModel.findById(_id).exec()
	}

	async createGameProgress(GameProgress: GameProgressInput) {
		let newGameProgress = new GameProgressMongooseModel(GameProgress)
		await newGameProgress.save()
		return newGameProgress
	}

	async getGameProgresses(where?: any, sort?: any) {
		const games = await GameProgressMongooseModel.find(where)
			.sort(sort)
			.lean()
			.exec()
		return games
	}

	async deleteMany(query: any) {
		return await GameProgressMongooseModel.deleteMany(query).exec()
	}
}
