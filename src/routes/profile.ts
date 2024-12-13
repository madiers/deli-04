import express from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import Merchant from '../models/Merchant';

const router = express.Router();

// Get merchant profile
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const merchant = await Merchant.findById(req.merchantId).select('-password');
        res.json(merchant);
    } catch (error) {
        res.status(400).json({ error: 'Error fetching profile' });
    }
});

// Update merchant profile
router.patch('/me', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const merchant = await Merchant.findByIdAndUpdate(
            req.merchantId,
            { 
                businessName: req.body.businessName,
                phone: req.body.phone
            },
            { new: true }
        ).select('-password');
        res.json(merchant);
    } catch (error) {
        res.status(400).json({ error: 'Error updating profile' });
    }
});

export default router;