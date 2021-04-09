import { ObjectType, Field, Int, InputType } from 'type-graphql'
import { modelOptions, prop } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'
import { LevelProgress } from './levelProgress'
import { StageProgress } from './stageProgress'
import { QuestionProgress } from './questionProgress'
import { DateScalar } from '../../utils/scalars'

@InputType('GameProgressInput')
@ObjectType()
export class GameProgressInput {
	@prop()
	@Field()
	userId: string

	@prop()
	@Field()
	gameId: string

	@prop({ type: Date, required: false})
	@Field(() => DateScalar, {nullable: true})
	completedAt?: string | null

	@prop({ default: false })
	@Field()
	isCompleted: boolean

	@prop({ type: () => [LevelProgress], default: [] })
	@Field(() => [LevelProgress], { defaultValue: [] })
	levels: LevelProgress[]

	@prop({ type: () => [StageProgress], default: [] })
	@Field(() => [StageProgress], { defaultValue: [] })
	stages: StageProgress[]

	@prop({ type: () => [QuestionProgress], default: [] })
	@Field(() => [QuestionProgress], { defaultValue: [] })
	questions: QuestionProgress[]
}

@ObjectType()
@modelOptions({
	schemaOptions: {
		timestamps: {
			createdAt: 'startedAt',
		},
	},
})
export class GameProgress extends GameProgressInput {
	@Field()
	readonly _id: ObjectId

	@prop({ type: Date })
	@Field(() => DateScalar)
	startedAt: string
}
