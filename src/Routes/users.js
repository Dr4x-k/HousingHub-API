const express = require("express");
const router = express.Router();
const User = require("../Models/user");

// Crear un nuevo usuario
router.post("/", async (req, res) => {
  const user = new User(req.body);
  try {
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
});

// Obtener todos los usuarios
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Obtener un usuario por ID
router.get("/:id", getUser, (req, res) => {
  res.json(res.user);
});

// Actualizar un usuario
router.patch("/:id", getUser, async (req, res) => {
  if (req.body.username != null) {
    res.user.username = req.body.username;
  }
  if (req.body.email != null) {
    res.user.email = req.body.email;
  }
  if (req.body.password != null) {
    res.user.password = req.body.password;
  }
  if (req.body.firstname != null) {
    res.user.firstname = req.body.firstname;
  }
  if (req.body.lastname != null) {
    res.user.lastname = req.body.lastname;
  }
  if (req.body.status != null) {
    res.user.status = req.body.status;
  }
  res.user.updatedAt = Date.now();

  try {
    const updatedUser = await res.user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Eliminar un usuario
router.delete("/:id", getUser, async (req, res) => {
  try {
    await res.user.remove();
    res.json({ message: "Usuario eliminado" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware para obtener usuario por ID
async function getUser(req, res, next) {
  let user;
  try {
    user = await User.findById(req.params.id);
    if (user == null) {
      return res
        .status(404)
        .json({ message: "No se pudo encontrar el usuario" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.user = user;
  next();
}
// Ruta de login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);

  try {
    // Buscar al usuario por su email
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Comparar la contraseña en texto plano
    if (password !== user.password) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    // Enviar una respuesta exitosa
    res.json({ message: "Inicio de sesión exitoso", userid: user._id });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
