import { ObjectId } from 'mongodb'
import {
    Query,
    Resolver,
    Arg
} from 'type-graphql'
import { Service } from 'typedi'
import { User, } from '../../entities'
import { UserMongooseModel } from './model'
import UserService from './service'


@Service() // Dependencies injection
@Resolver((of) => User)
export default class UserResolver {
    constructor(private readonly userService: UserService) { }
    @Query((returns) => User, { nullable: true })
    async getUser(@Arg('id') id: ObjectId) {
        const user = await this.userService.getById(id)

        return user
    }
}
