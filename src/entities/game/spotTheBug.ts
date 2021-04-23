import { prop } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'
import { Field, InputType, ObjectType, Int } from 'type-graphql'

@InputType('SpotTheBugInput')
@ObjectType()
export class SpotTheBug {
	@Field()
	readonly _id!: ObjectId

	@prop()
	@Field()
	prompt!: string

	@prop()
	@Field(() => Int)
	bugLine!: number

	@prop()
	@Field(() => String)
	code!: string
}
