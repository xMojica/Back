const express = require("express");
const { Pool } = require("pg");

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

// Actualizar datos de un cliente ( Cedula no porque es primary Key)
app.put("/cliente", async (req, res) => {
  const clienteActualizado = req.body;

  try {
    if (!clienteActualizado.cedula) {
      res.status(400).send("La cédula del cliente es obligatoria");
      return;
    }

    const result = await pool.query(
      "UPDATE cliente SET primerNombre = $2, segundoNombre = $3, sexo = $4, edad = $5, email = $6, direccion = $7 WHERE cedula = $1 RETURNING *",
      [
        clienteActualizado.cedula,
        clienteActualizado.primerNombre,
        clienteActualizado.segundoNombre,
        clienteActualizado.sexo,
        clienteActualizado.edad,
        clienteActualizado.email,
        clienteActualizado.direccion,
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).send("Cliente no encontrado");
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error("Error al editar cliente en PostgreSQL:", error);
    res.status(500).send("Error interno del servidor");
  }
});

//Metodo para eliminar un lciente con cedula
app.delete("/cliente/:cedula", async (req, res) => {
  const cedulaCliente = req.params.cedula;

  try {
    const result = await pool.query(
      "DELETE FROM cliente WHERE cedula = $1 RETURNING *",
      [cedulaCliente]
    );

    if (result.rows.length === 0) {
      res.status(404).send("Cliente no encontrado");
    } else {
      res.json({ message: "Cliente eliminado exitosamente" });
    }
  } catch (error) {
    console.error("Error al eliminar cliente en PostgreSQL:", error);
    res.status(500).send("Error interno del servidor");
  }
});
