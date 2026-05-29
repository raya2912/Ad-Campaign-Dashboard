import { Router } from 'express';
import { getCampaigns, getCampaignById, createCampaign, updateCampaign, deleteCampaign } from '../controllers/campaignController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getCampaigns);
router.get('/:id', getCampaignById);
router.post('/', createCampaign);
router.put('/:id', updateCampaign);
router.delete('/:id', deleteCampaign);

export default router;
