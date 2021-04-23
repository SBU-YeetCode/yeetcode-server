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
import { MultipleChoice } from './multipleChoice'
import { FillInTheBlank } from './fillInTheBlank'
import { LiveCoding } from './liveCoding'
import { SpotTheBug } from './spotTheBug'
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

	@prop({ type: MultipleChoice })
	@Field(() => MultipleChoice, { nullable: true })
	multipleChoice?: MultipleChoice

	@prop({ type: LiveCoding })
	@Field(() => LiveCoding, { nullable: true })
	liveCoding?: LiveCoding

	@prop({ type: FillInTheBlank })
	@Field(() => FillInTheBlank, { nullable: true })
	fillInTheBlank?: FillInTheBlank

	@prop({ type: Matching })
	@Field(() => Matching, { nullable: true })
	matching?: Matching

	@prop({ type: SpotTheBug })
	@Field(() => SpotTheBug, { nullable: true })
	spotTheBug?: SpotTheBug

	// @prop()
	// @Field()
	// exampleSolutionCode!: string

	// @prop()
	// @Field()
	// exampleSolutionDescription!: string

	// @prop()
	// @Field()
	// correctChoice!: string

	// @prop({ type: () => [String] })
	// @Field(() => [String])
	// incorrectChoices!: string[]

	// @prop({ type: Matching })
	// @Field(() => [Matching])
	// matchings: Matching[]
}

@InputType()
@ObjectType('QuestionObject')
export class Question extends QuestionInput {
	@Field()
	readonly _id!: ObjectId
}
