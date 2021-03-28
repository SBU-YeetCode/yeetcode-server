import { prop } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
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