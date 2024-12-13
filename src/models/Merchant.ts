// src/models/Merchant.ts
import mongoose, { Document } from 'mongoose';

// Define interface for WhatsApp settings
interface WhatsAppSettings {
    enabled: boolean;
    welcomeMessage: string;
    autoReply: boolean;
    menuMessage?: string;
    whatsappNumber: { type: String, unique: true },  // The Twilio WhatsApp number
    businessHours?: {
        enabled: boolean;
        start?: string;
        end?: string;
        timezone?: string;
    };
}

// Define interface for the Merchant document
export interface IMerchant extends Document {
    businessName: string;
    email: string;
    password: string;
    phone: string;
    plan: 'starter' | 'growth' | 'enterprise';
    whatsapp: WhatsAppSettings;
    createdAt: Date;
}

// Create the schema
const merchantSchema = new mongoose.Schema<IMerchant>({
    businessName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    plan: { 
        type: String, 
        enum: ['starter', 'growth', 'enterprise'],
        default: 'starter'
    },
    whatsapp: {
        enabled: { type: Boolean, default: false },
        welcomeMessage: { type: String, default: 'Welcome to our store!' },
        autoReply: { type: Boolean, default: true },
        menuMessage: String,
        businessHours: {
            enabled: { type: Boolean, default: false },
            start: String,
            end: String,
            timezone: String
        }
    },
    createdAt: { type: Date, default: Date.now }
});

export const Merchant = mongoose.model<IMerchant>('Merchant', merchantSchema);
export default Merchant;