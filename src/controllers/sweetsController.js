import Sweet from '../models/Sweet.js';
import Cart from '../models/Cart.js';

export const create = async (req, res) => {
  const { name, category, price, quantity } = req.body;
  if (!name || !category || price == null || quantity == null) return res.status(400).json({ message: 'Missing fields' });
  const sweet = await Sweet.create({ name, category, price: Number(price), quantity: Number(quantity) });
  res.status(201).json(sweet);
};

export const getAll = async (req, res) => {
  const sweets = await Sweet.find();
  res.json(sweets);
};

export const search = async (req, res) => {
  const { q, category, minPrice, maxPrice } = req.query;
  const filter = {};
  if (q) filter.name = { $regex: q, $options: 'i' };
  if (category) filter.category = category;
  if (minPrice || maxPrice) filter.price = {};
  if (minPrice) filter.price.$gte = Number(minPrice);
  if (maxPrice) filter.price.$lte = Number(maxPrice);
  const sweets = await Sweet.find(filter);
  res.json(sweets);
};

export const update = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const sweet = await Sweet.findByIdAndUpdate(id, data, { new: true });
  if (!sweet) return res.status(404).json({ message: 'Not found' });
  res.json(sweet);
};

export const remove = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Sweet.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });

    // Remove the deleted sweet from any user carts
    await Cart.updateMany(
      { 'items.sweet': id },
      { $pull: { items: { sweet: id } } }
    );

    const sweets = await Sweet.find();
    console.log(`Admin ${req.user?.email || req.user?._id} deleted sweet ${id}`);
    return res.json({ message: 'Deleted', sweets });
  } catch (err) {
    console.error('Delete sweet failed', err);
    return res.status(500).json({ message: 'Failed to delete' });
  }
};

export const purchase = async (req, res) => {
  const { id } = req.params;
  const sweet = await Sweet.findById(id);
  if (!sweet) return res.status(404).json({ message: 'Not found' });
  if (sweet.quantity < 1) return res.status(400).json({ message: 'Out of stock' });
  sweet.quantity -= 1;
  await sweet.save();
  res.json(sweet);
};

export const restock = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  if (!quantity || Number(quantity) <= 0) return res.status(400).json({ message: 'Invalid quantity' });
  const sweet = await Sweet.findById(id);
  if (!sweet) return res.status(404).json({ message: 'Not found' });
  sweet.quantity += Number(quantity);
  await sweet.save();
  res.json(sweet);
};
