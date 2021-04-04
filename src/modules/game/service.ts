import { ObjectId } from 'mongodb'
import { Service } from 'typedi'
import { Game } from '../../entities'
import GameModel from './model'
import UserModel from '../user/model'

@Service() // Dependencies injection
export default class GameService {
	constructor(
		private readonly gameModel: GameModel,
		private readonly userModel: UserModel
	) {}
	public async getById(id: ObjectId) {
		const game = await this.gameModel.getById(id)
		if (!game) throw new Error('No game found')
		return game
	}

	public async createGame(game: Game) {
		const newGame = await this.gameModel.createGame(game)
		if (!game) throw new Error('Unable to create game')
		return newGame
	}

	public async getUserCreatedGames(userId: string) {
		const user = await this.userModel.findById(new ObjectId(userId))
		if (!user) throw new Error('User not found')
		const createdGameIds = user.gamesCreated
		const userCreatedGames: Game[] = []
		for (var i = 0; i < createdGameIds.length; i++) {
			const game = await this.gameModel.findById(
				new ObjectId(createdGameIds[i])
			)
			if (game) userCreatedGames.push(game)
		}
		return userCreatedGames
	}
}
