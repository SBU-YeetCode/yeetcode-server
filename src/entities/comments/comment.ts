import { ObjectType, InputType, Field, Int } from 'type-graphql'
import { prop, modelOptions } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'
import { DateScalar } from '../../utils/scalars'
import { Min, Max } from 'class-validator'
import IsValidUser from '../../modules/validators/isValidUser'
import IsValidGame from '../../modules/validators/isValidGame'

@ObjectType()
@InputType('CommentInput')
export class CommentInput {
	@prop()
	@Field()
	@IsValidGame()
	gameId: string

	@prop()
	@Field()
	@IsValidUser()
	userId: string

	@prop()
	@Field()
	review: string

	@prop({ type: Number })
	@Field(() => Int)
	@Min(0)
	@Max(5)
	rating: number
}

@ObjectType()
@modelOptions({schemaOptions: {
	timestamps: {
		createdAt: 'dateCreated',
		updatedAt: 'lastUpdated'
	}
}})
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
