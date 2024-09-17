  import React, { useState, useEffect, useRef} from 'react';
  import axios from 'axios';
  import "./clientes.css";

  const Clientes = () => {
    const [cliente, setCliente] = useState({
      nombre: '',
      apellido: '',
      cedula: '',
      telefono: '',
      email: '',
      plan: '',
      fechaPago: "",
      fechaVencimiento: "",
      fechaNacimiento: "",
      foto:null
    });

    const [plan, setPlan] = useState({
      nombre: '',
      cantidadMeses: 1,
      precio: 1
    });

    const [clientes, setClientes] = useState([]);
    const [planes, setPlanes] = useState([]);
    const [mostrarPopup, setMostrarPopup] = useState(false);
    const [mostrarDetallePopup, setMostrarDetallePopup] = useState(false);
    const [mostrarPlanPopup, setMostrarPlanPopup] = useState(false);
    const [clienteAEditar, setClienteAEditar] = useState(null);
    const [clienteDetalle, setClienteDetalle] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [paginaActual, setPaginaActual] = useState(1);
    const [paginaActualCliente, setPaginaActualCliente] = useState(1);
    const [errorPlan, setErrorPlan] = useState('');
    const [errores, setErrores] = useState({});
    const [erroresEditar, setErroresEditar] = useState({});
    const inputFotoRef = useRef(null);
    const inputFotoRef2 = useRef(null);
    const[fotoEditar, setFotoEditar] = useState({});
    const[fotoOriginal, setFotoOriginal] = useState({});
    const [carrito, setCarrito] = useState([]);
    const [mostrarModalRenovar, setMostrarModalRenovar] = useState(false);
    const [empleados, setEmpleados] = useState({});  
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(0);
    const [clienteRenovarId, setClienteRenovarId] = useState({});



    const planesPorPagina = 7;

    useEffect(() => {
      cargarClientes();
      cargarPlanes();
      cargarEmpleados();
    }, []);

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
        console.log('Empelados obtenidos:', response.data);
        setEmpleados(response.data);
      } catch (error) {
        console.error('Error al obtener los empleados:', error);
      }
    };

    const cargarPlanes = async () => {
      try {
        const response = await axios.get('http://localhost:3001/planes');
        console.log('Planes obtenidos:', response.data);
        setPlanes(response.data);
      } catch (error) {
        console.error('Error al obtener los planes:', error);
      }
    };

    const calcularFechaVencimiento = (cliente) => {
      try {
        for (let plan of planes) {
          if (plan.nombre === cliente.plan) {
            const pFechaPago = cliente.fechaPago;
            const date = new Date(pFechaPago);
            date.setMonth(date.getMonth() + plan.cantidadMeses);
            return date.toISOString().split('T')[0]; // Formatear la fecha como YYYY-MM-DD
          }
        }
      } catch (error) {
        console.log("ERROR calculando fecha de vencimiento: ", error);
      }
      return ""; // Retorna una cadena vacía si no encuentra el plan
    };
    

    const manejarCambio = (e) => {
      const { name, value } = e.target;
      setCliente({
        ...cliente,
        [name]: value
      });
    };

    const manejarCambioFoto = (e, accion = 'crear') => {
      const file = e.target.files[0];
      if (accion === 'crear') {
        setCliente({
          ...cliente,
          foto: file
        });
      } else if (accion === 'editar') {
        setClienteAEditar({
          ...clienteAEditar,
          foto: file
        });
      }
    };
    
    
    

    const manejarCambioPlan = (e) => {
      const { name, value } = e.target;
      setPlan({
        ...plan,
        [name]: value
      });
    };

    const manejarEliminar = async (id) => {
      console.log("Id del cliente a eliminar: ", id);
      try {
        await axios.delete(`http://localhost:3001/clientes/${id}`);
        setClientes(clientes.filter(cliente => cliente.id !== id));
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
      }
    };

    const manejarEliminarPlan = async (id) => {
      console.log("Id del plan a eliminar: ", id);
      try {
        await axios.delete(`http://localhost:3001/planes/${id}`);
        setPlanes(planes.filter(plan => plan.id !== id));
      } catch (error) {
        console.error('Error al eliminar plan:', error);
      }
    };

    const validarCliente = () => {
      let errores = {};
    
      if (!cliente.nombre) errores.nombre = 'El nombre es obligatorio';
      if (!cliente.apellido) errores.apellido = 'El apellido es obligatorio';
    
      if (!cliente.cedula.trim()) {
        errores.cedula = 'La cédula es obligatoria';
      } else if (cedulaExistente(cliente.cedula)) {
        errores.cedula = 'La cédula ya existe';
      }
    
      if (!cliente.telefono) {
        errores.telefono = 'El teléfono es obligatorio';
      } else if (!/^\d{1,9}$/.test(cliente.telefono)) {
        errores.telefono = 'El teléfono debe contener solo números y un máximo de 9 dígitos';
      }
    
      if (!cliente.email) {
        errores.email = 'El email es obligatorio';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.email)) {
        errores.email = 'El email no es válido';
      }
    
      if (!cliente.plan) errores.plan = 'El plan es obligatorio';
      if (!cliente.fechaPago) errores.fechaPago = 'La fecha de pago es obligatoria';
    
      if (!cliente.fechaNacimiento) {
        errores.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
      } else {
        const fechaNacimiento = new Date(cliente.fechaNacimiento);
        const fechaActual = new Date();
    
        if (fechaNacimiento < fechaActual) {
          console.log('La fecha de nacimiento es válida.');
        } else {
          console.log('La fecha de nacimiento no es válida.');
          errores.fechaNacimiento = 'La fecha de nacimiento debe ser anterior a la actual';
        }
      }
    
      setErrores(errores);
      return Object.keys(errores).length === 0;
    };
    

    const validarClienteEditar = () => {
      let erroresEditar = {};
      if (!clienteAEditar.nombre) erroresEditar.nombre = 'El nombre es obligatorio';
      if (!clienteAEditar.apellido) erroresEditar.apellido = 'El apellido es obligatorio';
      if (!clienteAEditar.cedula) erroresEditar.cedula = 'La cédula es obligatoria';
      //if (chequearCedula == false) erroresEditar.cedula = 'El numero de cédula ya existe';
      if (!clienteAEditar.telefono) {
        erroresEditar.telefono = 'El teléfono es obligatorio';
      } else if (!/^\d{1,9}$/.test(clienteAEditar.telefono)) {
        erroresEditar.telefono = 'El teléfono debe contener números (máximo 9 dígitos)';
      }
      if (!clienteAEditar.email) {
        erroresEditar.email = 'El email es obligatorio';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clienteAEditar.email)) {
        erroresEditar.email = 'El email no es válido';
      }
      if (!clienteAEditar.plan) erroresEditar.plan = 'El plan es obligatorio';
      if (!clienteAEditar.fechaPago) erroresEditar.fechaPago = 'La fecha de pago es obligatoria';
      
      if (!clienteAEditar.fechaNacimiento) {
        erroresEditar.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
      } else {
        const fechaNacimiento = new Date(clienteAEditar.fechaNacimiento);
        const fechaActual = new Date();
        if (fechaNacimiento < fechaActual) {
          console.log('La fecha de nacimiento es válida.');
        } else {
          console.log("la fecha nac no es valida")
          erroresEditar.fechaNacimiento = 'La fecha de nacimiento debe ser anterior a la actual';
        }
      }

      setErroresEditar(erroresEditar);
      return Object.keys(erroresEditar).length === 0;
    };

    const cedulaExistente = (cedula, id = null) => {
      return clientes.some(cliente => cliente.cedula === cedula && cliente.id !== id);
    };
    

    const manejarSubmit = async (e) => {
      e.preventDefault();
      if (!validarCliente()) {
        console.log("algo salio mal")
        return;
      }
    
      // Calcula la fecha de vencimiento y actualiza el estado del cliente
      const fechaVencimiento = calcularFechaVencimiento(cliente);
      const formData = new FormData();
      
      // Añade la fecha de vencimiento al FormData
      formData.append('fechaVencimiento', fechaVencimiento);
      
      // Añade el resto de los campos al FormData
      Object.keys(cliente).forEach(key => {
        if (key !== 'fechaVencimiento') {
          formData.append(key, cliente[key]);
        }
      });
    
      try {

        for (let [key, value] of formData.entries()) {
          if (value instanceof File) {
            console.log(`${key}: ${value.name}`);  // Muestra el nombre del archivo
          } else {
            console.log(`${key}: ${value}`);
          }
        }

        // Aquí estamos enviando los datos al servidor
        const response = await axios.post('http://localhost:3001/clientes', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
    
        // El servidor responde con un código de estado que indica éxito o fracaso
        if (response.status === 201) { // 201 Created
          console.log('Cliente creado con éxito:', response.data);
          setCliente({
            nombre: '',
            apellido: '',
            cedula: '',
            telefono: '',
            email: '',
            plan: '',
            fechaPago: "",
            fechaVencimiento: "",
            fechaNacimiento:"",
            foto: null
          });
    
          // Limpia el input de archivo
          if (inputFotoRef.current) {
            inputFotoRef.current.value = '';
          }
          cargarClientes();
        } else if (response.status === 409) { // 409 Conflict
          console.error('Error: La cédula ya existe');
          alert('Error: La cédula ya existe');
        }
      } catch (error) {
        console.error('Error al crear cliente:', error);
      }
    };
    
    const manejarActualizar = async (e) => {
      e.preventDefault();
      if (!validarClienteEditar()) {
        return;
      }
    
      const fechaVencimiento = calcularFechaVencimiento(clienteAEditar);
      const formData = new FormData();
    
      formData.append('fechaVencimiento', fechaVencimiento);
    
      Object.keys(clienteAEditar).forEach(key => {
        if (key !== 'fechaVencimiento' && key !== 'foto') {
          formData.append(key, clienteAEditar[key]);
        }
      });
    
      // Verifica si se ha seleccionado una nueva foto
      if (inputFotoRef2.current && inputFotoRef2.current.files && inputFotoRef2.current.files[0]) {
        console.log("Se detectó un cambio en la foto");
        const nuevaFoto = inputFotoRef2.current.files[0];
        formData.append('foto', nuevaFoto);
      } else {
        console.log("NO se detectó un cambio en la foto");
        // Si no hay nueva foto, no agregues 'foto' al formData
        // Esto evita que se actualice la foto si no se selecciona una nueva
        if (clienteAEditar.foto) {
          formData.append('foto', clienteAEditar.foto);
        }
      }
    
      // Mostrar contenido de formData para depuración
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: ${value.name}`);  // Muestra el nombre del archivo
        } else {
          console.log(`${key}: ${value}`);
        }
      }
    
      try {
        await axios.put(`http://localhost:3001/clientes/${clienteAEditar.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setMostrarPopup(false);
        setClienteAEditar(null);
        cargarClientes();
      } catch (error) {
        console.error('Error al actualizar cliente:', error);
      }
    };

    const comprobarDisponibilidadPlan = () => {
      for (let planYaCreado of planes) {
        if (planYaCreado.nombre === plan.nombre) {
          console.log("Nombre del plan no disponible.");
          setErrorPlan('El nombre del plan ya está en uso.');
          return false;
        }
      }
      setErrorPlan('');
      return true;
    };

    const manejarSubmitPlan = async (e) => {
      e.preventDefault();
      if (comprobarDisponibilidadPlan()) {
        try {
          const response = await axios.post('http://localhost:3001/planes', plan);
          console.log('Plan creado con éxito:', response.data);
          setPlan({
            nombre: '',
            cantidadMeses: 1,
            precio: 1
          });
          cargarPlanes();
          setMostrarPlanPopup(false);
        } catch (error) {
          console.error('Error al crear plan:', error);
        }
      } else {
        console.log('No se puede crear el plan porque el nombre ya está en uso.');
      }
    };

    const manejarEditar = (cliente) => {
      setClienteAEditar(cliente);
      setFotoOriginal(cliente.foto);
      setMostrarPopup(true);
    };

    const handleDetalle = (pCliente) => {
      setMostrarDetallePopup(true);
      setClienteDetalle(pCliente);
    }

    const manejarCambioPopup = (e) => {
      const { name, value } = e.target;
      setClienteAEditar({
        ...clienteAEditar,
        [name]: value
      });
    };

    const manejarCambioBusqueda = (e) => {
      setBusqueda(e.target.value);
      setPaginaActualCliente(1);
    };

    const clientesFiltrados = clientes.filter(cliente => {
      // Convierte el texto de búsqueda a minúsculas y divide en partes
      const busquedaPartes = busqueda.toLowerCase().split(' ');
    
      // Verifica si alguna parte de la búsqueda coincide con nombre o apellido
      return busquedaPartes.every(p => 
        cliente.nombre.toLowerCase().includes(p) || 
        cliente.apellido.toLowerCase().includes(p)
      );
    });



