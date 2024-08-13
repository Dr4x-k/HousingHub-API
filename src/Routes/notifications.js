const express = require("express");
const router = express.Router();
const Notification = require("../Models/notification");

// const createNotification = async (atitle, message)

// Obtener todas las notificaciones
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ timestamp: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
