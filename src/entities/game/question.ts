import { prop } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'
import { Field, InputType, ObjectType, Int } from 'type-graphql'
import { Hint } from './hint'
import { Matching } from './matching'

@InputType('QuestionInput')
@ObjectType()
export class Question {
	@Field()
	readonly _id!: ObjectId

	@prop()
	@Field()
	sequence!: string

	@prop()
	@Field()
	title!: string

	@prop()
	@Field()
	description!: string

	@prop()
	@Field(() => Int)
	timeLimit!: number

	@prop()
	@Field(() => Int)
	points!: number

	@prop()
	@Field(() => Int)
	lives!: number

	@prop({ type: [Hint] })
	@Field(() => [Hint])
	hints: Hint[]

	@prop()
	@Field()
	gameType!: string

	@prop()
	@Field()
	toAnswer!: string

	@prop()
	@Field()
	exampleSolutionCode!: string

	@prop()
	@Field()
	exampleSolutionDescription!: string

	@prop()
	@Field()
	correctChoice!: string

	@prop({ type: () => [String] })
	@Field(() => [String])
	incorrectChoices!: string[]

	@prop({ type: Matching })
	@Field(() => [Matching])
	matchings: Matching[]
}
