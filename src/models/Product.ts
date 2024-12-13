import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    merchantId: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    inStock: { type: Boolean, default: true }
});

export default mongoose.model('Product', productSchema);