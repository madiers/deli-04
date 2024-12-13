import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    merchantId: { type: mongoose.Schema.Types.ObjectId, required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true }
    }],
    total: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Order', orderSchema);