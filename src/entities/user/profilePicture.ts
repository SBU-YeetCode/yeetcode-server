import { prop } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'
import { Field, InputType, ObjectType } from 'type-graphql'

@InputType('ProfilePictureInput')
@ObjectType()
export class ProfilePicture {
	@prop()
	@Field()
	avatar: string

	@prop()
	@Field()
	large: string
}
