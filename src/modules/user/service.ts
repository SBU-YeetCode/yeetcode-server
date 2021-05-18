import { ObjectId } from 'mongodb'
import { Service } from 'typedi'
import { User } from '../../entities'
import CommentModel from '../comment/model'
import { LANGUAGES } from '../game/input'
import GameModel from '../game/model'
import GameService from '../game/service'
import GameProgressModel from '../gameProgress/model'
import { Deleted } from '../utils/output'
import { PaginationInput } from '../utils/pagination'
import { PaginatedUserResponse, UpdateUserInput } from './input'
import UserModel, { UserMongooseModel } from './model'

@Service() // Dependencies injection
export default class UserService {
	constructor(
		private readonly userModel: UserModel,
		private readonly commentModel: CommentModel,
		private readonly gameModel: GameModel,
		private readonly gameService: GameService,
		private readonly gameProgressModel: GameProgressModel
	) {}
	public async getById(id: ObjectId) {
		const user = await this.userModel.getById(id)
		if (!user) throw new Error('No user found')
		return user
	}

	public async getByUsername(username: string) {
		const user = await this.userModel.getByUsername(username)
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
		if (pagination.cursor) userCursor = await this.getById(new ObjectId(pagination.cursor))
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
		aggregateArray.push({ $sort: { ...sorter, _id: sort_descending } })
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
			nextCursor: hasMore ? nodes[nodes.length - 1]._id.toHexString() : null,
			nodes,
		}
	}

	public async updateUser(newUserData: UpdateUserInput) {
		const { newName, newUsername, newAvatar, newLargePicture, newBio } = newUserData
		const oldUser = await this.userModel.findById(newUserData.userId)
		if (!oldUser) throw new Error(`User could not be found with ID: ${newUserData.userId}`)
		// If setting a username, ensure it is unique
		if (newUsername && newUsername!==oldUser.username) {
			const usernameTaken = await UserMongooseModel.exists({
				username: newUsername,
			})
			if (usernameTaken) throw new Error(`Username already taken: ${newUsername}`)
		}
		// Begin updating
		if (newName) oldUser.name = newName
		if (newUsername) oldUser.username = newUsername
		if (newAvatar) oldUser.profilePicture.avatar = newAvatar
		if (newLargePicture) oldUser.profilePicture.large = newLargePicture
		if (newBio) oldUser.bio = newBio
		const updatedUser = await oldUser.save()
		if (!updatedUser) throw new Error('Error updating document')
		return oldUser.toObject() as User
	}

	public async deleteUser(userId: ObjectId) {
		const userExists = await this.userModel.getById(userId)
		if (!userExists) throw new Error('User not found')
		// Delete/get games made by user
		const gamesToDelete = await this.gameModel.getGames({
			createdBy: userId,
		})
		const deleteTotal: Deleted = {
			success: true,
			err: null,
			amountDeleted: 0,
		}
		for (var i = 0; i < gamesToDelete.length; i++) {
			const gameDeletion = await this.gameService.deleteGame(
				gamesToDelete[i]._id.toHexString(),
				userId.toHexString()
			)
			deleteTotal.amountDeleted += gameDeletion.amountDeleted
			if (!gameDeletion.success) {
				deleteTotal.success = false
				deleteTotal.err = gameDeletion.err
			}
		}
		// Delete comments made by user
		const commentDeletion = await this.commentModel.deleteMany({ userId })
		if (commentDeletion.ok !== 1) {
			deleteTotal.success = false
			deleteTotal.err = 'Error deleting comments created by user'
		} else deleteTotal.amountDeleted += commentDeletion.deletedCount!
		// Delete game progress used by user
		const gameProgressDeletion = await this.gameProgressModel.deleteMany({
			userId,
		})
		if (gameProgressDeletion.ok !== 1) {
			deleteTotal.success = false
			deleteTotal.err = 'Error deleting game progress used by user'
		} else deleteTotal.amountDeleted += gameProgressDeletion.deletedCount!
		// Delete user account
		const userDeletion = await this.userModel.deleteUser(userId.toHexString())
		if (userDeletion.ok !== 1) {
			deleteTotal.success = false
			deleteTotal.err = 'Error deleting user document'
		} else deleteTotal.amountDeleted += userDeletion.deletedCount!
		return deleteTotal
	}
}
