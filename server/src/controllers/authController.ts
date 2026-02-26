import { Request, Response } from "express";
import { AuthService } from "../services/authService";
import { DuplicateError } from "../types/duplicateError";
import { IUserRequestDTO } from "../types/iUserRequestDTO";
import { UnauthorizedError } from "../types/unauthorizedError";
import { IUserResponseDTO } from "../types/iUserResponse";

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
                name: user.name
            }
            req.session.userId = user.id;
            res.status(201).json({ newUser: newUser });
        }
        catch (error) {
            console.log((error as Error).message);          
            if (error instanceof DuplicateError) {
                res.status(409).json({ error: error.message });
                return;
            }

            res.status(500).json({ error: (error as Error).message });
        }
    }

    static async login(req: Request, res: Response) {
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

            const veryfyingUser : IUserRequestDTO = {
                login: login,
                password: password
            }

            const user = await AuthService.login(veryfyingUser);
            req.session.userId = user.id;
            res.status(200).send();
        } catch (error) {
            console.log((error as Error).message);
            if (error instanceof UnauthorizedError) {
                res.status(401).json({ error: error.message });
                return;
            }

            res.status(500).json({ error: (error as Error).message });
        }
    }
}