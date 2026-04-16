import { UsersDatabase } from "../../db/usersDatabase";
import { DuplicateError } from "../types/duplicateError";
import { IUser } from "../types/iUser";
import { IUserRequestDTO } from "../types/iUserRequestDTO";
import { UnauthorizedError } from "../types/unauthorizedError";
import bcrypt from 'bcrypt';
import { BasketsService } from "./basketsService";

export class AuthService {
    static async register(newUserData: IUserRequestDTO) : Promise<IUser> {
        try {
            if (UsersDatabase.getByLogin(newUserData.login)) {
                throw new DuplicateError(`Пользователь с логином ${newUserData.login} уже существует`);
            }

            const newUser = await UsersDatabase.register(newUserData);
            await BasketsService.create(newUser);
            return newUser;
        } catch (error) {
            throw error;
        }
    }

    static async login(userData: IUserRequestDTO): Promise<IUser> {
        try {
            const verifyingUser = UsersDatabase.getByLogin(userData.login);
            if (!verifyingUser) {
                throw new UnauthorizedError();
            }

            if (!await bcrypt.compare(userData.password, verifyingUser.password)) {
                throw new UnauthorizedError();
            }

            await UsersDatabase.updateLastVisit(verifyingUser.id);

            return verifyingUser;
        } catch (error) {
            throw error;
        }
    }
}