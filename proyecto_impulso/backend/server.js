const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
//cambio 1
const multer = require('multer'); // Importar multer
const path = require('path'); // Importar path

const app = express(); // Crea una instancia de Express
const port = 3001; // Define el puerto del servidor
const db = new sqlite3.Database('./database.sqlite'); // Crea o abre la base de datos SQLite

app.use(cors()); // Habilita CORS para permitir solicitudes desde otros orígenes
app.use(express.json()); // Habilita el análisis de cuerpos de solicitudes JSON
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Servir archivos estáticos


//cambio 2
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });


// db.serialize(() => {
//   try {
//     db.run(`DROP TABLE flujoDeVentas`);
//     console.log("flujosVenta borrada")
//   } catch (error) {
//     console.log("No se pudo borrar flujosVenta")
//   }
// });

// db.serialize(() => {
//   try {
//     db.run(`DELETE FROM productos WHERE id = 3`, function(err) {
//       if (err) {
//         console.error("Error al borrar el producto con id 3:", err.message);
//       } else {
//         console.log("Producto con id 3 borrado");
//       }
//     });
//   } catch (error) {
//     console.error("No se pudo borrar el producto con id 3:", error.message);
//   }
// });


db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    descripcion TEXT,
    precio REAL,
    stock INT
  )`);
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS empleados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    apellido TEXT,
    cedula TEXT,
    telefono TEXT,
    email TEXT,
    cargo TEXT,
    sueldo REAL
  )`);
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    apellido TEXT,
    cedula TEXT,
    telefono TEXT,
    email TEXT,
    plan TEXT,
    fechaPago DATE,
    fechaNacimiento DATE,
    foto BLOB,
    fechaVencimiento DATE
  )`);
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS flujoDeVentas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    descripcion TEXT,
    precio REAL,
    fechaHora DATETIME
  )`);
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS planes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    cantidadMeses INT,
    precio REAL
  )`);
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS cargos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT
  )`);
});

db.run(`CREATE TABLE IF NOT EXISTS ventas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER,
  empleado_id INTEGER,
  carrito TEXT,
  fechaHora DATETIME,
  FOREIGN KEY(cliente_id) REFERENCES clientes(id),
  FOREIGN KEY(empleado_id) REFERENCES empleados(id)
)`);

