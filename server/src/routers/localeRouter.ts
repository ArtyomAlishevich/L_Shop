import { Router } from 'express';
import { LocaleController } from '../controllers/localeController';

const localeRouter : Router = Router();
localeRouter.get('/', LocaleController.getLocale);
localeRouter.post('/', LocaleController.setLocale);

export default localeRouter;


