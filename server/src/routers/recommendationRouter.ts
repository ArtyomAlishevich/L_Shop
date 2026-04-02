import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { RecommendationController } from '../controllers/recommendationController';

const router = Router();
router.use(authMiddleware);

router.post('/like/:id', RecommendationController.like);
router.delete('/like/:id', RecommendationController.unlike);

export default router;