//probando agregar foto:
// Ruta para agregar un nuevo cliente
app.post('/clientes', upload.single('foto'), (req, res) => {
  const { nombre, apellido, cedula, telefono, email, plan, fechaPago, fechaNacimiento, fechaVencimiento } = req.body;
  const foto = req.file ? req.file.filename : null;

  db.run(`INSERT INTO clientes (nombre, apellido, cedula, telefono, email, plan, fechaPago, fechaNacimiento, foto, fechaVencimiento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [nombre, apellido, cedula, telefono, email, plan, fechaPago, fechaNacimiento, foto, fechaVencimiento],
    function(err) {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.status(201).json({ id: this.lastID });
      }
    });
});

// Ruta para actualizar un cliente
app.put('/clientes/:id', upload.single('foto'), (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, cedula, telefono, email, plan, fechaPago, fechaNacimiento, fechaVencimiento } = req.body;

  // Si hay una nueva foto en la solicitud, usa esa foto
  const foto = req.file ? req.file.filename : null; // Cambié undefined a null para más claridad

  // Construir la consulta SQL dinámica
  const query = `UPDATE clientes SET nombre = ?, apellido = ?, cedula = ?, telefono = ?, email = ?, plan = ?, fechaPago = ?, fechaNacimiento = ?, ${foto ? 'foto = ?, ' : ''}fechaVencimiento = ? WHERE id = ?`;
  
  // Construir el array de parámetros de manera dinámica
  const params = [
    nombre, apellido, cedula, telefono, email, plan, fechaPago, fechaNacimiento, 
    ...(foto ? [foto] : []),  // Añadir la foto solo si está presente
    fechaVencimiento, id
  ];

  // Ejecutar la consulta SQL
  db.run(query, params, function(err) {
    if (err) {
      res.status(500).send(err.message);
    } else {
      if (this.changes > 0) {
        res.status(200).json({ message: 'Cliente actualizado correctamente' });
      } else {
        res.status(404).json({ message: 'Cliente no encontrado' });
      }
    }
  });
});



// Ruta para obtener un cliente por ID
app.get('/clientes/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM clientes WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json(row);
    }
  });
});

app.get('/ventas/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM ventas WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json(row);
    }
  });
});

// Ruta para borrar un cliente
app.delete('/clientes/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM clientes WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).send(err.message);
    }
    if (this.changes > 0) {
      res.status(200).json({ message: 'Cliente borrado correctamente' });
    } else {
      res.status(404).json({ message: 'Cliente no encontrado' });
    }
  });
});







// Ruta para obtener todos los productos
app.get('/productos', (req, res) => {
  db.all("SELECT * FROM productos", [], (err, rows) => {
    if (err) {
      res.status(500).send(err.message); // Manejo de errores
    } else {
      res.json(rows); // Devuelve los productos en formato JSON
      console.log(rows);
    }
  });
});

app.get('/flujoDeVentas', (req, res) => {
  db.all("SELECT * FROM flujoDeVentas", [], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json(rows);
    }
  });
});

app.get('/empleados', (req, res) => {
  db.all("SELECT * FROM empleados", [], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json(rows);
    }
  });
});

app.get('/clientes', (req, res) => {
  db.all("SELECT * FROM clientes", [], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json(rows);
    }
  });
});

app.get('/planes', (req, res) => {
  db.all("SELECT * FROM planes", [], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json(rows);
    }
  });
});

app.get('/cargos', (req, res) => {
  db.all("SELECT * FROM cargos", [], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json(rows);
    }
  });
});

app.get('/ventas', (req, res) => {
  db.all("SELECT * FROM ventas", [], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json(rows);
    }
  });
});

// Ruta para agregar un nuevo producto
app.post('/productos', (req, res) => {
  const { nombre, descripcion, precio, stock } = req.body; // Extrae los datos del cuerpo de la solicitud
  db.run(`INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (?, ?, ?, ?)`,
    [nombre, descripcion, precio, stock],
    function(err) {
      if (err) {
        res.status(500).send(err.message); // Manejo de errores
      } else {
        res.status(201).json({ id: this.lastID }); // Devuelve el ID del nuevo producto
      }
    });
});

app.post('/flujoDeVentas', (req, res) => {
  const { nombre, descripcion, precio, fechaHora } = req.body; // Extrae los datos del cuerpo de la solicitud
  db.run(`INSERT INTO flujoDeVentas (nombre, descripcion, precio, fechaHora) VALUES (?, ?, ?, ?)`,
    [nombre, descripcion, precio, fechaHora],
    function(err) {
      if (err) {
        res.status(500).send(err.message); // Manejo de errores
      } else {
        res.status(201).json({ id: this.lastID }); // Devuelve el ID del nuevo producto
      }
    });
});

// Ruta para agregar un nuevo empleado
app.post('/empleados', (req, res) => {
  console.log("request recibida: ", req.body)
  const { nombre, apellido, cedula, telefono, email, cargo, sueldo } = req.body; // Extrae los datos del cuerpo de la solicitud
  db.run(`INSERT INTO empleados (nombre, apellido, cedula, telefono, email, cargo, sueldo) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [nombre, apellido, cedula, telefono, email, cargo, sueldo],
    function(err) {
      if (err) {
        res.status(500).send(err.message); // Manejo de errores
      } else {
        res.status(201).json({ id: this.lastID }); // Devuelve el ID del nuevo empleado
      }
    });
});

// app.post('/clientes', (req, res) => {
//   console.log("entra al POST: solicitud recibida: ", req.body)
//   const { nombre, apellido, cedula, telefono, email, plan, fechaPago, fechaNacimiento, foto, fechaVencimiento } = req.body; // Extrae los datos del cuerpo de la solicitud
//   db.run(`INSERT INTO clientes (nombre, apellido, cedula, telefono, email, plan, fechaPago, fechaNacimiento, foto, fechaVencimiento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//     [nombre, apellido, cedula, telefono, email, plan, fechaPago,fechaNacimiento, foto, fechaVencimiento],
//     function(err) {
//       if (err) {
//         res.status(500).send(err.message); // Manejo de errores
//       } else {
//         res.status(201).json({ id: this.lastID }); // Devuelve el ID del nuevo cliente
//       }
//     });
// });

// Ruta para agregar un nuevo plan
app.post('/planes', (req, res) => {
  const { nombre, cantidadMeses, precio} = req.body; // Extrae los datos del cuerpo de la solicitud
  db.run(`INSERT INTO planes (nombre, cantidadMeses, precio) VALUES (?, ?, ?)`,
    [nombre, cantidadMeses, precio],
    function(err) {
      if (err) {
        res.status(500).send(err.message); // Manejo de errores
      } else {
        res.status(201).json({ id: this.lastID }); // Devuelve el ID del nuevo producto
      }
    });
});

