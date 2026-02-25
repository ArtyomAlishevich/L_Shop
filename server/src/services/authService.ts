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
                console.log(`Не найден пользователль с логином ${userData.login}`);
                throw new UnauthorizedError();
            }

            if (!await bcrypt.compare(userData.password, verifyingUser.password)) {
                console.log(`У пользователя с логином ${userData.login} не совпали пароли`);           
                throw new UnauthorizedError();
            }

            return verifyingUser;
        } catch (error) {
            throw error;
        }
    }
}