import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  sweet: { type: mongoose.Schema.Types.ObjectId, ref: 'Sweet', required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const CartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [CartItemSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Cart', CartSchema);
