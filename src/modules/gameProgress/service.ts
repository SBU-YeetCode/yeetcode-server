import { ObjectId } from 'mongodb'
import { Service } from 'typedi'
import { GameProgress } from '../../entities'
import GameProgressModel from './model'

@Service() // Dependencies injection
export default class GameProgressService {
	constructor(private readonly gameprogressModel: GameProgressModel) {}
	public async getById(id: ObjectId) {
		const gameprogress = await this.gameprogressModel.getById(id)
		if (!gameprogress) throw new Error('No gameprogress found')
		return gameprogress
	}

	public async createGameProgress(gameprogress: GameProgress) {
		const newGameProgress = await this.gameprogressModel.createGameProgress(
			gameprogress
		)
		if (!gameprogress) throw new Error('Unable to create gameprogress')
		return newGameProgress
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
