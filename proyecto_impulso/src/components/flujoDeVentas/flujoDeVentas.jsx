import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./flujoDeVentas.module.css";

const FlujoDeVentas = () => {
  const [flujoDeVenta, setFlujoDeVenta] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    fechaHora: ""
  });

  const [flujoDeVentas, setFlujoDeVentas] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showDetallePopup, setShowDetallePopup] = useState(false);
  const [flujoAEditar, setFlujoAEditar] = useState(null);
  const [flujoDetalle, setFlujoDetalle] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [errores, setErrores] = useState({});
  const [erroresEditar, setErroresEditar] = useState({});
  const [productos, setProductos] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);

  const [filterByDay, setFilterByDay] = useState(true); // alternar entre filtrado por día o mes
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    cargarFlujos();
    cargarProductos();

  }, []);

  const cargarFlujos = async () => {
    try {
      const response = await axios.get('http://localhost:3001/flujoDeVentas');
      console.log('Flujos de ventas obtenidos:', response.data);
      setFlujoDeVentas(response.data);
    } catch (error) {
      console.error('Error al obtener los flujos de ventas:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFlujoDeVenta({
      ...flujoDeVenta,
      [name]: value
    });
  };

 

  const validarFlujoDeVenta = () => {
    let errores = {};
    if (!flujoDeVenta.nombre) errores.nombre = 'El nombre es obligatorio';
    if (!flujoDeVenta.descripcion) errores.descripcion = 'La descripción es obligatoria';
    if (!flujoDeVenta.precio) {
      errores.precio = 'El precio es obligatorio';
    } else if (isNaN(flujoDeVenta.precio) || flujoDeVenta.precio <= 0) {
      errores.precio = 'El precio debe ser un número mayor a 0';
    }

    setErrores(errores);
    return Object.keys(errores).length === 0;
  };

  const cargarProductos = async () => {
    try {
      const response = await axios.get('http://localhost:3001/productos');
      setProductos(response.data);
    } catch (error) {
      console.error('Error al obtener los productos:', error);
    }
  };

  const validarFlujoEditado = () => {
    let erroresEditar = {};
    if (!flujoAEditar.nombre) erroresEditar.nombre = 'El nombre es obligatorio';
    if (!flujoAEditar.descripcion) erroresEditar.descripcion = 'La descripción es obligatoria';
    if (!flujoAEditar.precio) {
      erroresEditar.precio = 'El precio es obligatorio';
    } else if (isNaN(flujoAEditar.precio) || flujoAEditar.precio <= 0) {
      erroresEditar.precio = 'El precio debe ser un número mayor a 0';
    }

    setErroresEditar(erroresEditar);
    return Object.keys(erroresEditar).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFlujoDeVenta()) {
      return;
    }
  
    // Obtener fecha y hora actuales
    const ahora = new Date();
    
    // Formatear fecha y hora en el formato DD/MM/YYYY HH:mm
    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const anio = ahora.getFullYear();
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    
    const fechaHoraFormato = `${dia}/${mes}/${anio} ${horas}:${minutos}`;
  
    try {
      // Añadir fechaHora al objeto flujoDeVenta
      const flujoDeVentaConFechaHora = { ...flujoDeVenta, fechaHora: fechaHoraFormato };
  
      const response = await axios.post('http://localhost:3001/flujoDeVentas', flujoDeVentaConFechaHora);
      console.log('Ingreso creado:', response.data);
      setFlujoDeVenta({
        nombre: '',
        descripcion: '',
        precio: '',
        fechaHora: ""
      });
      cargarFlujos();
    } catch (error) {
      console.error('Error al crear el ingreso:', error);
    }
  };
  

  const handleDelete = async (id) => {
    console.log("Id de la venta a eliminar: ", id);
    try {
      await axios.delete(`http://localhost:3001/flujoDeVentas/${id}`);
      setFlujoDeVentas(flujoDeVentas.filter(flujoDeVenta => flujoDeVenta.id !== id));
    } catch (error) {
      console.error('Error al eliminar la venta:', error);
    }
  };

  const handleEdit = (flujo) => {
    setFlujoAEditar(flujo);
    setShowPopup(true);
  };

  const handleUpdate = async () => {
    if (!validarFlujoEditado()) {
      return;
    }
    try {
      console.log("flujo a editar: ", flujoAEditar)
      await axios.put(`http://localhost:3001/flujoDeVentas/${flujoAEditar.id}`, flujoAEditar);
      setShowPopup(false);
      setFlujoAEditar(null);
      cargarFlujos();
    } catch (error) {
      console.error('Error al actualizar flujo:', error);
    }
  };

  const handleDetalle = (pflujoDeVenta) => {
    setShowDetallePopup(true);
    setFlujoDetalle(pflujoDeVenta)
  }

  const handlePopupChange = (e) => {
    const { name, value } = e.target;
    setFlujoAEditar({
      ...flujoAEditar,
      [name]: value
    });
  };

  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
  };

  const flujosDeVentasFiltrados = flujoDeVentas.filter((flujoDeVenta) =>
    flujoDeVenta.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );
  const parseDate = (fechaHora) => {
    const [fecha, hora] = fechaHora.split(' ');
    const [day, month, year] = fecha.split('/');
    return new Date(year, month - 1, day);
  };
  

  const filteredGastos = flujoDeVentas.filter((flujo) => {
    const gastoDate = parseDate(flujo.fechaHora);
  
    if (filterByDay && selectedDate) {
      const [year, month, day] = selectedDate.split('-');
      const match =
        gastoDate.getFullYear() === parseInt(year) &&
        gastoDate.getMonth() + 1 === parseInt(month) &&
        gastoDate.getDate() === parseInt(day);
  
      // Debugging para ver si se cumple la condición
      console.log(`Filtrando por día: ${selectedDate} | Gasto: ${gastoDate} | Coincide: ${match}`);
      
      return match;
  
    } else if (!filterByDay && selectedMonth) {
      const [year, month] = selectedMonth.split('-');
      const match =
        gastoDate.getFullYear() === parseInt(year) &&
        gastoDate.getMonth() + 1 === parseInt(month);
  
      // Debugging para ver si se cumple la condición
      console.log(`Filtrando por mes: ${selectedMonth} | Gasto: ${gastoDate} | Coincide: ${match}`);
      
      return match;
    }
  
    // Si no hay filtro activo, devuelve true para mostrar todas las ventas
    return true;
  });
  

  const flujosDeVentasPorPagina = 10;
  const indiceUltimoflujosDeVentas = paginaActual * flujosDeVentasPorPagina;
  const indicePrimerflujosDeVentas = indiceUltimoflujosDeVentas - flujosDeVentasPorPagina;
  const flujosDeVentasPaginadas = filteredGastos.slice(indicePrimerflujosDeVentas, indiceUltimoflujosDeVentas);
  const numeroPaginas = Math.ceil(filteredGastos.length / flujosDeVentasPorPagina);

  const cambiarPagina = (numeroPagina) => setPaginaActual(numeroPagina);

  

  const toggleFilter = () => setFilterByDay(!filterByDay);
  


  return (
    <div className='contenedor'>
      <div className="formulario">
        <form onSubmit={handleSubmit}>
          <div className="linea">
          <label>Nombre</label>
          <input
            type='text'
            name="nombre"
            value={flujoDeVenta.nombre}
            onChange={handleChange}
          />
          </div>
          
          {errores.nombre && <p className='errorForm'>{errores.nombre}</p>}
          <div className="linea">
          <label>Descripción</label>
          <input
            type='text'
            name="descripcion"
            value={flujoDeVenta.descripcion}
            onChange={handleChange}
          />
          </div>
          
          {errores.descripcion && <p className='errorForm'>{errores.descripcion}</p>}
          <div className="linea">
          <label>Monto</label>
          <input
            type='number'
            min="1"
            name="precio"
            value={flujoDeVenta.precio}
            onChange={handleChange}
          />
          </div>
          
          {errores.precio && <p className='errorForm'>{errores.precio}</p>}
          
          <button className='boton' type='submit'>Crear Gasto</button>
        </form>
      </div>

      <div className='contenedor-lista'>
        <h1 className='tituloLista'>Lista de gastos</h1>

        <div>
              <div>
              <label>Filtrar por:</label>
              <button onClick={toggleFilter}>
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
        <ul className="lista-entidad-principal">
          <div className='contenedor-entidad'>
            {flujosDeVentasPaginadas.map(flujoDeVenta => (
              <li className="list-item" key={flujoDeVenta.id}>
                <div onClick={() => handleDetalle(flujoDeVenta)} className='info'>
                  <strong>{flujoDeVenta.nombre}</strong>
                </div>
                <div className='botones'>
                  <button className='boton2' onClick={() => handleEdit(flujoDeVenta)}>Modificar</button>
                  <button className='boton2' onClick={() => handleDelete(flujoDeVenta.id)}>Eliminar</button>
                </div>
              </li>
            ))}
          </div>
        </ul>
        <div className='paginacion'>
                    {Array.from({ length: numeroPaginas }, (_, index) => (
                        <button
                        key={index + 1}
                        className={paginaActual === index + 1 ? 'activo' : 'boton4'}
                        onClick={() => cambiarPagina(index + 1)}
                        >
                        {index + 1}
                        </button>
                    ))}
                </div>
      </div>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Modificar Flujo</h3>
            <div className='contenedor-sub-form'>
            <div className="linea">
            <label>Nombre</label>
            <input
              type='text'
              name='nombre'
              value={flujoAEditar.nombre}
              onChange={handlePopupChange}
            />
            </div>
            
            {erroresEditar.nombre && <p className='errorForm'>{erroresEditar.nombre}</p>}
            <div className="linea">
            <label>Descripción</label>
            <input
              type='text'
              name='descripcion'
              value={flujoAEditar.descripcion}
              onChange={handlePopupChange}
            />
            </div>
            
            {erroresEditar.descripcion && <p className='errorForm'>{erroresEditar.descripcion}</p>}
            <div className="linea">
            <label>Monto</label>
            <input
              type='number'
              name='precio'
              value={flujoAEditar.precio}
              onChange={handlePopupChange}
            />
            </div>
            
            {erroresEditar.precio && <p className='errorForm'>{erroresEditar.precio}</p>}
            <br />
            <button className='boton2' onClick={handleUpdate}>Actualizar Gasto</button>
            <button className='boton2' onClick={() => setShowPopup(false)}>Cancelar</button>
            </div>
            
          </div>
        </div>
      )}

      {showDetallePopup && (
          <div className="popup">
              <div className="popup-content">
                  <h3>{flujoDetalle.nombre}</h3>
                  <p>Descripción: {flujoDetalle.descripcion}</p>
                  <p>Monto: {flujoDetalle.precio}</p>
                  <p>Fecha: {flujoDetalle.fechaHora}</p>
                  <button className="boton" onClick={() => setShowDetallePopup(false)}>Cerrar</button>
              </div>
          </div>
      )}
    </div>
  );
}

export default FlujoDeVentas;
