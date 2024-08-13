const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  propertyid: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startdate: { type: Date, required: true },
  enddate: { type: Date, required: true },
  totalprice: { type: Number, required: true },
  status: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reservation', reservationSchema);