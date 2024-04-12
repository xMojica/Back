const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
const port = 3000;

// Conexion a la base de datos POSTGRESQL
const pool = new Pool({
  user: "prueba_0l47_user",
  host: "dpg-cnlu042cn0vc73ds6k8g-a.oregon-postgres.render.com",
  database: "prueba_0l47",
  password: "8RR5dNXAOwLClqXqKlgMJrKFbV5VSzFD",
  port: 5432,
  ssl: true,
});

app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`La aplicación está activa en el puerto: ${port}`);
});

//Validar usuario y contraseña del usuario
app.post("/login", async (req, res) => {
  const { usuario, contrasena } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT * FROM cliente WHERE usuario = $1 AND contrasena = $2",
      [usuario, contrasena]
    );
    client.release();
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(500).json({ message: "Credenciales inválidas" });
    }
  } catch (err) {
    console.error("Error al consultar la base de datos", err);
    res.status(500).json({ message: "Error al consultar la base de datos" });
  }
});

// Crear nuevvo usuario
app.post("/register", async (req, res) => {
  const {
    nit,
    primernombre,
    segundonombre,
    primerapellido,
    segundoapellido,
    fechanacimiento,
    telefono,
    email,
    usuario,
    contrasena,
  } = req.body;

  try {
    const client = await pool.connect();

    const existingUser = await client.query(
      "SELECT * FROM cliente WHERE usuario = $1",
      [usuario]
    );

    if (existingUser.rows.length > 0) {
      client.release();
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    const nuevo = await client.query(
      "INSERT INTO cliente (nit, primernombre, segundonombre, primerapellido, segundoapellido, fechanacimiento, telefono, email, usuario, contrasena) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
      [
        nit,
        primernombre,
        segundonombre,
        primerapellido,
        segundoapellido,
        fechanacimiento,
        telefono,
        email,
        usuario,
        contrasena,
      ]
    );

    client.release();
    res.status(201).json({
      message: "Usuario creado exitosamente",
      nuevo: nuevo.rows[0],
    });
  } catch (err) {
    console.error("Error al consultar o insertar en la base de datos", err);
    res.status(500).json({ message: "Error al insertar en la base de datos" });
  }
});

// Buscar clientes
app.get("/cliente", async (req, res) => {
  const { usuario } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT * FROM cliente WHERE usuario = $1",
      [usuario]
    );
    console.log(usuario);
    client.release();
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ message: "Cliente no encontrado" });
    }
  } catch (err) {
    console.error("Error al consultar la base de datos", err);
    res.status(500).json({ message: "Error al consultar la base de datos" });
  }
});

// Actualizar usuario existente
app.put("/update", async (req, res) => {
  const {
    nit,
    primernombre,
    segundonombre,
    primerapellido,
    segundoapellido,
    fechanacimiento,
    telefono,
    email,
    contrasena,
    usuario,
  } = req.body; // Datos actualizados del usuario

  try {
    const client = await pool.connect();

    // Verificar si el usuario existe
    const existingUser = await client.query(
      "SELECT * FROM cliente WHERE usuario = $1",
      [usuario]
    );

    if (existingUser.rows.length === 0) {
      client.release();
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Actualizar el usuario
    const updatedUser = await client.query(
      "UPDATE cliente SET nit = $1, primernombre = $2, segundonombre = $3, primerapellido = $4, segundoapellido = $5, fechanacimiento = $6, telefono = $7, email = $8, contrasena = $9 WHERE usuario = $10 RETURNING *",
      [
        nit,
        primernombre,
        segundonombre,
        primerapellido,
        segundoapellido,
        fechanacimiento,
        telefono,
        email,
        contrasena,
        usuario,
      ]
    );

    client.release();
    res.status(200).json({
      message: "Usuario actualizado exitosamente",
      usuarioActualizado: updatedUser.rows[0],
    });
  } catch (err) {
    console.error("Error al actualizar en la base de datos", err);
    res
      .status(500)
      .json({ message: "Error al actualizar en la base de datos" });
  }
});
