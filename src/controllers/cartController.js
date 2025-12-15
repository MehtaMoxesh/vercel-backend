import Cart from '../models/Cart.js';
import Sweet from '../models/Sweet.js';

// Get current user's cart
export const getCart = async (req, res) => {
  const userId = req.user._id;
  const cart = await Cart.findOne({ user: userId }).populate('items.sweet');
  if (!cart) return res.status(200).json({ items: [] });

  // Remove any items that reference sweets which no longer exist
  const filtered = cart.items.filter((i) => i.sweet);
  if (filtered.length !== cart.items.length) {
    cart.items = filtered;
    await cart.save();
    await cart.populate('items.sweet');
  }

  res.json(cart);
};

// Add an item to cart (or increase quantity)
export const addItem = async (req, res) => {
  const userId = req.user._id;
  const { sweetId, quantity = 1 } = req.body;
  if (!sweetId || quantity <= 0) return res.status(400).json({ message: 'Invalid item or quantity' });

  const sweet = await Sweet.findById(sweetId);
  if (!sweet) return res.status(404).json({ message: 'Sweet not found' });
  if (Number(quantity) > sweet.quantity) return res.status(400).json({ message: 'Insufficient stock for requested quantity' });

  // Find or create cart
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  const existing = cart.items.find((i) => i.sweet.toString() === sweetId);
  if (existing) {
    existing.quantity += Number(quantity);
  } else {
    cart.items.push({ sweet: sweetId, quantity: Number(quantity) });
  }
  await cart.save();
  await cart.populate('items.sweet');
  res.status(201).json(cart);
};

// Update item quantity
export const updateItem = async (req, res) => {
  const userId = req.user._id;
  const { itemId } = req.params; // item id is the embedded _id of the cart item
  const { quantity } = req.body;
  if (quantity == null || quantity < 0) return res.status(400).json({ message: 'Invalid quantity' });

  const cart = await Cart.findOne({ user: userId });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });
  await cart.populate('items.sweet');

  const item = cart.items.id(itemId);
  if (!item) return res.status(404).json({ message: 'Item not found in cart' });

  // If the referenced sweet was deleted, remove the item and inform the caller
  if (!item.sweet) {
    item.remove();
    await cart.save();
    await cart.populate('items.sweet');
    return res.status(400).json({ message: 'Item no longer available', cart });
  }

  // Ensure requested quantity doesn't exceed stock
  if (Number(quantity) > item.sweet.quantity) {
    return res.status(400).json({ message: 'Requested quantity exceeds available stock' });
  }

  if (quantity === 0) {
    item.remove();
  } else {
    item.quantity = Number(quantity);
  }
  await cart.save();
  await cart.populate('items.sweet');
  res.json(cart);
};

// Remove item
export const removeItem = async (req, res) => {
  const userId = req.user._id;
  const { itemId } = req.params;
  const cart = await Cart.findOne({ user: userId });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });
  const item = cart.items.id(itemId);
  if (!item) return res.status(404).json({ message: 'Item not found in cart' });
  item.remove();
  await cart.save();
  await cart.populate('items.sweet');
  res.json(cart);
};

// Checkout: purchase all items in cart, decrease quantities atomically as far as possible
export const checkout = async (req, res) => {
  const userId = req.user._id;
  const cart = await Cart.findOne({ user: userId }).populate('items.sweet');
  if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart empty' });

  // Track updated sweets to rollback if needed
  const updated = [];
  try {
    for (const item of cart.items) {
      const sweetId = item.sweet._id || item.sweet;
      const qty = item.quantity;

      // Atomically decrement if enough stock
      const updatedSweet = await Sweet.findOneAndUpdate(
        { _id: sweetId, quantity: { $gte: qty } },
        { $inc: { quantity: -qty } },
        { new: true }
      );
      if (!updatedSweet) {
        throw new Error(`Out of stock for item ${item.sweet.name || sweetId}`);
      }
      updated.push({ id: sweetId, qty });
    }

    // Clear cart items on success
    cart.items = [];
    await cart.save();
    return res.json({ message: 'Checkout successful' });
  } catch (err) {
    // Rollback any partial updates
    for (const u of updated) {
      await Sweet.findByIdAndUpdate(u.id, { $inc: { quantity: u.qty } });
    }
    return res.status(400).json({ message: err.message || 'Checkout failed' });
  }
};
