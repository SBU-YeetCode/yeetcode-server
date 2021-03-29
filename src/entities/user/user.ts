import { prop } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'
import { Field, InputType, ObjectType, FieldResolver } from 'type-graphql'

@ObjectType('User')
@InputType('UserInput')
export class User {
    @Field()
    readonly _id!: ObjectId

    @prop()
    @Field()
    username!: string

    @prop()
    @Field()
    email!: string

    @prop()
    @Field()
    name: string

    @prop()
    password: string

}