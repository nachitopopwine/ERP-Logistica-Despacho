import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import CrearOrdenPicking from './pages/CrearOrdenPicking';
import CrearGuiaDespacho from './pages/CrearGuiaDespacho';
import ListarOrdenesPicking from './pages/ListarOrdenesPicking';
import ListarGuiasDespacho from './pages/ListarGuiasDespacho';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '20px',
          marginBottom: '0',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          borderBottom: '3px solid #667eea'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <h1 style={{ 
              color: '#667eea', 
              margin: 0, 
              fontSize: '26px',
              fontWeight: '700',
              marginRight: '16px',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              🚚 ERP Logística
            </h1>
            <Link to="/" style={{ 
              color: 'white', 
              textDecoration: 'none', 
              padding: '10px 20px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}>
              📝 Crear OT
            </Link>
            <Link to="/guias" style={{ 
              color: 'white', 
              textDecoration: 'none', 
              padding: '10px 20px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}>
              🚚 Crear Guía
            </Link>
            <Link to="/listar-picking" style={{ 
              color: 'white', 
              textDecoration: 'none', 
              padding: '10px 20px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}>
              📊 Listar OT
            </Link>
            <Link to="/listar-guias" style={{ 
              color: 'white', 
              textDecoration: 'none', 
              padding: '10px 20px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}>
              📋 Listar Guías
            </Link>
          </div>
        </nav>

        <div style={{ padding: '32px 20px' }}>
          <Routes>
            <Route path="/" element={<CrearOrdenPicking />} />
            <Route path="/guias" element={<CrearGuiaDespacho />} />
            <Route path="/listar-picking" element={<ListarOrdenesPicking />} />
            <Route path="/listar-guias" element={<ListarGuiasDespacho />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
