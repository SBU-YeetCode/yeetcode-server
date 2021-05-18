import { prop } from '@typegoose/typegoose'
import { Field, InputType, ObjectType } from 'type-graphql'
import { ObjectId } from 'mongodb'

@InputType('LiveCodingInput')
@ObjectType()
export class LiveCoding {
	@Field()
	readonly _id!: ObjectId

	@prop()
	@Field()
	prompt!: string

	@prop()
	@Field()
	exampleSolutionCode!: string

	@prop()
	@Field()
	exampleSolutionDescription!: string

	@prop()
	@Field({ description: 'The expected stdout' })
	expectedOutput!: string

	@prop()
	@Field()
	stdin!: string
}