// Función para renovar el plan de un cliente
const renovarPlan = () => {
  const clienteRenovar = clientes.find(c => c.id === clienteRenovarId);
  console.log("clienteRenovar: ", clienteRenovar);
  const empleadoRenovarId = parseInt(empleadoSeleccionado.trim());
  const empleadoRenovar = empleados.find(e => e.id === empleadoRenovarId);
  console.log("id emp a buscar: (", empleadoRenovarId)
  console.log("empleadosss: ", empleados)
  let carrito2 = [];
  console.log("Cliente a renovar plan:", clienteRenovar);
  console.log("planes: ",planes)

  if (!clienteRenovar.plan) {
    alert('El cliente no tiene un plan para renovar.');
    return;
  }

  // Encontrar el plan basado en el nombre
  const plan = planes.find(p => p.nombre === clienteRenovar.plan);
  if (!plan) {
    alert('Plan no encontrado.');
    return;
  }

  // Obtener la fecha de hoy en el formato YYYY-MM-DD
  const fechaHoy = new Date();
  const fechaHoyFormateada = fechaHoy.toISOString().split('T')[0];

  // Calcular la nueva fecha de vencimiento a partir de la fecha de hoy
  const fechaVencimiento = new Date(fechaHoy);
  fechaVencimiento.setMonth(fechaVencimiento.getMonth() + plan.cantidadMeses);
  const fechaVencimientoFormateada = fechaVencimiento.toISOString().split('T')[0];

  // Crear el nuevo producto para el carrito

  const nuevoProducto = {
    id: plan.id,
    nombre: plan.nombre,
    //hay que añdir precio a los planes
    precio: plan.precio,
    cantidad: plan.cantidadMeses,
  };

  // Actualizar el carrito directamente usando setCarrito
  // setCarrito(prevCarrito => [...prevCarrito, nuevoProducto]);
  carrito2.push(nuevoProducto);

  // Actualizar la fecha de vencimiento y fecha de pago del cliente
  axios.put(`http://localhost:3001/clientes/${clienteRenovar.id}`, {
    ...clienteRenovar,
    fechaVencimiento: fechaVencimientoFormateada,
    fechaPago: fechaHoyFormateada, // Agregamos la fecha de pago
  }).then(response => {
    console.log('Fecha de vencimiento y fecha de pago actualizadas:', response.data);
  }).catch(error => {
    console.error('Error al actualizar la fecha de vencimiento y fecha de pago:', error);
  });

  
  // Crear la venta y agregarla al carrito
  const venta = {
    cliente: clienteRenovar,
    empleado: empleadoRenovar,
    carrito: carrito2,
    fechaHora: fechaHoyFormateada
  };
  console.log("carrito: ",carrito)
  console.log("venta a realizarse automaticaemente", venta)

  axios.post('http://localhost:3001/ventas', venta)
    .then(response => {
      console.log('Venta realizada:', response.data);
      alert('Renovación realizada con éxito');
      setMostrarModalRenovar(false);
    })
    .catch(error => {
      console.error('Error al realizar la venta:', error);
      alert('Error al realizar la venta');
    });
    
};

