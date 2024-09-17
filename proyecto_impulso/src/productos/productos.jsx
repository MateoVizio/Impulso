import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Productos = () => {
    const [producto, setProducto] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: 0
    });

    const [productos, setProductos] = useState([]);
    const [productosSinOrden, setProductosSinOrden] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [showDetallePopup, setShowDetallePopup] = useState(false);
    const [productoAEditar, setProductoAEditar] = useState(null);
    const [productoDetalle, setProductoDetalle] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [paginaActual, setPaginaActual] = useState(1);
    const [errores, setErrores] = useState({});
    const [erroresEditar, setErroresEditar] = useState({});
    const [ordenadoPorStock, setOrdenadoPorStock] = useState(false);


    useEffect(() => {
        cargarProductos();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProducto({
            ...producto,
            [name]: value
        });
    };

    const validarCampos = (producto) => {
        const nuevosErrores = {};
        if (!producto.nombre) nuevosErrores.nombre = 'El nombre es obligatorio';
        if (!producto.descripcion) nuevosErrores.descripcion = 'La descripción es obligatoria';
        if (!producto.precio) nuevosErrores.precio = 'El precio es obligatorio';
        else if (isNaN(producto.precio) || producto.precio <= 0) nuevosErrores.precio = 'El precio debe ser un número positivo';
        if (isNaN(producto.stock) || producto.stock < 0) nuevosErrores.stock = 'El stock debe ser un número no negativo';
        return nuevosErrores;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const nuevosErrores = validarCampos(producto);
        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            return;
        }
        try {
            const response = await axios.post('http://localhost:3001/productos', producto);
            console.log('Producto creado:', response.data);
            setProducto({
                nombre: '',
                descripcion: '',
                precio: '',
                stock: 0
            });
            setErrores({});
            cargarProductos();
        } catch (error) {
            console.error('Error al crear producto:', error);
        }
    };

    const handleDelete = async (id) => {
        console.log("Id del producto a eliminar: ", id);
        try {
            await axios.delete(`http://localhost:3001/productos/${id}`);
            setProductos(productos.filter(producto => producto.id !== id));
        } catch (error) {
            console.error('Error al eliminar producto:', error);
        }
    };

    const handleEdit = (producto) => {
        setProductoAEditar(producto);
        setShowPopup(true);
    };

    const handleUpdate = async () => {
        const nuevosErrores = validarCampos(productoAEditar);
        if (Object.keys(nuevosErrores).length > 0) {
            setErroresEditar(nuevosErrores);
            return;
        }
        try {
            await axios.put(`http://localhost:3001/productos/${productoAEditar.id}`, productoAEditar);
            setShowPopup(false);
            setProductoAEditar(null);
            setErroresEditar({});
            cargarProductos();
            setOrdenadoPorStock(false);
        } catch (error) {
            console.error('Error al actualizar producto:', error);
        }
    };
    
    const handleDetalle = (producto) => {
        setShowDetallePopup(true);
        setProductoDetalle(producto);
    };

    const cargarProductos = async () => {
        try {
            const response = await axios.get('http://localhost:3001/productos');
            console.log('Productos obtenidos:', response.data);
            setProductos(response.data);
            setProductosSinOrden(response.data);
        } catch (error) {
            console.error('Error al obtener los productos:', error);
        }
    };

    const handlePopupChange = (e) => {
        const { name, value } = e.target;
        setProductoAEditar({
            ...productoAEditar,
            [name]: value
        });
    };

    const handleBusquedaChange = (e) => {
        setBusqueda(e.target.value);
        setPaginaActual(1); // Reiniciar la página actual cuando se realiza una búsqueda
    };

    const productosFiltrados = productos.filter((producto) =>
        producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    const handleOrdenarToggle = () => {
        if (ordenadoPorStock) {
          setProductos(productosSinOrden);
        } else {
          const productosOrdenados = [...productos].sort((a, b) => a.stock - b.stock);
          setProductos(productosOrdenados);
        }
        setOrdenadoPorStock(!ordenadoPorStock);
      };
      

    const productosPorPagina = 10;
    const indiceUltimoProducto = paginaActual * productosPorPagina;
    const indicePrimerProducto = indiceUltimoProducto - productosPorPagina;
    const productosPaginados = productosFiltrados.slice(indicePrimerProducto, indiceUltimoProducto);
    const numeroPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

    const cambiarPagina = (numeroPagina) => setPaginaActual(numeroPagina);

    return (
        <div className='contenedor'>
            <div className="formulario">
                <form onSubmit={handleSubmit}>
                    
                    <div className="linea">
                        <label>Nombre</label>
                        <input 
                            type='text' 
                            name='nombre' 
                            value={producto.nombre} 
                            onChange={handleChange} 
                        />
                    </div>
                    
                    {errores.nombre && <p className='errorForm'>{errores.nombre}</p>}
                    <div className="linea">
                        <label>Descripción</label>
                        <input 
                            type='text' 
                            name='descripcion' 
                            value={producto.descripcion} 
                            onChange={handleChange} 
                        />
                    </div>
                   
                    {errores.descripcion && <p className='errorForm'>{errores.descripcion}</p>}
                    <div className="linea">
                        <label>Precio</label>
                        <input 
                            type='number' 
                            name='precio' 
                            value={producto.precio} 
                            onChange={handleChange} 
                        />
                    </div>
                    
                    {errores.precio && <p className='errorForm'>{errores.precio}</p>}
                    <div className="linea">
                        <label>Stock</label>
                        <input 
                            type='number' 
                            name='stock' 
                            value={producto.stock} 
                            onChange={handleChange} 
                        />
                    </div>
                    
                    {errores.stock && <p className='errorForm'>{errores.stock}</p>}
                    
                    <button className='boton' type='submit'>Crear Producto</button>
                </form>
            </div>

            <div className='contenedor-lista-pr'>
                <h1 className='tituloLista'>Productos</h1>

                <input className='buscador'
                type="text" 
                placeholder="Buscar..." 
                value={busqueda} 
                onChange={handleBusquedaChange} 
                />
                <div className='ordenarStockDiv'>
                {ordenadoPorStock 
  ? <label onClick={() => handleOrdenarToggle()} className="ordenarStock" style={{ marginRight: '251px' }}>Orden normal</label>
  : <label onClick={() => handleOrdenarToggle()} className="ordenarStock">Ordenar por stock</label>
}

                </div>
                

                <ul className="lista-entidad-principal">
                    <div className='contenedor-entidad'>
                        {productosPaginados.map(producto => (
                            <li className="list-item" key={producto.id}>
                                <div onClick={() => handleDetalle(producto)} className='info'>
                                <strong>{producto.nombre}</strong> {"("}{producto.stock}{")"}
                                </div>
                                <div className='botones'>
                                <button className='boton2' onClick={() => handleEdit(producto)}>Modificar</button> 
                                <button className='boton2' onClick={() => handleDelete(producto.id)}>Eliminar</button>
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
                        <h3>Modificar Producto</h3>
                        <div className='contenedor-sub-form'>
                        <div className="linea">
                        <label>Nombre</label>
                        <input 
                            type='text' 
                            name='nombre' 
                            value={productoAEditar.nombre} 
                            onChange={handlePopupChange} 
                        />
                        </div>
                        
                        {erroresEditar.nombre && <p className='errorForm'>{erroresEditar.nombre}</p>}
                        <div className="linea">
                        <label>Descripción</label>
                        <input 
                            type='text' 
                            name='descripcion' 
                            value={productoAEditar.descripcion} 
                            onChange={handlePopupChange} 
                        />
                        </div>
                        
                        {erroresEditar.descripcion && <p className='errorForm'>{erroresEditar.descripcion}</p>}
                        <div className="linea">
                        <label>Precio</label>
                        <input 
                            type='number' 
                            name='precio' 
                            value={productoAEditar.precio} 
                            onChange={handlePopupChange} 
                        />
                        </div>
                        
                        {erroresEditar.precio && <p className='errorForm'>{erroresEditar.precio}</p>}
                        <div className="linea">
                        <label>Stock</label>
                        <input 
                            type='number' 
                            name='stock' 
                            value={productoAEditar.stock} 
                            onChange={handlePopupChange} 
                        />
                        </div>
                        
                        {erroresEditar.stock && <p className='errorForm'>{erroresEditar.stock}</p>}
                        <br/>
                        
                        <button className='boton2' onClick={handleUpdate}>Actualizar Producto</button>
                        <button className='boton2' onClick={() => setShowPopup(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {showDetallePopup && (
                <div className="popup">
                    <div className="popup-content">
                        <h3>Detalle del Producto</h3>
                        <p><strong>Nombre:</strong> {productoDetalle.nombre}</p>
                        <p><strong>Descripción:</strong> {productoDetalle.descripcion}</p>
                        <p><strong>Precio:</strong> {productoDetalle.precio}</p>
                        <p><strong>Stock:</strong> {productoDetalle.stock}</p>
                        <button className='boton2' onClick={() => setShowDetallePopup(false)}>Cerrar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Productos;
