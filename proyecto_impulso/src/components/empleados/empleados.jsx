import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Empleados = () => {
  const [empleado, setEmpleado] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: '',
    email: '',
    cargo: '',
    sueldo: 0
  });

  const [cargo, setCargo] = useState({
    nombre: ''
  });

  const [empleados, setEmpleados] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showCargoPopup, setShowCargoPopup] = useState(false);
  const [showDetallePopup, setShowDetallePopup] = useState(false);
  const [empleadoAEditar, setEmpleadoAEditar] = useState(null);
  const [empleadoDetalle, setEmpleadoDetalle] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [paginaActualEmpleados, setPaginaActualEmpleados] = useState(1);
  const [errores, setErrores] = useState({});
  const [erroresEditar, setErroresEditar] = useState({});
  const [errorCargo, setErrorCargo] = useState('');
  const [cargos, setCargos] = useState([]);

  const cargosPorPagina = 7;
  const empleadosPorPagina = 10;

  useEffect(() => {
    cargarEmpleados();
    cargarCargos();
  }, []);

  const cargarEmpleados = async () => {
    try {
      const response = await axios.get('http://localhost:3001/empleados');
      console.log('Empleados obtenidos:', response.data);
      setEmpleados(response.data);
    } catch (error) {
      console.error('Error al obtener los empleados:', error);
    }
  };

  const cargarCargos = async () => {
    try {
      const response = await axios.get('http://localhost:3001/cargos');
      console.log('Cargos obtenidos:', response.data);
      setCargos(response.data);
    } catch (error) {
      console.error('Error al obtener los cargos:', error);
    }
  };

  const handleDelete = async (id) => {
    console.log("Id del empleado a eliminar: ", id);
    try {
      await axios.delete(`http://localhost:3001/empleados/${id}`);
      setEmpleados(empleados.filter(empleado => empleado.id !== id));
    } catch (error) {
      console.error('Error al eliminar empleado:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmpleado({
      ...empleado,
      [name]: value
    });
  };

  const handleChangeCargo = (e) => {
    const { name, value } = e.target;
    setCargo({
      ...cargo,
      [name]: value
    });
  };

  const handleDeleteCargo = async (id) => {
    console.log("Id del Cargo a eliminar: ", id);
    try {
      await axios.delete(`http://localhost:3001/cargos/${id}`);
      setCargos(cargos.filter(cargo => cargo.id !== id));
    } catch (error) {
      console.error('Error al eliminar cargo:', error);
    }
  };

  const validarEmpleado = () => {
    let errores = {};
    if (!empleado.nombre) errores.nombre = 'El nombre es obligatorio';
    if (!empleado.apellido) errores.apellido = 'El apellido es obligatorio';
    if (!empleado.cedula) errores.cedula = 'La cédula es obligatoria';
    if (!empleado.telefono) {
      errores.telefono = 'El teléfono es obligatorio';
    } else if (!/^\d{1,9}$/.test(empleado.telefono)) {
      errores.telefono = 'El teléfono debe contener solo números y un máximo de 9 dígitos';
    }
    if (!empleado.email) {
      errores.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(empleado.email)) {
      errores.email = 'El email no es válido';
    }
    if (!empleado.cargo) errores.cargo = 'El cargo es obligatorio';
    if (empleado.sueldo <= 0) errores.sueldo = 'El sueldo debe ser mayor a 0';

    setErrores(errores);
    return Object.keys(errores).length === 0;
  };

  const validarEmpleadoEditar = () => {
    let erroresEditar = {};
    if (!empleadoAEditar.nombre) erroresEditar.nombre = 'El nombre es obligatorio';
    if (!empleadoAEditar.apellido) erroresEditar.apellido = 'El apellido es obligatorio';
    if (!empleadoAEditar.cedula) erroresEditar.cedula = 'La cédula es obligatoria';
    if (!empleadoAEditar.telefono) {
      erroresEditar.telefono = 'El teléfono es obligatorio';
    } else if (!/^\d{1,9}$/.test(empleadoAEditar.telefono)) {
      erroresEditar.telefono = 'El teléfono debe contener solo números y un máximo de 9 dígitos';
    }
    if (!empleadoAEditar.email) {
      erroresEditar.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(empleadoAEditar.email)) {
      erroresEditar.email = '*';
    }
    if (!empleadoAEditar.cargo) erroresEditar.cargo = 'El cargo es obligatorio';
    if (empleadoAEditar.sueldo <= 0) erroresEditar.sueldo = 'El sueldo debe ser mayor a 0';

    setErroresEditar(erroresEditar);
    return Object.keys(erroresEditar).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarEmpleado()) {
      return;
    }
    try {
      const response = await axios.post('http://localhost:3001/empleados', empleado);
      console.log('Empleado creado con éxito:', response.data);
      setEmpleado({
        nombre: '',
        apellido: '',
        cedula: '',
        telefono: '',
        email: '',
        cargo: '',
        sueldo: 0
      });
      cargarEmpleados();
    } catch (error) {
      console.error('Error al crear empleado:', error);
    }
  };

  const comprobarDisponibilidadCargo = () => {
    for (let cargoYaCreado of cargos) {
      if (cargoYaCreado.nombre === cargo.nombre) {
        console.log("Nombre del cargo no disponible.");
        setErrorCargo('El nombre del cargo ya está en uso.');
        return false;
      }
    }
    setErrorCargo('');
    return true;
  };

  const handleSubmitCargo = async (e) => {
    e.preventDefault();
    if (comprobarDisponibilidadCargo()) {
      try {
        const response = await axios.post('http://localhost:3001/cargos', cargo);
        console.log('Cargo creado con éxito:', response.data);
        setCargo({
          nombre: '',
        });
        cargarCargos();
        setShowCargoPopup(false);
      } catch (error) {
        console.error('Error al crear cargo:', error);
      }
    } else {
      console.log('No se puede crear el cargo porque el nombre ya está en uso.');
    }
  };

  const handleEdit = (empleado) => {
    setEmpleadoAEditar(empleado);
    setShowPopup(true);
  };

  const handleUpdate = async () => {
    if (!validarEmpleadoEditar()) {
      return;
    }
    try {
      console.log("empleado a editar: ", empleadoAEditar)
      await axios.put(`http://localhost:3001/empleados/${empleadoAEditar.id}`, empleadoAEditar);
      setShowPopup(false);
      setEmpleadoAEditar(null);
      cargarEmpleados();
    } catch (error) {
      console.error('Error al actualizar empleado:', error);
    }
  };

  const handleDetalle = (pEmpleado) => {
    setShowDetallePopup(true);
    setEmpleadoDetalle(pEmpleado);
  }

  const handleCancel = () => {
    setErroresEditar({});
    setShowPopup(false);
  };

  const handlePopupChange = (e) => {
    const { name, value } = e.target;
    setEmpleadoAEditar({
      ...empleadoAEditar,
      [name]: value
    });
  };

  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
    setPaginaActualEmpleados(1);
  };

  const empleadosFiltrados = empleados.filter(empleado => {
    // Convierte el texto de búsqueda a minúsculas y divide en partes
    const busquedaPartes = busqueda.toLowerCase().split(' ');
  
    // Verifica si alguna parte de la búsqueda coincide con nombre o apellido
    return busquedaPartes.every(p => 
      empleado.nombre.toLowerCase().includes(p) || 
      empleado.apellido.toLowerCase().includes(p)
    );
  });
  

  const indiceUltimoCargo = paginaActual * cargosPorPagina;
  const indicePrimerCargo = indiceUltimoCargo - cargosPorPagina;
  const cargosPaginados = cargos.slice(indicePrimerCargo, indiceUltimoCargo);
  const numeroPaginas = Math.ceil(cargos.length / cargosPorPagina);

  const cambiarPagina = (numeroPagina) => setPaginaActual(numeroPagina);

  const indiceUltimoEmpleado = paginaActualEmpleados * empleadosPorPagina;
