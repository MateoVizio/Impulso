import logo from './logo.svg';
import './App.css';
import Header from "./components/header.jsx";
import { Route, Routes, Navigate} from 'react-router-dom';
import Home from "./components/home.jsx"
import Empleados from "./components/empleados/empleados.jsx";
import Clientes from "./components/clientes/clientes.jsx";
import FlujoDeVentas from './components/flujoDeVentas/flujoDeVentas.jsx';
import Productos from './productos/productos.jsx';
import Membresias from './components/membresias/membresias.jsx';
import Ingresos from './components/ingresos/ingresos.jsx';

function App() {
  return (
    <div>
      <Header/>
      <Routes>
      <Route path="/" element={<Navigate to="/empleados" />} />
        <Route path="/empleados" element={<Empleados />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/flujoDeVentas" element={<FlujoDeVentas />} />
        <Route path="/ingresos" element={<Ingresos />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/membresias" element={<Membresias />} />
      </Routes>
    </div>
  );
}

export default App;
