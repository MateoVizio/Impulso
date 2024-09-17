import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './membresias.module.css';

const Membresias = () => {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('alDia');
  const [filtroActivo, setFiltroActivo] = useState('alDia');
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      const response = await axios.get('http://localhost:3001/clientes');
      setClientes(response.data);
    } catch (error) {
      console.error('Error al obtener los clientes:', error);
    }
  };

  const clientesFiltrados = clientes.filter(cliente => {
    const fechaPago = new Date(cliente.fechaPago);
    const fechaVencimiento = new Date(cliente.fechaVencimiento);
    const hoy = new Date();
  
    if (filtro === 'alDia') {
      return fechaVencimiento > hoy;
    } else {
      return fechaVencimiento <= hoy;
    }
  });

  const handleNotificar = (cliente) => {
    const mensaje = "Hola "+cliente.nombre+", te recordamos que tu mensualidad ha vencido. Si querés seguir entrenando con nosotros, asegurate de renovarla. ¡Esperamos verte pronto! Saludos.";
    const url = `https://wa.me/+598${cliente.telefono}?text=${encodeURIComponent(mensaje)}`;
    
    // Llama a la función inmediatamente
    const ventana = window.open(url, '_blank');
    
    // Llama a la función nuevamente después de 5 segundos
    setTimeout(() => {
      window.open(url, '_blank'); // Abre el chat nuevamente
    }, 5000); // 5000 milisegundos = 5 segundos
  };
  
  const membresiasPorPagina = 10;
    const indiceUltimoMembresia = paginaActual * membresiasPorPagina;
    const indicePrimerMembresia = indiceUltimoMembresia - membresiasPorPagina;
    const membresiasPaginados = clientesFiltrados.slice(indicePrimerMembresia, indiceUltimoMembresia);
    const numeroPaginas = Math.ceil(clientesFiltrados.length / membresiasPorPagina);

    const cambiarPagina = (numeroPagina) => setPaginaActual(numeroPagina);
  

  return (
    <div className={styles.contenedorMembresias}>
      <div className={styles.botonesFiltro}>
        <button
          className={`${styles.boton} ${filtroActivo === 'alDia' ? styles.active : ''}`}
          onClick={() => { setFiltro('alDia'); setFiltroActivo('alDia'); }}
        >
          Clientes al Día
        </button>
        <button
          className={`${styles.boton} ${filtroActivo === 'vencidos' ? styles.active : ''}`}
          onClick={() => { setFiltro('vencidos'); setFiltroActivo('vencidos'); }}
        >
          Clientes Vencidos
        </button>
      </div>
      <div className={styles.contenedorListaClientes}>
        <table className={styles.tablaClientes}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Plan</th>
              <th>Pago</th>
              <th>Vencimiento</th>
              {filtro === 'vencidos' && <th></th>}
            </tr>
          </thead>
          <tbody>
            {membresiasPaginados.map(cliente => (
              <tr key={cliente.id}>
                <td>{cliente.nombre} {cliente.apellido}</td>
                <td>{cliente.telefono}</td>
                <td>{cliente.email}</td>
                <td>{cliente.plan}</td>
                <td>{cliente.fechaPago}</td>
                <td>{cliente.fechaVencimiento}</td>
                {filtro === 'vencidos' && (
                  <td>
                    <button
                      className={styles.botonNotificar}
                      onClick={() => handleNotificar(cliente)}
                    >
                      Notificar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        
      </div>
      <div className={styles.paginacion}>
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
  );
};

export default Membresias;
