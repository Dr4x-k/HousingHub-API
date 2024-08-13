const express = require("express");
const router = express.Router();
const Subscription = require("../Models/subscription");

router.post("/", async (req, res) => {
  try {
    const { endpoint, keys, userId } = req.body;

    const existingSubscription = await Subscription.findOne({ endpoint });
    if (existingSubscription) {
      return res.status(400).json({ message: "La suscripción ya existe" });
    }

    const newSubscription = new Subscription({
      endpoint: endpoint,
      keys: keys,
      userid: userId,
    });

    const savedSubscription = await newSubscription.save();
    res.status(201).json(savedSubscription);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
