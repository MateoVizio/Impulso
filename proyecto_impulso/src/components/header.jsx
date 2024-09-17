import React from 'react'
import { Link } from 'react-router-dom';
import './header.css';

const header = () => {
    return (
        <nav>
          <ul>
            <li>
              <Link to="/empleados">Empleados</Link>
            </li>
            <li>
              <Link to="/clientes">Clientes</Link>
            </li>
            <li>
              <Link to="/productos">Productos</Link>
            </li>
            <li>
              <Link to="/flujoDeVentas">Gastos</Link>
            </li>
            <li>
              <Link to="/ingresos">Ingresos</Link>
            </li>
            <li>
              <Link to="/membresias">Membresías</Link>
            </li>
            
          </ul>
        </nav>
      );
}

export default header