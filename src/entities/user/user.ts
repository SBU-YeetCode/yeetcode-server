import { prop } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'
import { Field, InputType, ObjectType, Int } from 'type-graphql'
import { ProfilePicture } from './profilePicture'
import { Points } from './points'
import { DateScalar } from '../../utils/scalars'
@ObjectType('User')
@InputType('UserInput')
export class User {
	@Field()
	readonly _id!: ObjectId

	@prop()
	@Field()
	name: string

	@prop()
	@Field()
	username!: string

	@prop()
	@Field()
	email!: string

	@prop({ type: () => [String] })
	@Field(() => [String])
	gamesPlayed!: string[]

	@prop({ type: () => [String] })
	@Field(() => [String])
	gamesCreated!: string[]

	@prop({ type: () => [String] })
	@Field(() => [String])
	gamesCompleted!: string[]

	@prop()
	password: string

	@prop()
	accessToken: string

	@prop({ type: Points })
	@Field(() => Points)
	points: Points

	@prop({ type: ProfilePicture })
	@Field(() => ProfilePicture)
	profilePicture: ProfilePicture

	@prop({ type: () => [String] })
	@Field(() => [String])
	comments: string[]

	@prop({ type: Date })
	@Field(() => DateScalar)
	lastUpdated!: string
}
