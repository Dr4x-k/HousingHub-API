const express = require("express");
const router = express.Router();
const Reservation = require("../Models/reservation");
const moment = require("moment");
const reservation = require("../Models/reservation");
const user = require("../Models/user");
const Subscription = require("../Models/subscription");

// Crear una nueva reserva
router.post("/", async (req, res) => {
  try {
    const { property, user, startdate, enddate, totalprice } = req.body;

    // const userData = await user.findById({ _id: user });

    const startDateFormatted = moment(startdate, "DD/MM/YYYY").toDate();
    const endDateFormatted = moment(enddate, "DD/MM/YYYY").toDate();

    const reservation = new Reservation({
      propertyid: property,
      userid: user,
      startdate: startDateFormatted,
      enddate: endDateFormatted,
      totalprice,
    });

    const savedReservation = await reservation.save();

    // const subscriptions = await Subscription.find({ userid: userData._id });
    // const payload = JSON.stringify({
    //   title: "Nueva reserva",
    //   message: `Se ha creado una nueva reserva para el apartamento ${property} del ${startDateFormatted} al ${endDateFormatted}`,
    // });

    // subscriptions.forEach((sub) => {
    //   webpush
    //     .sendNotificaction(sub, payload)
    //     .catch((err) => console.log("Error enviando notificación: ", err));
    // });

    res.status(201).json(savedReservation);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// Cancelar reservación por id
router.patch("/:id/cancel", async (req, res) => {
  try {
    const reservationId = req.params.id;

    const reservation = await Reservation.findByIdAndUpdate(
      reservationId,
      { status: 0 },
      { new: true }
    );

    if (!reservation)
      return res.status(404).json({ message: "Reservación no encontrada " });

    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ message: "Error al cancelar la reservación" });
  }
});

// Obtener todas las reservas
router.get("/:userid", async (req, res) => {
  const userid = req.params.userid;
  try {
    const reservations = await Reservation.find({ userid: userid })
      .populate({
        path: "propertyid",
        select: "title pricenight",
        populate: {
          path: "userid",
          select: "name",
        },
      })
      .exec();

    // Mapeo y simplificación de los datos antes de enviarlos
    const flatReservations = reservations.map((reservation) => {
      const property = reservation.propertyid || {};
      const user = reservation.propertyid?.userid || {};

      return {
        _id: reservation._id,
        property: {
          _id: property._id,
          title: property.title,
          pricenight: property.pricenight,
        },
        user: {
          _id: user._id,
          name: user.name,
        },
        startdate: reservation.startdate,
        enddate: reservation.enddate,
        totalprice: reservation.totalprice,
        status: reservation.status,
        createdAt: reservation.createdAt,
        updatedAt: reservation.updatedAt,
      };
    });
    console.log(flatReservations[0]);

    res.json(flatReservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// router.get("/:userid", async (req, res) => {
//   const userid = req.params.userid;
//   try {
//     const reservations = await Reservation.find({ userid: userid })
//       .populate({
//         path: "propertyid",
//         select: "title pricenight", // Campos del modelo PropertyModel que queremos incluir
//         populate: {
//           path: "userid",
//           select: "name", // Campos del modelo UserModel que queremos incluir
//         },
//       })
//       .exec();

//     // Asegúrate de que los datos poblados existen antes de mapear
//     const flatReservations = reservations.map((reservation) => {
//       const property = reservation.propertyid || {};
//       const user = reservation.propertyid?.userid || {}; // Acceder al campo userid anidado

//       return {
//         _id: reservation._id,
//         propertyid: {
//           _id: property._id,
//           title: property.title,
//           pricenight: property.pricenight,
//         },
//         userid: {
//           _id: user._id,
//           name: user.name,
//         },
//         startdate: reservation.startdate,
//         enddate: reservation.enddate,
//         totalprice: reservation.totalprice,
//         status: reservation.status,
//         createdAt: reservation.createdAt,
//         updatedAt: reservation.updatedAt,
//       };
//     });

//     console.log(flatReservations[0]);

//     res.json(flatReservations);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// router.get("/:userid", async (req, res) => {
//   const userid = req.params.userid;
//   try {
//     const reservations = await Reservation.find({ userid: userid });
//     console.log(reservations[0]);
//     res.json(reservations);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// Obtener una reserva por ID
router.get("/:id", getReservation, (req, res) => {
  res.json(res.reservation);
});

// Actualizar una reserva
router.patch("/:id", getReservation, async (req, res) => {
  if (req.body.propertyid != null) {
    res.reservation.propertyid = req.body.propertyid;
  }
  if (req.body.userid != null) {
    res.reservation.userid = req.body.userid;
  }
  if (req.body.startdate != null) {
    res.reservation.startdate = req.body.startdate;
  }
  if (req.body.enddate != null) {
    res.reservation.enddate = req.body.enddate;
  }
  if (req.body.totalprice != null) {
    res.reservation.totalprice = req.body.totalprice;
  }
  if (req.body.status != null) {
    res.reservation.status = req.body.status;
  }
  res.reservation.updatedAt = Date.now();

  try {
    const updatedReservation = await res.reservation.save();
    res.json(updatedReservation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Eliminar una reserva
router.delete("/:id", getReservation, async (req, res) => {
  try {
    await res.reservation.remove();
    res.json({ message: "Reserva eliminada" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware para obtener reserva por ID
async function getReservation(req, res, next) {
  let reservation;
  try {
    reservation = await Reservation.findById(req.params.id);
    if (reservation == null) {
      return res
        .status(404)
        .json({ message: "No se pudo encontrar la reserva" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.reservation = reservation;
  next();
}

module.exports = router;
