import { ObjectId } from 'mongodb'
import { Service } from 'typedi'
import UserModel from './model'

@Service() // Dependencies injection
export default class UserService {
    constructor(private readonly userModel: UserModel) {

    }
    public async getById(id: ObjectId) {
        const user = await this.userModel.getById(id)
        if (!user) throw new Error('No user found')
        return user
    }


}
