import { prop } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'
import { Field, InputType, ObjectType, Int } from 'type-graphql'

@InputType('FillInTheBlankInput')
@ObjectType()
export class FillInTheBlank {
	@Field()
	readonly _id: ObjectId

	@prop({ type: () => [String] })
	@Field(() => [String])
	prompt!: string[]

	@prop({ type: () => [String] })
	@Field(() => [String])
	solutions: string[]
}
