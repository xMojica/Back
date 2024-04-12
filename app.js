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
