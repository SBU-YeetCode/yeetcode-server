import { prop } from '@typegoose/typegoose'
import { Field, InputType, ObjectType, FieldResolver } from 'type-graphql'
import { ObjectId } from 'mongodb'

@InputType('MatchingInput')
@ObjectType()
export class Matching {
	@Field()
	readonly _id!: ObjectId

	@prop()
	@Field()
	pairOne: string

	@prop()
	@Field()
	pairTwo: string
}
