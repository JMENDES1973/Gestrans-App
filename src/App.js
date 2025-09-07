import React, { useState } from 'react';
import './App.css';
import EnvironmentIndicator from './components/EnvironmentIndicator';
import TransportadoresPage from './pages/TransportadoresPage';
import ClientesPage from './pages/ClientesPage';

function App() {
  // Estado para controlar que página mostrar
  const [paginaAtiva, setPaginaAtiva] = useState('transportadores');

  // Função expandida para renderizar diferentes páginas
const renderizarPagina = () => {
  switch(paginaAtiva) {
    case 'transportadores':
      return <TransportadoresPage />;
    case 'cotacoes':
      return <div style={{padding: '20px', textAlign: 'center'}}>
        <h2>Módulo de Cotações</h2>
        <p>Em desenvolvimento...</p>
      </div>;
    case 'clientes':
      return <ClientesPage />;
    case 'contactos':
      return <div style={{padding: '20px', textAlign: 'center'}}>
        <h2>Módulo de Contactos</h2>
        <p>Em desenvolvimento...</p>
      </div>;
    case 'configuracoes':
      return <div style={{padding: '20px', textAlign: 'center'}}>
        <h2>Configurações do Sistema</h2>
        <p>Gestão de utilizadores, permissões e configurações gerais</p>
      </div>;
    default:
      return <TransportadoresPage />;
  }
};

  return (
    <div className="App">
      {/* Cabeçalho fixo do sistema */}
      <header>
        <h1>GESTRANS - Sistema de Gestão de Transportes</h1>
      </header>
      
      {/* Indicador de ambiente */}
      <EnvironmentIndicator />

      {/* Menu expandido com todos os módulos principais */}
<nav style={{
  padding: '15px', 
  backgroundColor: '#f8f9fa', 
  borderBottom: '2px solid #dee2e6',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
}}>
  <div style={{
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  }}>
    <button 
      onClick={() => setPaginaAtiva('transportadores')}
      style={{
        padding: '10px 20px',
        backgroundColor: paginaAtiva === 'transportadores' ? '#007bff' : '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.3s ease'
      }}
    >
      📦 Transportadores
    </button>
    
    <button 
      onClick={() => setPaginaAtiva('cotacoes')}
      style={{
        padding: '10px 20px',
        backgroundColor: paginaAtiva === 'cotacoes' ? '#007bff' : '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.3s ease'
      }}
    >
      💼 Cotações
    </button>
    
    <button 
  onClick={() => setPaginaAtiva('clientes')}
  style={{
    padding: '10px 20px',
    backgroundColor: paginaAtiva === 'clientes' ? '#007bff' : '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  }}
>
  🏢 Clientes
</button>
    
    <button 
      onClick={() => setPaginaAtiva('contactos')}
      style={{
        padding: '10px 20px',
        backgroundColor: paginaAtiva === 'contactos' ? '#6c757d' : '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.3s ease'
      }}
    >
      👥 Contactos
    </button>
    
    <button 
      onClick={() => setPaginaAtiva('configuracoes')}
      style={{
        padding: '10px 20px',
        backgroundColor: paginaAtiva === 'configuracoes' ? '#007bff' : '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.3s ease'
      }}
    >
      ⚙️ Configurações
    </button>
  </div>
</nav>

      {/* Área onde as páginas são renderizadas */}
      <main>
        {renderizarPagina()}
      </main>
    </div>
  );
}

export default App;