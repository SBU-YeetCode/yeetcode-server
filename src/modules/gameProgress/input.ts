import {ArgsType, Field } from 'type-graphql'
import IsValidUser from '../validators/isValidUser'
// import IsValidGameProgress from '../validators/isValidGameProgress'
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

@ArgsType()
export class DeleteGameProgress {

    @IsValidUser()
    @Field(() => ObjectId)
    userId: ObjectId

    // @IsValidGameProgress()
    @Field(() => String)
    gameProgressId: string
}