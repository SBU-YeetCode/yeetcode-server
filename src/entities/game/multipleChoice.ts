import { prop } from '@typegoose/typegoose'
import { Field, InputType, ObjectType } from 'type-graphql'
import { ObjectId } from 'mongodb'

@InputType('MultipleChoiceInput')
@ObjectType()
export class MultipleChoice {
	@Field()
	readonly _id!: ObjectId

	@prop()
	@Field()
	prompt!: string

	@prop()
	@Field()
	correctChoice: string

	@prop({ type: () => [String] })
	@Field(() => [String])
	incorrectChoices!: string[]
}
