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
  console.log(`La aplicación está escuchando en http://localhost:${port}`);
});

app.post("/login", async (req, res) => {
  const { usuario, contrasena } = req.body;

  // Consultar la base de datos para verificar el usuario y la contraseña
  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT * FROM cliente WHERE usuario = $1 AND contrasena = $2",
      [usuario, contrasena]
    );
    client.release();

    // Si las credenciales son correctas, devuelve un 200 OK
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
