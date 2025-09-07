// src/components/EnvironmentIndicator.jsx
import React from 'react';
import { currentEnvironment, isDevelopment } from '../config/environments';

const EnvironmentIndicator = () => {
  // Usar nossa lógica inteligente em vez do NODE_ENV diretamente
  const isDevEnvironment = isDevelopment();
  
  // Configuração baseada no ambiente real detectado
  const config = isDevEnvironment ? {
    color: '#28a745',      // Verde
    bgColor: '#d4edda',    // Verde claro
    borderColor: '#c3e6cb',
    text: '🟢 DESENVOLVIMENTO',
    subtitle: '⚠️ DADOS DE TESTE - EXPERIMENTE À VONTADE!',
    icon: '🧪'
  } : {
    color: '#dc3545',      // Vermelho
    bgColor: '#f8d7da',    // Vermelho claro
    borderColor: '#f5c6cb',
    text: '🔴 PRODUÇÃO',
    subtitle: '✅ DADOS REAIS - SISTEMA OFICIAL',
    icon: '🏢'
  };
  
  return (
    <div style={{
      backgroundColor: config.bgColor,
      border: `2px solid ${config.borderColor}`,
      borderRadius: '8px',
      padding: '12px 20px',
      margin: '10px 0',
      textAlign: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        fontSize: '18px',
        fontWeight: 'bold',
        color: config.color,
        marginBottom: '4px'
      }}>
        {config.icon} {config.text}
      </div>
      
      <div style={{
        fontSize: '14px',
        color: '#666',
        fontStyle: 'italic'
      }}>
        {config.subtitle}
      </div>
      
      {isDevEnvironment && (
        <div style={{
          marginTop: '8px',
          fontSize: '12px',
          color: '#28a745',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          padding: '4px 8px',
          borderRadius: '4px',
          display: 'inline-block'
        }}>
          💡 Pode testar qualquer funcionalidade sem medo!
        </div>
      )}
      
      {!isDevEnvironment && (
        <div style={{
          marginTop: '8px',
          fontSize: '12px',
          color: '#dc3545',
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          padding: '4px 8px',
          borderRadius: '4px',
          display: 'inline-block'
        }}>
          🎯 Sistema em uso por utilizadores reais
        </div>
      )}
    </div>
  );
};

export default EnvironmentIndicator;