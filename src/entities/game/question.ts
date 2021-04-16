import { prop } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'
import {
	Field,
	InputType,
	ObjectType,
	Int,
	registerEnumType,
} from 'type-graphql'
import { Hint } from './hint'
import { Matching } from './matching'

export enum GAMETYPE {
	LIVECODING = 'LIVECODING',
	MULTIPLECHOICE = 'MULTIPLECHOICE',
	FILLINBLANK = 'FILLINBLANK',
	MATCHING = 'MATCHING',
	SPOTTHEBUG = 'SPOTTHEBUG',
}

registerEnumType(GAMETYPE, {
	name: 'GAMETYPE',
})
@InputType('QuestionInput')
@ObjectType()
export class QuestionInput {
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
	@Field(() => GAMETYPE)
	gameType!: GAMETYPE

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

@InputType()
@ObjectType('QuestionObject')
export class Question extends QuestionInput {
	@Field()
	readonly _id!: ObjectId
}
