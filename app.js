const express = require("express");
const { Pool } = require("pg");

const app = express();
const port = 3000;

// Configuración de la base de datos
const pool = new Pool({
  user: "prueba_0l47_user",
  host: "dpg-cnlu042cn0vc73ds6k8g-a.oregon-postgres.render.com",
  database: "prueba_0l47",
  password: "8RR5dNXAOwLClqXqKlgMJrKFbV5VSzFD",
  port: 5432,
  ssl: true,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`La aplicación está escuchando en http://localhost:${port}`);
});

// Obtener todos los clientes
app.get("/cliente", async (req, res) => {
  try {
    const result = await pool.query("select * from cliente");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener datos de PostgreSQL:", error);
    res.status(500).send("Error interno del servidor");
  }
});

//Obtener un cliente por cedula
app.get("/cliente/:cedula", async (req, res) => {
  const cedula = req.params.cedula;

  try {
    // Utiliza $1 para evitar posibles ataques de SQL injection
    const result = await pool.query("SELECT * FROM cliente WHERE cedula = $1", [
      cedula,
    ]);

    if (result.rows.length === 0) {
      res.status(404).send("Cliente no encontrado");
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error("Error al obtener datos de PostgreSQL:", error);
    res.status(500).send("Error interno del servidor");
  }
});

//Agregar un cliente
app.post("/cliente", async (req, res) => {
  const { cedula, primerNombre, segundoNombre, sexo, edad, email, direccion } =
    req.body;

  try {
    // Utiliza $1, $2, etc., para evitar posibles ataques de SQL injection
    const result = await pool.query(
      "INSERT INTO cliente (cedula, primerNombre, segundoNombre, sexo, edad, email, direccion) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [cedula, primerNombre, segundoNombre, sexo, edad, email, direccion]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al agregar cliente a PostgreSQL:", error);
    res.status(500).send("Error interno del servidor");
  }
});
