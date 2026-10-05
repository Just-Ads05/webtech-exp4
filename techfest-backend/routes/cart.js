const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const Cart = require("../models/Cart");
const Event = require("../models/Event");
const Order = require("../models/Order");

// 1. GET /api/cart -> Fetch current user's cart
router.get("/", auth, async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id }).populate("items.eventId");
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

// 2. POST /api/cart/add -> Add item to user's cart (with stock limit check)
router.post("/add", auth, async (req, res, next) => {
  const { eventId } = req.body;
  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) cart = new Cart({ userId: req.user.id, items: [] });

    const existingItem = cart.items.find(
      (item) => item.eventId.toString() === eventId
    );

    const currentQty = existingItem ? existingItem.quantity : 0;
    if (currentQty + 1 > event.seats) {
      return res
        .status(400)
        .json({ message: `Cannot add more. Only ${event.seats} tickets available.` });
    }

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({ eventId, quantity: 1 });
    }

    await cart.save();
    cart = await cart.populate("items.eventId");
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

// 3. POST /api/cart/update -> Increment or Decrement ticket quantity (with stock limit check)
router.post("/update", auth, async (req, res, next) => {
  const { eventId, action } = req.body;
  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (item) => item.eventId.toString() === eventId
    );

    if (itemIndex > -1) {
      if (action === "increment") {
        if (cart.items[itemIndex].quantity + 1 > event.seats) {
          return res
            .status(400)
            .json({ message: `Maximum available tickets (${event.seats}) reached.` });
        }
        cart.items[itemIndex].quantity += 1;
      } else if (action === "decrement") {
        cart.items[itemIndex].quantity -= 1;
        if (cart.items[itemIndex].quantity <= 0) {
          cart.items.splice(itemIndex, 1);
        }
      }
      await cart.save();
    }
    cart = await cart.populate("items.eventId");
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

// 4. POST /api/cart/checkout -> Process payment, deduct seats, create Order, and clear cart
router.post("/checkout", auth, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate("items.eventId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (let item of cart.items) {
      const event = await Event.findById(item.eventId._id);
      if (!event || event.seats < item.quantity) {
        return res
          .status(400)
          .json({ message: `Not enough seats left for ${item.eventId ? item.eventId.name : "this event"}` });
      }
      event.seats -= item.quantity;
      await event.save();

      totalAmount += event.fee * item.quantity;
      orderItems.push({
        event: { name: event.name, category: event.category },
        quantity: item.quantity,
        feeAtPurchase: event.fee,
      });
    }

    const newOrder = await Order.create({
      userId: req.user.id,
      items: orderItems,
      totalAmount,
    });

    cart.items = [];
    await cart.save();

    res.json({ message: "Payment Successful!", order: newOrder });
  } catch (err) {
    next(err);
  }
});

module.exports = router;