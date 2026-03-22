import { Response, Request } from "express";
export class LocaleController {
    static getLocale(req: Request, res: Response) : void {
        try {
            const locale = req.session.locale || 'ru';
            res.status(200).json({ data: locale });
        } catch (error) {
            console.log(`Ошибка при получении локализации пользователя: ${(error as Error).message}`);
            res.status(500).json({ error: `Ошибка при получении локализации пользователя: ${(error as Error).message}`});
        }
    }

    static setLocale(req: Request, res: Response) : void {
        try {
            const { locale } = req.body;
            if (locale && (locale === 'ru' || locale === 'en')) {
                req.session.locale = locale;
                res.status(200).json({ data: locale });
            }
        } catch (error) {
            console.log(`Ошибка при установке локализации пользователя: ${(error as Error).message}`);
            res.status(500).json(`Ошибка при установке локализации пользователя: ${(error as Error).message}`);
        }
    }
}