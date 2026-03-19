import { Request, Response } from "express";
import { AuthService } from "../services/authService";
import { DuplicateError } from "../types/duplicateError";
import { IUserRequestDTO } from "../types/iUserRequestDTO";
import { UnauthorizedError } from "../types/unauthorizedError";
import { IUserResponseDTO } from "../types/iUserResponse";

export class AuthController {
/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - login
 *               - password
 *               - name
 *             properties:
 *               login:
 *                 type: string
 *                 example: ivan
 *               password:
 *                 type: string
 *                 format: password
 *                 example: secret123
 *               name:
 *                 type: string
 *                 example: Иван
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 newUser:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Неверные входные данные
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Пользователь с таким логином уже существует
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Ошибка сервера
 */
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
            console.log('Ошибка регистрации пользователя: ' + (error as Error).message);
            if (error instanceof DuplicateError) {
                res.status(409).json({ error: 'Ошибка регистрации пользователя: ' + error.message });
                return;
            }

            res.status(500).json({ error: 'Ошибка регистрации пользователя: ' + (error as Error).message });
        }
    }

/**
     * @openapi
     * /auth/login:
     *   post:
     *     summary: Вход пользователя в систему
     *     description: Аутентификация пользователя и создание сессии
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - login
     *               - password
     *             properties:
     *               login:
     *                 type: string
     *                 example: ivan123
     *               password:
     *                 type: string
     *                 format: password
     *                 example: secret123
     *     responses:
     *       200:
     *         description: Успешный вход, устанавливается сессионная кука
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 user:
     *                   $ref: '#/components/schemas/User'
     *       400:
     *         description: Неверные входные данные
     *       401:
     *         description: Неверный логин или пароль
     *       500:
     *         description: Ошибка сервера
     */
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
            req.session.userId = user.id;

            res.status(200).json({
                user: {
                    id: user.id,
                    login: user.login,
                    name: user.name,
                    createdAt: user.createdAt
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

/**
     * @openapi
     * /auth/logout:
     *   post:
     *     summary: Выход пользователя из системы
     *     description: Завершение сессии и удаление сессионной куки
     *     tags: [Auth]
     *     security:
     *       - sessionCookie: []
     *     responses:
     *       200:
     *         description: Успешный выход
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Пользователь 123 вышел из системы
     *       500:
     *         description: Ошибка сервера
     */
    static logout(req: Request, res: Response) : void {
        try {
            const userId = req.session?.userId;
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