import {
	registerDecorator,
	ValidationOptions,
	ValidationArguments,
} from 'class-validator'
import { UserMongooseModel } from '../user/model'

export default function IsValidUser(
	validationOptions?: ValidationOptions
) {
	return function (object: Object, propertyName: string) {
		registerDecorator({
			name: 'isValidUser',
			target: object.constructor,
			propertyName: propertyName,
			options: {message: "Invalid User Id",...validationOptions},
			validator: {
				async validate(value: any, args: ValidationArguments) {
                    return UserMongooseModel.exists({_id: value})
				},
			},
		})
	}
}
