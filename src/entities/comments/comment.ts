import { ObjectType, InputType, Field, Int } from 'type-graphql'
import { prop } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'

@InputType('CommentInput')
@ObjectType()
export class Comment {
	@Field()
	readonly _id!: ObjectId

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
	rating: number

	// date
	@prop({ type: Number })
	@Field(() => Int)
	dateCreated: number

	// date
	@prop({ type: Number })
	@Field(() => Int)
	lastUpdated: number
}
