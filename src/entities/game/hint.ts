import { prop } from '@typegoose/typegoose'
import { Field, InputType, ObjectType, FieldResolver, Int } from 'type-graphql'
import { ObjectId } from 'mongodb'

@InputType('HintInput')
@ObjectType()
export class Hint {
	@Field()
	readonly _id!: ObjectId

	@prop()
	@Field()
	description: string

	@prop()
	@Field(() => Int)
	timeToReveal: number
}
