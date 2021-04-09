import {ArgsType, Field } from 'type-graphql'
import IsValidUser from '../validators/isValidUser'
import IsValidGame from '../validators/isValidGame'
import {ObjectId} from 'mongodb'

@ArgsType()
export class CreateGameProgress {

    @IsValidUser()
    @Field(() => ObjectId)
    userId: ObjectId

    @IsValidGame()
    @Field(() => String)
    gameId: string
}