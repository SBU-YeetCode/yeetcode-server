import { prop } from '@typegoose/typegoose'
import { Field, InputType, ObjectType, FieldResolver } from 'type-graphql'
import { ObjectId } from 'mongodb'

@InputType('LevelInput')
@ObjectType()
export class LevelInput {
	@prop()
	@Field()
	title: string

	@prop()
	@Field()
	description: string
}

@InputType()
@ObjectType('LevelObject')
export class Level extends LevelInput {
	@Field()
	readonly _id!: ObjectId
}
