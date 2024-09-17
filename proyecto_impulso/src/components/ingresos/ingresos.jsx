import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ingresos.module.css'; // Importa el módulo de estilos

const Ingresos = () => {
  // Estados
  const [ventas, setVentas] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermCliente, setSearchTermCliente] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [showVentas, setShowVentas] = useState(false);

  const [filterByDay, setFilterByDay] = useState(true); // alternar entre filtrado por día o mes
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalFiltrado, setTotalFiltrado] = useState(0);



  useEffect(() => {
    cargarProductos();
    cargarClientes();
    cargarEmpleados();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const firstProduct = filteredProductos[0];
      if (firstProduct) {
        setSelectedProduct(firstProduct);
      }
    } else {
      setSelectedProduct(null);
    }
  }, [searchTerm, productos]);

  useEffect(() => {
    if (searchTermCliente) {
      const firstCliente = filteredClientes[0];
      if (firstCliente) {
        setClienteSeleccionado(firstCliente);
      }
    } else {
      setClienteSeleccionado(null);
    }
  }, [searchTermCliente, clientes]);

  useEffect(() => {
    fetchVentas();
  }, []);

  const filteredVentas = ventas.filter((venta) => {
    const ventaDate = new Date(venta.fechaHora);

    if (filterByDay && selectedDate) {
      const [year, month, day] = selectedDate.split('-');
      const match =
        ventaDate.getFullYear() === parseInt(year) &&
        ventaDate.getMonth() + 1 === parseInt(month) &&
        ventaDate.getDate() === parseInt(day);

      // Debugging para ver si se cumple la condición
      console.log(`Filtrando por día: ${selectedDate} | Venta: ${ventaDate} | Coincide: ${match}`);
      
      return match;

    } else if (!filterByDay && selectedMonth) {
      const [year, month] = selectedMonth.split('-');
      const match =
        ventaDate.getFullYear() === parseInt(year) &&
        ventaDate.getMonth() + 1 === parseInt(month);

      // Debugging para ver si se cumple la condición
      console.log(`Filtrando por mes: ${selectedMonth} | Venta: ${ventaDate} | Coincide: ${match}`);
      
      return match;
    }

    // Si no hay filtro activo, devuelve true para mostrar todas las ventas
    return true;
  });

  useEffect(() => {
    const calcularTotalFiltrado = () => {
      const total = filteredVentas.reduce((acc, venta) => {
        let carrito;
        try {
          carrito = JSON.parse(venta.carrito);
        } catch (error) {
          console.error('Error al parsear el carrito:', error);
          carrito = [];
        }
        return acc + carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
      }, 0);
      setTotalFiltrado(total);
    };
  
    calcularTotalFiltrado();
  }, [filteredVentas, filterByDay, selectedDate, selectedMonth]);
  
  const toggleVentas = () => setShowVentas(!showVentas);
  const toggleFilter = () => setFilterByDay(!filterByDay);

  const fetchVentas = async () => {
    try {
      const response = await fetch('http://localhost:3001/ventas');
      if (!response.ok) {
        throw new Error('Error al obtener ventas');
      }
      const data = await response.json();
      console.log('Datos de ventas:', data); // Agrega este log
      setVentas(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const cargarProductos = async () => {
    try {
      const response = await axios.get('http://localhost:3001/productos');
      console.log('Productos obtenidos:', response.data);
      setProductos(response.data);
    } catch (error) {
      console.error('Error al obtener los productos:', error);
    }
  };

  const cargarClientes = async () => {
    try {
      const response = await axios.get('http://localhost:3001/clientes');
      console.log('Clientes obtenidos:', response.data);
      setClientes(response.data);
    } catch (error) {
      console.error('Error al obtener los clientes:', error);
    }
  };

  const cargarEmpleados = async () => {
    try {
      const response = await axios.get('http://localhost:3001/empleados');
      console.log('Empleados obtenidos:', response.data);
      setEmpleados(response.data);
    } catch (error) {
      console.error('Error al obtener los empleados:', error);
    }
  };

  const filteredProductos = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClientes = clientes.filter((cliente) =>
    cliente.nombre.toLowerCase().includes(searchTermCliente.toLowerCase())
  );

  const handleAgregar = () => {
    if (selectedProduct) {
      const newItem = { ...selectedProduct, cantidad };
      setCarrito([...carrito, newItem]);
    }
  };

  const handleEliminar = (index) => {
    setCarrito(carrito.filter((_, i) => i !== index));
  };

  const handleFinalizarVenta = async () => {
    if (!clienteSeleccionado || !empleadoSeleccionado || carrito.length === 0) {
      alert('Por favor, seleccione un cliente, un empleado y añada productos al carrito.');
      return;
    }

    const venta = {
      cliente: clienteSeleccionado,
      empleado: empleadoSeleccionado,
      carrito: carrito,
      fechaHora: new Date().toISOString()
    };

    try {
      const response = await axios.post('http://localhost:3001/ventas', venta);
      console.log('Venta realizada:', response.data);

      // Actualizar el stock después de realizar la venta
      await Promise.all(carrito.map(async (item) => {
        const nuevoStock = 0;
        if(item.stock==0){
          nuevoStock = item.stock;
        }else{
          nuevoStock = item.stock - item.cantidad;
        }

        // Aquí aseguramos que solo el stock se modifica y el resto del objeto permanece igual
        const productoActualizado = { ...item, stock: nuevoStock };

        await actualizarStockProducto(item.id, productoActualizado);
      }));

      alert('Venta realizada con éxito');
      setCarrito([]); // Limpia el carrito después de la venta
      fetchVentas();
    } catch (error) {
      console.error('Error al realizar la venta:', error);
      alert('Error al realizar la venta');
    }
  };

  function formatearFecha(fechaISO) {
    let fecha = new Date(fechaISO);
    let dia = String(fecha.getDate()).padStart(2, '0');
    let mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses empiezan desde 0
    let anio = fecha.getFullYear();
    let horas = String(fecha.getHours()).padStart(2, '0');
    let minutos = String(fecha.getMinutes()).padStart(2, '0');

    return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
}

// const filteredVentas = ventas.filter((venta) => {
//   const ventaDate = new Date(venta.fechaHora);

//   if (filterByDay && selectedDate) {
//     const [year, month, day] = selectedDate.split('-');
//     const match =
//       ventaDate.getFullYear() === parseInt(year) &&
//       ventaDate.getMonth() + 1 === parseInt(month) &&
//       ventaDate.getDate() === parseInt(day);

//     // Debugging para ver si se cumple la condición
//     console.log(`Filtrando por día: ${selectedDate} | Venta: ${ventaDate} | Coincide: ${match}`);
    
//     return match;

//   } else if (!filterByDay && selectedMonth) {
//     const [year, month] = selectedMonth.split('-');
//     const match =
//       ventaDate.getFullYear() === parseInt(year) &&
//       ventaDate.getMonth() + 1 === parseInt(month);

//     // Debugging para ver si se cumple la condición
//     console.log(`Filtrando por mes: ${selectedMonth} | Venta: ${ventaDate} | Coincide: ${match}`);
    
//     return match;
//   }

//   // Si no hay filtro activo, devuelve true para mostrar todas las ventas
//   return true;
// });

  const actualizarStockProducto = async (id, productoActualizado) => {
    try {
      await axios.put(`http://localhost:3001/productos/${id}`, productoActualizado);
      console.log(`Stock actualizado para el producto con id ${id}`);
    } catch (error) {
      console.error(`Error al actualizar el stock del producto con id ${id}:`, error.message);
    }
  };

  const handleDeleteVenta = async (id) => {
    console.log("Id de la venta a eliminar: ", id);
        try {
            await axios.delete(`http://localhost:3001/ventas/${id}`);
            setVentas(ventas.filter(venta => venta.id !== id));
        } catch (error) {
            console.error('Error al eliminar venta:', error);
        }
  }

  const totalCarrito = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const ventasPorPagina = 10;
    const indiceUltimaVenta = paginaActual * ventasPorPagina;
    const indicePrimeraVenta = indiceUltimaVenta - ventasPorPagina;
    const ventasPaginadas = filteredVentas.slice(indicePrimeraVenta, indiceUltimaVenta);
    const numeroPaginas = Math.ceil(filteredVentas.length / ventasPorPagina);

    const cambiarPagina = (numeroPagina) => setPaginaActual(numeroPagina);

    

  return (
    <div className={styles.fullContainer}>
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <form>
            <label>Cliente</label>
            <div className={styles.contenedorCliente}>
              <input
                type="text"
                value={searchTermCliente}
                onChange={(e) => setSearchTermCliente(e.target.value)}
                placeholder="Buscar cliente..."
                className={styles.input}
              />
              <select
                name="cliente"
                value={clienteSeleccionado ? clienteSeleccionado.id : ''}
                onChange={(e) => {
                  const selectedCliente = clientes.find(cliente => cliente.id === parseInt(e.target.value));
                  setClienteSeleccionado(selectedCliente);
                }}
                className={styles.select}
              >
                <option value="">Seleccionar</option>
                {filteredClientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre} {cliente.apellido} ({cliente.cedula})
                  </option>
                ))}
              </select>
            </div>
            <label>Empleado</label>
            <select
              name="empleado"
              onChange={(e) => {
                const selectedEmpleado = empleados.find(empleado => empleado.id === parseInt(e.target.value));
                setEmpleadoSeleccionado(selectedEmpleado);
              }}
              className={styles.select}
            >
              <option value="">Seleccionar</option>
              {empleados.map((empleado) => (
                <option key={empleado.id} value={empleado.id}>
                  {empleado.nombre}
                </option>
              ))}
            </select>
            <label>Productos</label>
            <div className={styles.contenedorProducto}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar producto..."
                className={styles.input}
              />
              <select
                value={selectedProduct ? selectedProduct.id : ''}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const product = productos.find(p => p.id === parseInt(selectedId));
                  setSelectedProduct(product);
                }}
                className={styles.select}
              >
                <option value="">Seleccionar</option>
                {filteredProductos.map((producto) => (
                  <option key={producto.id} value={producto.id}>
                    {producto.nombre}
                  </option>
                ))}
              </select>
            </div>
            <label style={{ fontSize: '13px' }}>Cantidad</label>
            <select
              value={cantidad}
              onChange={(e) => setCantidad(parseInt(e.target.value))}
              className={styles.select}
            >
              {[...Array(10).keys()].map((n) => (
                <option key={n + 1} value={n + 1}>{n + 1}</option>
              ))}
            </select>
            <button type="button" onClick={handleAgregar} className={styles.button}>
              Agregar
            </button>
          </form>
        </div>
        <div className={styles.carritoContainer}>
          <div className={styles.carrito}>
            <strong>Carrito:</strong>
            <ul className={styles.carritoLista}>
              {carrito.map((item, index) => (
                <li key={index} className={styles.itemCarrito}>
                  <span className={styles.productoNombre}>{item.nombre}</span>
                  <span className={styles.productoCantidad}>Cantidad: {item.cantidad}</span>
                  <span className={styles.productoPrecio}>Precio: ${item.precio * item.cantidad}</span>
                  <button onClick={() => handleEliminar(index)} className={styles.button2}>
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
            <strong>TOTAL: ${totalCarrito}</strong>
            <br />
            <button type="button" onClick={handleFinalizarVenta} className={styles.button2}>
              Finalizar Venta
            </button><br />
            <button type="button" onClick={toggleVentas} className={styles.button2}>
              Ver ventas
            </button>
          </div>
        </div>
      </div>
      {showVentas && (
        <div className={styles.ventasOverlay}>
          <div className={styles.ventasContainer}>
          <button onClick={toggleVentas} className={styles.closeButton}>x</button>
            <h2 className={styles.subtitulo}>Historial de Ventas</h2>

            <div className={styles.contenedorFiltradoDiaMes}>
              <div>
              <label>Filtrar por:</label>
              <button className={styles.button3} onClick={toggleFilter}>
                {filterByDay ? 'Día' : 'Mes'}
              </button>
              </div>
              

              {filterByDay ? (
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              ) : (
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
              )}
            </div>
            <label>TOTAL: ${totalFiltrado}   </label>
            <ul className={styles.ventasLista}>
            {ventasPaginadas.length > 0 ? (
  ventasPaginadas.map((venta) => {
    let carrito;
    try {
      carrito = JSON.parse(venta.carrito);
    } catch (error) {
      console.error('Error al parsear el carrito:', error);
      carrito = [];
    }

    // Buscar el cliente en la lista de clientes
    const cliente = clientes.find(c => c.id === venta.cliente_id);
    const empleado = empleados.find(e => e.id === venta.empleado_id);
    const fechaFormateada = formatearFecha(venta.fechaHora);
    

    
    return (
      <div className={styles.contenedorVentas} key={venta.id}>
        <li className={styles.ventaItem}>
          <div className={styles.info}>
          <strong>Cliente:</strong> {cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Desconocido'} <br />
          <strong>Empleado:</strong> {empleado ? `${empleado.nombre} ${empleado.apellido}` : 'Desconocido'} <br />
          <strong>Fecha:</strong> {fechaFormateada}<br/>
          <strong>Total:</strong> ${carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0)}
          </div>
          <div>
            <button className={styles.button} onClick={() => handleDeleteVenta(venta.id)}>Eliminar</button>
          </div>
        </li>
      </div>
    );
  })
) : (
  <li>No hay ventas</li>
)}
            </ul>
            <div className='paginacion'>
                    {Array.from({ length: numeroPaginas }, (_, index) => (
                        <button
                        key={index + 1}
                        className={paginaActual === index + 1 ? styles.activo : styles.button3}
                        onClick={() => cambiarPagina(index + 1)}
                        >
                        {index + 1}
                        </button>
                    ))}
                </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ingresos;
