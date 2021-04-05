import { ObjectId } from 'mongodb'
import { Types } from 'mongoose'
import { Service } from 'typedi'
import { User } from '../../entities'
import { LANGUAGES } from '../game/input'
import { PaginationInput } from '../utils/pagination'
import { PaginatedUserResponse } from './input'
import UserModel, { UserMongooseModel } from './model'

@Service() // Dependencies injection
export default class UserService {
	constructor(private readonly userModel: UserModel) {}
	public async getById(id: ObjectId) {
		const user = await this.userModel.getById(id)
		if (!user) throw new Error('No user found')
		return user
	}

	public async createUser(user: User) {
		const newUser = await this.userModel.createUser(user)
		if (!user) throw new Error('Unable to create user')
		return newUser
	}

	public async getLeaderboard(
		language: LANGUAGES | null | 'total',
		pagination: PaginationInput
	): Promise<PaginatedUserResponse> {
		const sort_descending = -1
		let aggregateArray = []
		let userCursor: User | null = null
		if (pagination.cursor)
			userCursor = await this.getById(new ObjectId(pagination.cursor))
		let sorter: any = {}
		let match: any = {}
		// Sort by points depending on language
		if (language) {
			var pointBuilder = `points.${language}`
			sorter[pointBuilder] = sort_descending
		} else {
			language = 'total'
			sorter['points.total'] = sort_descending
		}
		aggregateArray.push({ $sort: { ...sorter, _id: -1 } })
		// Apply cursor if one exists
		const langBulder = `points.${language}`
		if (userCursor) {
			match = {
				$or: [
					{
						[langBulder]: {
							$lt: userCursor.points[language],
						},
					},
					{
						$and: [
							{
								[langBulder]: {
									$eq: userCursor.points[language],
								},
								_id: {
									$lt: userCursor._id,
								},
							},
						],
					},
				],
			}
			aggregateArray.push({
				$match: match,
			})
		}
		aggregateArray.push({
			$limit: pagination.amount + 1,
		})
		let aggregate = await UserMongooseModel.aggregate<User>(aggregateArray)
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
