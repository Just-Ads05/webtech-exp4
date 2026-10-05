const express = require("express");
const Event = require("../models/Event");
const { auth, adminOnly } = require("../middleware/auth");
const router = express.Router();

// GET /api/events  -> all events (auto-seeds if database is empty)
router.get("/", async (req, res, next) => {
  try {
    let events = await Event.find();

    // Auto-seed sample events if the collection is empty
    if (events.length === 0) {
      events = await Event.insertMany([
        {
          name: "Web Dev Hackathon",
          category: "Technical",
          fee: 200,
          seats: 10,
        },
        {
          name: "AI/ML Challenge",
          category: "Technical",
          fee: 300,
          seats: 5,
        },
        {
          name: "Photography Contest",
          category: "Media",
          fee: 150,
          seats: 12,
        },
      ]);
    }

    res.json(events);
  } catch (err) {
    next(err);
  }
});

// GET /api/events/:id  -> one event
router.get("/:id", async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Not found" });
    res.json(event);
  } catch (err) {
    next(err);
  }
});

// POST /api/events  -> add an event (admin)
router.post("/", auth, adminOnly, async (req, res, next) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
});

// PUT /api/events/:id  -> edit an event (admin)
router.put("/:id", auth, adminOnly, async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!event) return res.status(404).json({ message: "Not found" });
    res.json(event);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/events/:id  -> remove an event (admin)
router.delete("/:id", auth, adminOnly, async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Event deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;