import { Min, Max } from 'class-validator'
import { ArgsType, Field, InputType, Int, ObjectType } from 'type-graphql'
import { User } from '../../entities'
import { LANGUAGES } from '../game/input'
import { PaginatedResponse } from '../utils/pagination'
import { ObjectId } from 'mongodb'

@ObjectType()
export class PaginatedUserResponse extends PaginatedResponse(User) {}

@ArgsType()
export class GetLeaderboardInput {
	@Field(() => LANGUAGES, { nullable: true })
	language: LANGUAGES | null | 'total'
}

@ArgsType()
export class UpdateUserInput {
	@Field()
	readonly _id!: ObjectId

	@Field()
	newName?: string

	@Field()
	newUsername?: string

	@Field()
	newAvatar?: string

	@Field()
	newLargePicture?: string
}
