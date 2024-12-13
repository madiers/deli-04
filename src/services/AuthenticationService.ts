// src/services/AuthenticationService.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Merchant, IMerchant } from '../models/Merchant';

export default class AuthenticationService {
    async register(data: {
        businessName: string;
        email: string;
        password: string;
        phone: string;
        plan?: string;
    }) {
        // Check if email already exists
        const existingMerchant = await Merchant.findOne({ email: data.email });
        if (existingMerchant) {
            throw new Error('Email already registered');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create new merchant
        const merchant = await Merchant.create({
            ...data,
            password: hashedPassword
        });

        // Generate JWT token
        const token = this.generateToken(merchant._id);

        return {
            token,
            merchant: {
                id: merchant._id,
                businessName: merchant.businessName,
                email: merchant.email,
                plan: merchant.plan
            }
        };
    }

    async login(data: { email: string; password: string }) {
        // Find merchant by email
        const merchant = await Merchant.findOne({ email: data.email });
        if (!merchant) {
            throw new Error('Invalid credentials');
        }

        // Check password
        const validPassword = await bcrypt.compare(data.password, merchant.password);
        if (!validPassword) {
            throw new Error('Invalid credentials');
        }

        // Generate JWT token
        const token = this.generateToken(merchant._id);

        return {
            token,
            merchant: {
                id: merchant._id,
                businessName: merchant.businessName,
                email: merchant.email,
                plan: merchant.plan
            }
        };
    }

    private generateToken(merchantId: string | any): string {
        return jwt.sign(
            { merchantId },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );
    }
}