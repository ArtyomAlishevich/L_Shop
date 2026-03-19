import { UsersDatabase } from "../../db/usersDatabase";
import { DuplicateError } from "../types/duplicateError";
import { IUser } from "../types/iUser";
import { IUserRequestDTO } from "../types/iUserRequestDTO";
import { UnauthorizedError } from "../types/unauthorizedError";
import bcrypt from 'bcrypt';
import { BasketsService } from "./basketsService";

export class AuthService {
    /**
     * Регистрирует нового пользователя.
     * 
     * @param newUserData - данные нового пользователя
     * @param newUserData.login - уникальный логин пользователя
     * @param newUserData.password - пароль (будет захэширован)
     * @param newUserData.name - отображаемое имя пользователя
     * 
     * @returns {Promise<IUser>} созданный пользователь с id, хешем пароля и датой регистрации
     * 
     * @throws {DuplicateError} если пользователь с таким логином уже существует
     * @throws {Error} при ошибке базы данных или хеширования пароля
     * 
     * @example
     * const newUser = await AuthService.register({
     *   login: 'ivan123',
     *   password: 'secret123',
     *   name: 'Иван Петров'
     * });
     */
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

        /**
     * Аутентифицирует пользователя по логину и паролю.
     * 
     * @param userData - данные для входа
     * @param userData.login - логин пользователя
     * @param userData.password - пароль для проверки
     * 
     * @returns {Promise<IUser>} найденный пользователь (содержит хеш пароля только для внутреннего использования)
     * 
     * @throws {UnauthorizedError} если пользователь не найден или пароль неверен
     * @throws {Error} при ошибке базы данных
     * 
     * @example
     * const user = await AuthService.login({
     *   login: 'ivan123',
     *   password: 'secret123'
     * });
     */
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