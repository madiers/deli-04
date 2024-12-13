import express, { Response, NextFunction } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import Order from '../models/Order';

const router = express.Router();

// Get all merchant's orders
router.get('/', authMiddleware, (req: AuthRequest, res: Response, next: NextFunction) => {
    Order.find({ merchantId: req.merchantId })
        .sort({ createdAt: -1 })
        .then(orders => {
            res.json(orders);
        })
        .catch(() => next());
});

// Get single order
router.get('/:id', authMiddleware, (req: AuthRequest, res: Response, next: NextFunction) => {
    Order.findOne({ _id: req.params.id, merchantId: req.merchantId })
        .then(order => {
            if (!order) {
                res.status(404).json({ error: 'Order not found' });
                return;
            }
            res.json(order);
        })
        .catch(() => next());
});

// Create order
router.post('/', authMiddleware, (req: AuthRequest, res: Response, next: NextFunction) => {
    Order.create({
        ...req.body,
        merchantId: req.merchantId
    })
        .then(order => {
            res.status(201).json(order);
        })
        .catch(() => next());
});

// Update order status
router.patch('/:id/status', authMiddleware, (req: AuthRequest, res: Response, next: NextFunction) => {
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'delivered', 'cancelled'].includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
    }

    Order.findOneAndUpdate(
        { _id: req.params.id, merchantId: req.merchantId },
        { status },
        { new: true }
    )
        .then(order => {
            if (!order) {
                res.status(404).json({ error: 'Order not found' });
                return;
            }
            res.json(order);
        })
        .catch(() => next());
});

export default router;