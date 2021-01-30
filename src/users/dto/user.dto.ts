import { Exclude } from "class-transformer";
import { User } from "../interfaces/user.interface";

export class UserDTO {
    @Exclude()
    password: string;
    _id: string;
    constructor(user: Partial<User>) {
        const userJSON = user.toJSON({ getters: true, virtuals: true });
        userJSON._id = userJSON.id;
        Object.assign(this, userJSON);
    }
}