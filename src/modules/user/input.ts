import { Min, Max } from 'class-validator'
import { ArgsType, Field, Int, ObjectType } from 'type-graphql'
import { User } from '../../entities'
import { LANGUAGES } from '../game/input'
import { PaginatedResponse } from '../utils/pagination'

@ObjectType()
export class PaginatedUserResponse extends PaginatedResponse(User) {}

@ArgsType()
export class GetLeaderboardInput {
	@Field(() => LANGUAGES, { nullable: true })
	language: LANGUAGES | null | 'total'
}