app.post('/cargos', (req, res) => {
  const { nombre } = req.body; // Extrae los datos del cuerpo de la solicitud
  db.run(`INSERT INTO cargos (nombre) VALUES (?)`,
    [nombre],
    function(err) {
      if (err) {
        res.status(500).send(err.message); // Manejo de errores
      } else {
        res.status(201).json({ id: this.lastID }); // Devuelve el ID del nuevo producto
      }
    });
});

app.use(bodyParser.json());

app.post('/ventas', (req, res) => {
  const { cliente, empleado, carrito, fechaHora } = req.body;

  const carritoString = JSON.stringify(carrito);

  db.run(
    `INSERT INTO ventas (cliente_id, empleado_id, carrito, fechaHora) VALUES (?, ?, ?, ?)`,
    [cliente.id, empleado.id, carritoString, fechaHora],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

app.delete('/productos/:id', (req, res) => {
  console.log("request delete: ")
  const { id } = req.params; // Extrae el ID de los parámetros de la solicitud
  db.run(`DELETE FROM productos WHERE id = ?`, id, function(err) {
    if (err) {
      res.status(500).send(err.message); // Manejo de errores
    } else {
      if (this.changes > 0) {
        res.status(200).json({ message: 'Producto eliminado correctamente' }); // Confirma la eliminación
      } else {
        res.status(404).json({ message: 'Producto no encontrado' }); // Maneja el caso donde no se encontró el producto
      }
    }
  });
});

app.delete('/ventas/:id', (req, res) => {
  console.log("request delete: ")
  const { id } = req.params; // Extrae el ID de los parámetros de la solicitud
  db.run(`DELETE FROM ventas WHERE id = ?`, id, function(err) {
    if (err) {
      res.status(500).send(err.message); // Manejo de errores
    } else {
      if (this.changes > 0) {
        res.status(200).json({ message: 'Venta eliminada correctamente' }); // Confirma la eliminación
      } else {
        res.status(404).json({ message: 'Venta no encontrada' }); // Maneja el caso donde no se encontró la venta
      }
    }
  });
});

app.delete('/empleados/:id', (req, res) => {
  console.log("request delete: ")
  const { id } = req.params; // Extrae el ID de los parámetros de la solicitud
  db.run(`DELETE FROM empleados WHERE id = ?`, id, function(err) {
    if (err) {
      res.status(500).send(err.message); // Manejo de errores
    } else {
      if (this.changes > 0) {
        res.status(200).json({ message: 'Empleado eliminado correctamente' }); // Confirma la eliminación
      } else {
        res.status(404).json({ message: 'Empleado no encontrado' }); // Maneja el caso donde no se encontró el empleado
      }
    }
  });
});

// app.delete('/clientes/:id', (req, res) => {
//   console.log("request delete: ")
//   const { id } = req.params; // Extrae el ID de los parámetros de la solicitud
//   db.run(`DELETE FROM clientes WHERE id = ?`, id, function(err) {
//     if (err) {
//       res.status(500).send(err.message); // Manejo de errores
//     } else {
//       if (this.changes > 0) {
//         res.status(200).json({ message: 'Cliente eliminado correctamente' }); // Confirma la eliminación
//       } else {
//         res.status(404).json({ message: 'Cliente no encontrado' }); // Maneja el caso donde no se encontró el cliente
//       }
//     }
//   });
// });

app.delete('/flujoDeVentas/:id', (req, res) => {
  console.log("request delete: ")
  const { id } = req.params; // Extrae el ID de los parámetros de la solicitud
  db.run(`DELETE FROM flujoDeVentas WHERE id = ?`, id, function(err) {
    if (err) {
      res.status(500).send(err.message); // Manejo de errores
    } else {
      if (this.changes > 0) {
        res.status(200).json({ message: 'Venta eliminada correctamente' }); // Confirma la eliminación
      } else {
        res.status(404).json({ message: 'Venta no encontrada' }); // Maneja el caso donde no se encontró la venta
      }
    }
  });
});

app.delete('/planes/:id', (req, res) => {
  console.log("request delete: ")
  const { id } = req.params; // Extrae el ID de los parámetros de la solicitud
  db.run(`DELETE FROM planes WHERE id = ?`, id, function(err) {
    if (err) {
      res.status(500).send(err.message); // Manejo de errores
    } else {
      if (this.changes > 0) {
        res.status(200).json({ message: 'Plan eliminado correctamente' }); // Confirma la eliminación
      } else {
        res.status(404).json({ message: 'Plan no encontrado' }); // Maneja el caso donde no se encontró el plan
      }
    }
  });
});

app.delete('/cargos/:id', (req, res) => {
  console.log("request delete: ")
  const { id } = req.params; // Extrae el ID de los parámetros de la solicitud
  db.run(`DELETE FROM cargos WHERE id = ?`, id, function(err) {
    if (err) {
      res.status(500).send(err.message); // Manejo de errores
    } else {
      if (this.changes > 0) {
        res.status(200).json({ message: 'Cargo eliminado correctamente' }); // Confirma la eliminación
      } else {
        res.status(404).json({ message: 'Cargo no encontrado' }); // Maneja el caso donde no se encontró el plan
      }
    }
  });
});

// Ruta para actualizar un producto
app.put('/productos/:id', (req, res) => {
  const { id } = req.params; // Extrae el ID de los parámetros de la solicitud
  const { nombre, descripcion, precio, stock } = req.body; // Extrae los datos del cuerpo de la solicitud
  db.run(`UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ? WHERE id = ?`,
    [nombre, descripcion, precio, stock, id],
    function(err) {
      if (err) {
        res.status(500).send(err.message); // Manejo de errores
      } else {
        if (this.changes > 0) {
          res.status(200).json({ message: 'Producto actualizado correctamente' }); // Confirma la actualización
        } else {
          res.status(404).json({ message: 'Producto no encontrado' }); // Maneja el caso donde no se encontró el producto
        }
      }
    });
});

// Ruta para actualizar un cliente
// app.put('/clientes/:id', (req, res) => {
//   const { id } = req.params; // Extrae el ID de los parámetros de la solicitud
//   console.log("body cliente: ", req.body);
//   const { nombre, apellido, cedula, telefono, email, plan, fechaPago,fechaNacimiento, foto, fechaVencimiento } = req.body; // Extrae los datos del cuerpo de la solicitud
//   db.run(`UPDATE clientes SET nombre = ?, apellido = ?, cedula = ?, telefono = ?, email = ?, plan = ?, fechaPago = ?, fechaNacimiento = ?, foto = ?, fechaVencimiento = ? WHERE id = ?`,
//     [nombre, apellido, cedula, telefono, email, plan, fechaPago, fechaNacimiento, foto, fechaVencimiento, id],
//     function(err) {
//       if (err) {
//         res.status(500).send(err.message); // Manejo de errores
//       } else {
//         if (this.changes > 0) {
//           res.status(200).json({ message: 'Cliente actualizado correctamente' }); // Confirma la actualización
//         } else {
//           res.status(404).json({ message: 'Cliente no encontrado' }); // Maneja el caso donde no se encontró el producto
//         }
//       }
//     });
// });

// Ruta para actualizar un empleado
app.put('/empleados/:id', (req, res) => {
  const { id } = req.params; // Extrae el ID de los parámetros de la solicitud
  const { nombre, apellido, cedula, telefono, email, cargo, sueldo} = req.body; // Extrae los datos del cuerpo de la solicitud
  db.run(`UPDATE empleados SET nombre = ?, apellido = ?, cedula = ?, telefono = ?, email = ?, cargo = ?, sueldo = ? WHERE id = ?`,
    [nombre, apellido, cedula, telefono, email, cargo, sueldo, id],
    function(err) {
      if (err) {
        res.status(500).send(err.message);
      } else {
        if (this.changes > 0) {
          res.status(200).json({ message: 'Empleado actualizado correctamente' }); // Confirma la actualización
        } else {
          res.status(404).json({ message: 'Empleado no encontrado' }); // Maneja el caso donde no se encontró el producto
        }
      }
    });
});

// Ruta para actualizar un flujo
app.put('/flujoDeVentas/:id', (req, res) => {
  const { id } = req.params; // Extrae el ID de los parámetros de la solicitud
  const { nombre, descripcion, precio, fechaHora} = req.body; // Extrae los datos del cuerpo de la solicitud
  db.run(`UPDATE flujoDeVentas SET nombre = ?, descripcion = ?, precio = ?, fechaHora = ? WHERE id = ?`,
    [nombre, descripcion, precio, fechaHora, id],
    function(err) {
      if (err) {
        res.status(500).send(err.message);
      } else {
        if (this.changes > 0) {
          res.status(200).json({ message: 'Flujo actualizado correctamente' }); // Confirma la actualización
        } else {
          res.status(404).json({ message: 'Flujo no encontrado' }); // Maneja el caso donde no se encontró el producto
        }
      }
    });
});
// Inicia el servidor y escucha en el puerto especificado
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