const indicePrimerEmpleado = indiceUltimoEmpleado - empleadosPorPagina;
const empleadosFiltradosPaginados = empleadosFiltrados.slice(indicePrimerEmpleado, indiceUltimoEmpleado);
const numeroPaginasEmpleados = Math.ceil(empleados.length / empleadosPorPagina);


const cambiarPaginaEmpleados = (numeroPagina) => {
  setPaginaActualEmpleados(numeroPagina);
};


  return (
    <div className='contenedor'>
      <div className="formulario">
        <form onSubmit={handleSubmit}>
          <div className='contenedor-form'>
          <div className="linea">
          <label>Nombre:</label>
          <input
            type='text'
            name='nombre'
            value={empleado.nombre}
            onChange={handleChange}
          ></input>
          </div>
          
          {errores.nombre && <p className='errorForm'>{errores.nombre}</p>}
          <div className="linea">
          <label>Apellido:</label>
          <input
            type='text'
            name='apellido'
            value={empleado.apellido}
            onChange={handleChange}
          ></input>
          </div>
          
          {errores.apellido && <p className='errorForm'>{errores.apellido}</p>}
          <div className="linea">
          <label>Cédula:</label>
          <input
            type='text'
            name='cedula'
            value={empleado.cedula}
            onChange={handleChange}
          ></input>
          </div>
          
          {errores.cedula && <p className='errorForm'>{errores.cedula}</p>}
          <div className="linea">
          <label>Teléfono:</label>
          <input
            type='text'
            name='telefono'
            value={empleado.telefono}
            onChange={handleChange}
          ></input>
          </div>
          
          {errores.telefono && <p className='errorForm'>{errores.telefono}</p>}
          <div className="linea">
          <label>Email:</label>
          <input
            type='text'
            name='email'
            value={empleado.email}
            onChange={handleChange}
          ></input>
          </div>
          
          {errores.email && <p className='errorForm'>{errores.email}</p>}
          <div className="linea">
          <label>Cargo:</label>
          <div className='linea2'>
          <select className='select-plan'
            name="cargo" 
            value={empleado.cargo} 
            onChange={handleChange}
          >
            <option value="">Seleccionar Cargo</option>
            {cargos.map((cargo) => (
              <option key={cargo.id} value={cargo.nombre}>
                {cargo.nombre}
              </option>
            ))}
          </select>
          <button type="button" className='boton3' onClick={() => { setShowCargoPopup(true); cargarCargos(); }}>+</button>
          </div>
          
          </div>
          
          {errores.cargo && <p className='errorForm'>{errores.cargo}</p>}
          <div className="linea">
          <label>Sueldo:</label>
          <input
            type='number'
            name='sueldo'
            value={empleado.sueldo}
            onChange={handleChange}
          ></input>
          </div>
          
          {errores.sueldo && <p className='errorForm'>{errores.sueldo}</p>}
          <button className='boton' type='submit'>Crear Empleado</button>
          </div>
          
        </form>
      </div>

      <div className='contenedor-lista'>
        <h1 className='tituloLista'>Empleados</h1>

        <input className='buscador'
                type="text" 
                placeholder="Buscar..." 
                value={busqueda} 
                onChange={handleBusquedaChange} 
          />

        <ul className="lista-entidad-principal">
          <div className='contenedor-entidad'>
            {empleadosFiltradosPaginados.map(empleado => (
              <li className='list-item' key={empleado.id}>
                <div className='info' onClick={() => handleDetalle(empleado)}>
                  {empleado.nombre} {empleado.apellido}
                </div>
                <div className='botones'>
                  <button className='boton2' onClick={() => handleEdit(empleado)}>Modificar</button> 
                  <button className='boton2' onClick={() => handleDelete(empleado.id)}>Eliminar</button>
                </div>
              </li>
            ))}
          </div>
        </ul>

        <div className='paginacion'>
                    {Array.from({ length: numeroPaginasEmpleados }, (_, index) => (
                        <button
                        key={index + 1}
                        className={paginaActualEmpleados === index + 1 ? 'activo' : 'boton4'}
                        onClick={() => cambiarPaginaEmpleados(index + 1)}
                        >
                        {index + 1}
                        </button>
                    ))}
                </div>
      </div>

      {showPopup && (
        <div className="popup-sub-form">
          <div className="popup-content">
            <h3>Modificar Empleado</h3>
            <div className='contenedor-sub-form'>
            <div className="linea">
            <label>Nombre</label>
            <input
              type='text'
              name='nombre'
              value={empleadoAEditar.nombre}
              onChange={handlePopupChange}
            />
            </div>
            
            {erroresEditar.nombre && <p className='errorForm'>{erroresEditar.nombre}</p>}
            <div className="linea">
            <label>Apellido</label>
            <input
              type='text'
              name='apellido'
              value={empleadoAEditar.apellido}
              onChange={handlePopupChange}
            />
            </div>
            
            {erroresEditar.apellido && <p className='errorForm'>{erroresEditar.apellido}</p>}
            <div className="linea">
            <label>Cédula</label>
            <input
              type='text'
              name='cedula'
              value={empleadoAEditar.cedula}
              onChange={handlePopupChange}
            />
            </div>
            
            {erroresEditar.cedula && <p className='errorForm'>{erroresEditar.cedula}</p>}
            <div className="linea">
            <label>Teléfono</label>
            <input
              type='text'
              name='telefono'
              value={empleadoAEditar.telefono}
              onChange={handlePopupChange}
            />
            </div>
            
            {erroresEditar.telefono && <p className='errorForm'>{erroresEditar.telefono}</p>}
            <div className="linea">
            <label>Email</label>
            <input
              type='text'
              name='email'
              value={empleadoAEditar.email}
              onChange={handlePopupChange}
            />
            </div>
            {erroresEditar.email && <p className='errorForm'>{erroresEditar.email}</p>}
            <div className="linea">
            <label>Cargo</label>
            <select 
              name="cargo" 
              value={empleadoAEditar.cargo} 
              onChange={handlePopupChange}
            >
              <option value="">Seleccionar Cargo</option>
              {cargos.map((cargo) => (
                <option key={cargo.id} value={cargo.nombre}>
                  {cargo.nombre}
                </option>
              ))}
            </select>
            </div>
            
            {erroresEditar.cargo && <p className='errorForm'>{erroresEditar.cargo}</p>}
            <div className="linea">
            <label>Sueldo</label>
            <input
              type='text'
              name='sueldo'
              value={empleadoAEditar.sueldo}
              onChange={handlePopupChange}
            />
            </div>
            
            {erroresEditar.sueldo && <p className='errorForm'>{erroresEditar.sueldo}</p>}
            <br />
            <button className='boton2' onClick={handleUpdate}>Actualizar Empleado</button>
            <button className='boton2' onClick={handleCancel}>Cancelar</button>
            </div>
            
          </div>
        </div>
      )}

      {showCargoPopup && (
        <div className="popup">
          <div className="popup-content">
            <h1>Crear Cargo</h1>
            <form onSubmit={handleSubmitCargo}>
              <p>Nombre</p>
              <input
                type='text'
                name='nombre'
                value={cargo.nombre}
                onChange={handleChangeCargo}
              />
              {errorCargo && <p className='errorForm'>{errorCargo}</p>}
              <br />
              <button className='boton2' type='submit'>Crear Cargo</button>
              <button className='boton2' type="button" onClick={() => {
                setShowCargoPopup(false);
                setErrorCargo("");
              }}>Cancelar</button>
            </form>
            <h2 className='tituloLista'>Lista de cargos</h2>
            <ul className="lista-entidad">
              <div className='contenedor-entidad'>
                {cargosPaginados.map(cargo => (
                  <li className="sub-list-item" key={cargo.id}>
                    <div className='info'>
                      {cargo.nombre}
                    </div>
                    <div className='sub-botones'>
                      <button className='boton2' onClick={() => handleDeleteCargo(cargo.id)}>Eliminar</button>
                    </div>
                  </li>
                ))}
              </div>
            </ul>
            <div className='paginacion'>
              {Array.from({ length: numeroPaginas }, (_, index) => (
                <button
                  key={index + 1}
                  className={paginaActual === index + 1 ? 'activo' : 'boton2'}
                  onClick={() => cambiarPagina(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}


      {showDetallePopup && (
        <div className="popup">
          <div className='popup-content'>
            <h2>{empleadoDetalle.nombre} {empleadoDetalle.apellido}</h2>
            <p><strong>Cédula:</strong> {empleadoDetalle.cedula}</p>
            <p><strong>Teléfono:</strong> {empleadoDetalle.telefono}</p>
            <p><strong>Email:</strong> {empleadoDetalle.email}</p>
            <p><strong>Cargo:</strong> {empleadoDetalle.cargo}</p>
            <p><strong>Sueldo:</strong> {empleadoDetalle.sueldo}</p>
            <button className="boton" onClick={() => setShowDetallePopup(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Empleados;
