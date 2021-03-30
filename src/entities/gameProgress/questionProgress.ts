import { ObjectType, Field, Int, InputType } from 'type-graphql'
import { prop } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'

@InputType('QuestionProgressInput')
@ObjectType()
export class QuestionProgress {
	@Field()
	readonly _id: ObjectId

	@prop()
	@Field()
	questionid: string

	@prop({ type: Boolean })
	@Field(() => Boolean)
	completed: boolean

	@prop({ type: Number })
	@Field(() => Int)
	livesLeft: number

	@prop({ type: () => Number })
	@Field(() => Int)
	pointsReceived: number
}
