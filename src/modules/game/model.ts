import { getModelForClass, DocumentType } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { Service } from 'typedi'
import { Game } from '../../entities'
import { GameInput } from '../../entities/game/game'
import { PaginationInput, cursorMatch } from '../utils/pagination'
import { LANGUAGES, PaginatedGameResponse, SORT_OPTIONS } from './input'

// This generates the mongoose model for us
export const GameMongooseModel = getModelForClass(Game)

@Service()
export default class GameModel {
	async getById(_id: string): Promise<Game | null> {
		// Use mongoose as usual
		return GameMongooseModel.findById(_id).lean().exec()
	}

	async findById(_id: string): Promise<DocumentType<Game> | null> {
		return GameMongooseModel.findById(_id).exec()
	}

	async createGame(Game: GameInput) {
		let newGame = new GameMongooseModel(Game)
		await newGame.save()
		return newGame
	}

	async getFilterGames(
		language: LANGUAGES | null,
		sortDir: number | null,
		sort: SORT_OPTIONS | null,
		pagination: PaginationInput
	): Promise<PaginatedGameResponse> {
		let aggregateArray = []
		let game: Game | null = null
		if (pagination.cursor) {
			game = await this.getById(pagination.cursor)
		}
		if (language) {
			aggregateArray.push({ $match: { language: language.toString() } })
		}
		let sorter: any = {}
		let match: any = {}
		if (sort && sortDir) {
			switch (sort) {
				case SORT_OPTIONS.NEWEST: {
					sorter.dateCreated = sortDir
					if (game)
						match = cursorMatch<Game, 'dateCreated'>(
							'dateCreated',
							sortDir,
							game,
							(v: string) => new Date(v)
						)
					break
				}
				case SORT_OPTIONS.PLAY_COUNT: {
					sorter.playCount = sortDir
					if (game) match = cursorMatch('playCount', sortDir, game)
					break
				}
				case SORT_OPTIONS.RATING: {
					sorter.rating = sortDir
					if (game) match = cursorMatch('rating', sortDir, game)
					break
				}
			}
		} else {
			match = {
				_id: {
					$lt: Types.ObjectId(pagination.cursor),
				},
			}
		}
		console.log(JSON.stringify(match))
		aggregateArray.push({ $sort: { ...sorter, _id: -1 } })
		if (pagination.cursor && game) {
			aggregateArray.push({
				$match: match,
			})
		}
		aggregateArray.push({
			$limit: pagination.amount + 1,
		})
		let aggregate = await GameMongooseModel.aggregate<Game>(aggregateArray)
		let nodes = aggregate
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
}
