import { getModelForClass, DocumentType } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'
import { Service } from 'typedi'
import { Game } from '../../entities'

// This generates the mongoose model for us
export const GameMongooseModel = getModelForClass(Game)

@Service()
export default class GameModel {
	async getById(_id: ObjectId): Promise<Game | null> {
		// Use mongoose as usual
		return GameMongooseModel.findById(_id).lean().exec()
	}

	async findById(_id: ObjectId): Promise<DocumentType<Game> | null> {
		return GameMongooseModel.findById(_id).exec()
	}

	async createGame(Game: Game) {
		let newGame = new GameMongooseModel(Game)
		await newGame.save()
		return newGame
	}
}
