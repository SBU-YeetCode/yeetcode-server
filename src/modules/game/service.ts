import { ObjectId } from 'mongodb'
import { Service } from 'typedi'
import { Game } from '../../entities'
import GameModel from './model'

@Service() // Dependencies injection
export default class GameService {
	constructor(private readonly gameModel: GameModel) {}
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
}
