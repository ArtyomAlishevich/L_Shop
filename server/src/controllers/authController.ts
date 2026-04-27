import { Request, Response } from "express";
import { AuthService } from "../services/authService";
import { DuplicateError } from "../types/duplicateError";
import { IUserRequestDTO } from "../types/iUserRequestDTO";
import { UnauthorizedError } from "../types/unauthorizedError";
import { IUserResponseDTO } from "../types/iUserResponse";
import { UsersDatabase } from "../../db/usersDatabase";

export class AuthController {
    static async register(req: Request, res: Response) : Promise<void> {
        try {
            const { login, password, name } = req.body;
            if (!login || !password || !name) {
                res.status(400).send({ error: 'Ошибка регистрации пользователя: логин, пароль и имя пользователя обязательны '});
                return;
            }

            if (typeof login !== "string" || typeof password !== "string" || typeof name !== "string") {
                res.status(400).send({ error: 'Ошибка регистрации пользователя: логин, пароль и имя пользователя должны быть строками' });
                return;
            }

            const newUserData : IUserRequestDTO = {
                login: login,
                password: password,
                name: name
            };
            const user = await AuthService.register(newUserData);
            const newUser : IUserResponseDTO = {
                login: user.login,
                id: user.id,
                createdAt: user.createdAt,
                name: user.name,
                role: user.role
            }
            (req.session as any).userId = user.id;
            res.status(201).json({ newUser: newUser });
        }
        catch (error) {
            console.log('Ошибка регистрации пользователя: ' + (error as Error).message);
            if (error instanceof DuplicateError) {
                res.status(409).json({ error: 'Ошибка регистрации пользователя: ' + error.message });
                return;
            }

            res.status(500).json({ error: 'Ошибка регистрации пользователя: ' + (error as Error).message });
        }
    }

    static async login(req: Request, res: Response) : Promise<void> {
        try {
            const { login, password } = req.body;
            if (!login || !password) {
                res.status(400).json({ error: 'Ошибка авторизации пользователя: логин и пароль обязательны' });
                return;
            }

            if (typeof login !== 'string' || typeof password !== 'string') {
                res.status(400).json({ error: 'Ошибка авторизации пользователя: логин и пароль должны быть строками'});
                return;
            }

            const verifyingUser : IUserRequestDTO = {
                login: login,
                password: password
            }
            const user = await AuthService.login(verifyingUser);

            const maxAge = user.role === 'admin' ? 30 * 60 * 1000 : 10 * 60 * 1000;
            req.session.cookie.maxAge = maxAge;
            (req.session as any).userId = user.id;

            res.status(200).json({
                user: {
                    id: user.id,
                    login: user.login,
                    name: user.name,
                    createdAt: user.createdAt,
                    role: user.role
                }
            });
        } catch (error) {
            console.log('Ошибка авторизации пользователя: ' + (error as Error).message);
            if (error instanceof UnauthorizedError) {
                res.status(401).json({ error: 'Ошибка авторизации пользователя: ' + error.message });
                return;
            }

            res.status(500).json({ error: 'Ошибка авторизации пользователя:' + (error as Error).message });
        }
    }

    static async me(req: Request, res: Response) : Promise<void> {
        try {
            const userId = (req.session as any).userId;
            if (!userId) {
                res.status(401).json({ error: 'Не авторизован' });
                return;
            }

            const user = UsersDatabase.getById(userId);
            if (!user) {
                res.status(401).json({ error: 'Пользователь не найден' });
                return;
            }

            res.status(200).json({
                user: {
                    id: user.id,
                    login: user.login,
                    name: user.name,
                    createdAt: user.createdAt,
                    role: user.role
                }
            });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        }
    }

    static logout(req: Request, res: Response) : void {
        try {
            const userId = (req.session as any).userId;
            req.session.destroy((err) => {
                if (err) {
                    console.log(`Ошибка уничтожении сессии при выходе из системы: ${err}`);
                    res.status(500).json({ error: 'Ошибка уничтожении сессии при выходе из системы: ' + err });
                }

                res.clearCookie('shop.session', {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax'
                });

                console.log(`Пользователь ${userId} вышел из системы`);
                res.status(200).json({ message: `Пользователь ${userId} вышел из системы` });
            });
        } catch (error) {
            console.log(`Ошибка при выходе пользователя из системы: ` + (error as Error).message);
            res.status(500).json({ error: `Ошибка при выходе пользователя из системы: ` + (error as Error).message });
        }
    }
}