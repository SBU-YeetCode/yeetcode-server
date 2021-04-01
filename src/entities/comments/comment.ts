import { ObjectType, InputType, Field, Int } from 'type-graphql'
import { prop } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'
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

	// date
	@prop({ type: String })
	@Field()
	dateCreated: string

	// date
	@prop({ type: String })
	@Field()
	lastUpdated: string
}

@ObjectType()
export class Comment extends CommentInput {
	@Field()
	readonly _id!: ObjectId
}
