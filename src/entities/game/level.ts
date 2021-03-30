import { prop } from '@typegoose/typegoose'
import { Field, InputType, ObjectType, FieldResolver } from 'type-graphql'

@InputType('LevelInput')
@ObjectType()
export class Level {
	@prop()
	@Field()
	id: string

	@prop()
	@Field()
	title: string

	@prop()
	@Field()
	description: string
}
