import { ObjectType, InputType, Field, Int } from 'type-graphql'
import { prop } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'
import { DateScalar } from '../../utils/scalars'
import { Min, Max } from 'class-validator'

@ObjectType()
@InputType('CommentInput')
export class CommentInput {
	@prop()
	@Field()
	gameId: string

	@prop()
	@Field()
	userId: string

	@prop()
	@Field()
	review: string

	@prop({ type: Number })
	@Field(() => Int)
	@Min(1)
	@Max(5)
	rating: number
}

@ObjectType()
export class Comment extends CommentInput {
	@Field()
	readonly _id!: ObjectId
	// date
	@prop({ type: Date })
	@Field(() => DateScalar)
	dateCreated: string

	// date
	@prop({ type: Date })
	@Field(() => DateScalar)
	lastUpdated: string
}
