import { ObjectId } from 'mongodb'
import { Service } from 'typedi'
import GameModel from '../game/model'
import GameProgressModel from './model'
import {GameProgressInput, Game} from '../../entities'
import buildGameProgress from './utils/buildGameProgress'
@Service() // Dependencies injection
export default class GameProgressService {
	constructor(private readonly gameprogressModel: GameProgressModel, private readonly gameModel: GameModel) {}
	public async getById(id: ObjectId) {
		const gameprogress = await this.gameprogressModel.getById(id)
		if (!gameprogress) throw new Error('No gameprogress found')
		return gameprogress
	}

	public async createGameProgress(userId: string, gameId: string) {
		const exists = await this.gameprogressModel.exists({userId, gameId})
		if(exists) throw new Error('This user already has an instance of the game being played. Please clear before starting new instance')
		const game: Game = await this.gameModel.getById(gameId) as Game
		const buildedGameProgress: GameProgressInput = buildGameProgress(game, userId)
		const gameProgress = await this.gameprogressModel.createGameProgress(buildedGameProgress)
		if (!gameProgress) throw new Error('Unable to create gameprogress')
		return gameProgress
	}
	public async getUserRecentGames(userId: string) {
		const userRecentGames = await this.gameprogressModel.getGameProgresses(
			{
				userId: userId,
				isCompleted: false,
			},
			{
				startedAt: -1,
			}
		)
		return userRecentGames
	}

	public async getUserCompletedGames(userId: string) {
		const userRecentGames = await this.gameprogressModel.getGameProgresses(
			{
				userId: userId,
				isCompleted: true,
			},
			{
				completedAt: -1,
			}
		)
		return userRecentGames
	}
}
