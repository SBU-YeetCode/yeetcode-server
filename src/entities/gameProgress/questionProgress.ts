import { ObjectType, Field, Int, InputType } from 'type-graphql'
import { prop } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'
import { DateScalar } from '../../utils/scalars'

@InputType('QuestionProgressInput')
@ObjectType()
export class QuestionProgress {
	@prop()
	@Field()
	questionId: string

	@prop({ type: Boolean })
	@Field(() => Boolean)
	completed: boolean

	@prop({ type: Number })
	@Field(() => Int)
	livesLeft: number

	@prop({ type: () => Number })
	@Field(() => Int)
	pointsReceived: number

	@prop({ type: Date, required: false })
	@Field(() => DateScalar, { nullable: true })
	dateStarted?: string | null

	@prop({ type: Date, required: false })
	@Field(() => DateScalar, { nullable: true })
	dateCompleted?: string | null

	@prop({ type: [String] })
	@Field(() => [String] )
	hintsRevealed: string[]
}
