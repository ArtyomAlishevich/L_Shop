import { IUser } from "../src/types/iUser";
import { IUserRequestDTO } from "../src/types/iUserRequestDTO";
import usersData from "./users.json";
import bcrypt from 'bcrypt';
import uuid from 'uuid';
import fs from 'fs/promises';
import path from 'path';

export class UsersDatabase {
    static getByLogin(login: string) : IUser | undefined {
        try {
            return (usersData.users as IUser[]).find(u => u.login === login);
        } catch (error) {
            throw error;
        }
    }

    static getById(id: string) : IUser | undefined {
        try {
            return (usersData.users as IUser[]).find(u => u.id === id);
        } catch (error) {
            throw error;
        }
    }

    static async register(newUserData: IUserRequestDTO) : Promise<IUser> {
            try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newUserData.password, salt);

            const newUser: IUser = {
                id: uuid.v4(),
                name: newUserData.name as string,
                login: newUserData.login,
                password: hashedPassword,
                createdAt: new Date().toLocaleDateString('ru-RU'),
                role: 'user'
            }
            usersData.users.push(newUser);
            await fs.writeFile(path.join(__dirname, 'users.json'), JSON.stringify(usersData, null, 2));
            console.log(`Пользователь ${newUser.login} зарегистрирован`);
            return newUser;
        } catch (error) {
            throw error;
        }
    }
    static async updateLastVisit(userId: string): Promise<void> {
    const users = usersData.users as IUser[];
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
        users[index].lastVisit = new Date().toISOString();
        await fs.writeFile(path.join(__dirname, 'users.json'), JSON.stringify(usersData, null, 2));
    }
}
}