const handleMostrarModalRenovar = (cliId) => {
  console.log("cliente a renovar id: ", cliId)
  setMostrarModalRenovar(true);
  setClienteRenovarId(cliId);
};
    
    
    
    
    

    const indiceUltimoPlan = paginaActual * planesPorPagina;
    const indicePrimerPlan = indiceUltimoPlan - planesPorPagina;
    const planesPaginados = planes.slice(indicePrimerPlan, indiceUltimoPlan);
    const numeroPaginas = Math.ceil(planes.length / planesPorPagina);

    const cambiarPagina = (numeroPagina) => setPaginaActual(numeroPagina);

    //paginado clientes
    const clientesPorPagina = 10;
      const indiceUltimoCliente = paginaActualCliente * clientesPorPagina;
      const indicePrimerCliente = indiceUltimoCliente - clientesPorPagina;
      const clientesPaginados = clientesFiltrados.slice(indicePrimerCliente, indiceUltimoCliente);
      const numeroPaginasClientes = Math.ceil(clientesFiltrados.length / clientesPorPagina);

      const cambiarPaginaClientes = (numeroPagina) => setPaginaActualCliente(numeroPagina);

    return (
      <div className='contenedor'>
        <div className="formulario">
          <form onSubmit={manejarSubmit}>
            <div className='contenedor-form'>
            <div className='linea'>
              
            <label>Nombre: </label>
            <input
              type='text'
              name='nombre'
              value={cliente.nombre}
              onChange={manejarCambio}
            />
            </div>
            
            {errores.nombre && <p className='errorForm'>{errores.nombre}</p>}
            
            <div className="linea">
            <label>Apellido:</label>
            <input
              type='text'
              name='apellido'
              value={cliente.apellido}
              onChange={manejarCambio}
            />
            </div>
            
            {errores.apellido && <p className='errorForm'>{errores.apellido}</p>}
            <div className="linea">
            <label>Cédula:</label>
            <input
              type='text'
              name='cedula'
              value={cliente.cedula}
              onChange={manejarCambio}
            />
            </div>
            
            {errores.cedula && <p className='errorForm'>{errores.cedula}</p>}
            <div className="linea">
            <label>Teléfono:</label >
            <input
              type='text'
              name='telefono'
              value={cliente.telefono}
              onChange={manejarCambio}
            />
            </div>
            
            {errores.telefono && <p className='errorForm'>{errores.telefono}</p>}
            <div className="linea">
            <label>E-mail</label>
            <input
              type='text'
              name='email'
              value={cliente.email}
              onChange={manejarCambio}
            />
            </div>
            
            {errores.email && <p className='errorForm'>{errores.email}</p>}
            <div className="linea">
            <label>Plan</label>
            <div className='linea2'>
            <select className='select-plan'
              name="plan" 
              value={cliente.plan} 
              onChange={manejarCambio}
            >
              <option value="">Seleccionar Plan</option>
              {planes.map((plan) => (
                <option key={plan.id} value={plan.nombre}>
                  {plan.nombre}
                </option>
              ))}
            </select>
            <button type="button" className='boton3' onClick={() => { setMostrarPlanPopup(true); cargarPlanes(); }}>+</button>
            </div>
            
            </div>
            {errores.plan && <p className='errorForm'>{errores.plan}</p>}
            
            <div className="linea">
            <label>Pago:</label><br />
            <input className='fecha'
              type='date'
              name='fechaPago'
              value={cliente.fechaPago}
              onChange={manejarCambio}
            />
            </div>
            
            {errores.fechaPago && <p className='errorForm'>{errores.fechaPago}</p>}
            
            <div className="linea">
            <label>Nacimiento:</label> <br />
            <input className='fecha'
              type='date'
              name='fechaNacimiento'
              value={cliente.fechaNacimiento}
              onChange={manejarCambio}
            />
            </div>
            
            {errores.fechaNacimiento && <p className='errorForm'>{errores.fechaNacimiento}</p>}
            
            <div className="linea">
            <label>Foto</label><br />
            <input className='foto'
              type="file"
              name="foto"
              onChange={manejarCambioFoto}
              ref={inputFotoRef}
            /><br/>
            </div>
            
            
            <button className='boton' type='submit'>Crear Cliente</button>

            </div>
            
          </form>
        </div>

        <div className='contenedor-lista'>
          <h1 className='tituloLista'>Clientes</h1>
          <input className='buscador'
            type="text"
            placeholder="Buscar..."
            value={busqueda}
            onChange={manejarCambioBusqueda}
          />

          <ul className="lista-entidad-principal">
            <div className='contenedor-entidad'>
              {clientesPaginados.map(cliente => (
                <li className="list-item" key={cliente.id}>
                  <div onClick={() => handleDetalle(cliente)} className='info'>
                    {cliente.nombre} {cliente.apellido}
                  </div>
                  <div className='botones'>
                    <button className='boton2' onClick={() => manejarEditar(cliente)}>Modificar</button>
                    <button className='boton2' onClick={() => manejarEliminar(cliente.id)}>Eliminar</button>
                  </div>
                </li>
              ))}
            </div>
          </ul>

          <div className='paginacion'>
              {Array.from({ length: numeroPaginasClientes }, (_, index) => (
                  <button
                  key={index + 1}
                  className={paginaActualCliente === index + 1 ? 'activo' : 'boton4'}
                  onClick={() => cambiarPaginaClientes(index + 1)}
                  >
                  {index + 1}
                  </button>
              ))}
            </div>
        </div>

        {mostrarPopup && (
          <div className="popup-sub-form">
            <div className="popup-content">
              <h3>Modificar Cliente</h3>
              <div className="contenedor-sub-form">
              <div className="linea">
              <label>Nombre</label>
              <input
                type='text'
                name='nombre'
                value={clienteAEditar.nombre}
                onChange={manejarCambioPopup}
              />
              </div>
              
              {erroresEditar.nombre && <p className='errorForm'>{erroresEditar.nombre}</p>}
              <div className="linea">
              <label>Apellido</label>
              <input
                type='text'
                name='apellido'
                value={clienteAEditar.apellido}
                onChange={manejarCambioPopup}
              />
              </div>
              
              {erroresEditar.apellido && <p className='errorForm'>{erroresEditar.apellido}</p>}
              <div className="linea">
              <label>Cedula</label>
              <input
                type='text'
                name='cedula'
                value={clienteAEditar.cedula}
                onChange={manejarCambioPopup}
              />
              </div>
              
              {erroresEditar.cedula && <p className='errorForm'>{erroresEditar.cedula}</p>}
              <div className="linea">
              <label>Telefono</label>
              <input
                type='text'
                name='telefono'
                value={clienteAEditar.telefono}
                onChange={manejarCambioPopup}
              />
              </div>
              
              {erroresEditar.telefono && <p className='errorForm'>{erroresEditar.telefono}</p>}
              <div className="linea">
              <label>E-mail</label>
              <input
                type='text'
                name='email'
                value={clienteAEditar.email}
                onChange={manejarCambioPopup}
              />
              </div>
              
              {erroresEditar.email && <p className='errorForm'>{erroresEditar.email}</p>}
              <div className="linea">
              <label>Plan</label>
              <select 
                name="plan" 
                value={clienteAEditar.plan} 
                onChange={manejarCambioPopup}
              >
                <option value="">Seleccionar Plan</option>
                {planes.map((plan) => (
                  <option key={plan.id} value={plan.nombre}>
                    {plan.nombre}
                  </option>
                ))}
              </select>
              </div>
              
              {erroresEditar.plan && <p className='errorForm'>{erroresEditar.plan}</p>}
              <div className="linea">
              <label>Pago</label>
              <input className='fechaModificar'
                type='date'
                name='fechaPago'
                value={clienteAEditar.fechaPago}
                onChange={manejarCambioPopup}
              />
              </div>
              
              {erroresEditar.fechaPago && <p className='errorForm'>{erroresEditar.fechaPago}</p>}
              <div className="linea">
              <label>Nacimiento</label>
              <input className='fechaModificar'
                type='date'
                name='fechaNacimiento'
                value={clienteAEditar.fechaNacimiento}
                onChange={manejarCambioPopup}
              />
              </div>
              
              {erroresEditar.fechaNacimiento && <p className='errorForm'>{erroresEditar.fechaNacimiento}</p>}
              <div className="linea">
              <label>Cambiar foto</label><br />
              <input className='fotoModificar'
                type="file" 
                name="foto" 
                onChange={(e) => manejarCambioFoto(e, 'editar')} 
                ref={inputFotoRef2} 
              />
              </div>
              
              <br/>



              <button className="boton2" onClick={manejarActualizar}>Actualizar Cliente</button>
              <button className="boton2" onClick={() => setMostrarPopup(false)}>Cancelar</button>
              </div>
              
            </div>
          </div>
        )}

        {mostrarPlanPopup && (
          <div className="popup-sub-form">
            <div className="popup-content">
              <h1>Crear Plan</h1>
              <form onSubmit={manejarSubmitPlan}>
                <p>Nombre</p>
                <input
                  type='text'
                  name='nombre'
                  value={plan.nombre}
                  onChange={manejarCambioPlan}
                />
                {errorPlan && <p className='errorForm'>{errorPlan}</p>}
                <p>Cantidad de meses</p>
                <input
                  type='number'
                  name='cantidadMeses'
                  min="1"
                  max="12"
                  value={plan.cantidadMeses}
                  onChange={manejarCambioPlan}
                />

                <p>Precio</p>
                <input
                  type='number'
                  name='precio'
                  min="1"
                  max="100000"
                  value={plan.precio}
                  onChange={manejarCambioPlan}
                />
                <br />
                <button className='boton2' type='submit'>Crear Plan</button>
                <button className='boton2' type="button" onClick={() => {
                  setMostrarPlanPopup(false);
                  setErrorPlan("");
                }}>Cancelar</button>
              </form>
              <h2 className='tituloLista'>Lista de planes</h2>
              <ul className="lista-entidad">
                <div className='contenedor-entidad'>
                  {planesPaginados.map(plan => (
                    <li className="sub-list-item" key={plan.id}>
                      <div className='info'>
                      {plan.nombre} - {plan.cantidadMeses} meses 
                      </div>
                      <div className='sub-botones'>
                      <button className='boton2' onClick={() => manejarEliminarPlan(plan.id)}>Eliminar</button>
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

        {mostrarDetallePopup && (
          <div className="popup">
            <div className='popup-content'>
              <h2>{clienteDetalle.nombre} {clienteDetalle.apellido}</h2>
              
              <p><strong>Cédula:</strong> {clienteDetalle.cedula}</p>
              <p><strong>Teléfono:</strong> {clienteDetalle.telefono}</p>
              <p><strong>Email:</strong> {clienteDetalle.email}</p>
              <div>
              <label><strong>Plan:</strong> {clienteDetalle.plan}</label><button type="button" onClick={() => handleMostrarModalRenovar(clienteDetalle.id)} className="boton2">
  Renovar
</button>
              </div>
              <p><strong>Fecha de Pago:</strong> {clienteDetalle.fechaPago}</p>
              <p><strong>Fecha de Vencimiento:</strong> {clienteDetalle.fechaVencimiento}</p>
              {clienteDetalle.foto && (
                <div className="foto-cliente">
                  <img 
                    src={`http://localhost:3001/uploads/${clienteDetalle.foto}`} 
                    alt="Foto del Cliente"
                  />
                </div>
              )}
              <button className="boton" onClick={() =>setMostrarDetallePopup(false)}>Cerrar</button>
            </div>
          </div>
        )}

{mostrarModalRenovar && (
  <div className="popup">
    <div className="popup-content">
      <h2>Renovar Plan</h2>
      
      <label htmlFor="empleado-select">
        <strong>Seleccionar Empleado:</strong>
      </label>
      <select
        id="empleado-select"
        value={empleadoSeleccionado}
        onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
      >
        <option value="" disabled>Seleccionar empleado</option>
        {empleados.map((empleado) => (
          <option key={empleado.id} value={empleado.id}>
            {empleado.nombre} {empleado.apellido}
          </option>
        ))}
      </select>
      
      <button
        className="boton2"
        type="button"
        onClick={() => renovarPlan()}
      >
        Renovar
      </button>
      
      <button
        className="boton2"
        type="button"
        
        style={{ width: "70.67px" }}
        onClick={() => setMostrarModalRenovar(false)}
      >
        Cerrar
      </button>
    </div>
  </div>
)}


      </div>
    );
  }

  export default Clientes;
