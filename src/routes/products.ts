import express, { Response, Request, NextFunction } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import Product from '../models/Product';

const router = express.Router();

// Get all merchant's products
router.get('/', authMiddleware, (req: AuthRequest, res: Response, next: NextFunction) => {
    Product.find({ merchantId: req.merchantId })
        .then(products => res.json(products))
        .catch(error => {
            res.status(400).json({ error: 'Error fetching products' });
        });
});

// Add a new product
router.post('/', authMiddleware, (req: AuthRequest, res: Response, next: NextFunction) => {
    Product.create({
        ...req.body,
        merchantId: req.merchantId
    })
        .then(product => res.status(201).json(product))
        .catch(error => {
            res.status(400).json({ error: 'Error creating product' });
        });
});

// Update a product
router.patch('/:id', authMiddleware, (req: AuthRequest, res: Response, next: NextFunction) => {
    Product.findOneAndUpdate(
        { _id: req.params.id, merchantId: req.merchantId },
        req.body,
        { new: true }
    )
        .then(product => {
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.json(product);
        })
        .catch(error => {
            res.status(400).json({ error: 'Error updating product' });
        });
});

// Delete a product
router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response, next: NextFunction) => {
    Product.findOneAndDelete({
        _id: req.params.id,
        merchantId: req.merchantId
    })
        .then(product => {
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.json({ message: 'Product deleted' });
        })
        .catch(error => {
            res.status(400).json({ error: 'Error deleting product' });
        });
});

export default router;