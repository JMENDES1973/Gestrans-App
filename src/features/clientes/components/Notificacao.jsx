// src/features/clientes/components/Notificacao.jsx
import React, { useEffect, useState } from "react";

const Notificacao = ({ tipo, mensagem, onFechar, duracao = 3000 }) => {
  // Estado para controlar a visibilidade e animação
  const [visivel, setVisivel] = useState(true);
  const [animacao, setAnimacao] = useState('entrando');

  // Configurações visuais para cada tipo de notificação
  // Cada tipo tem a sua cor, ícone e aparência específica
  const configuracoes = {
    sucesso: {
      backgroundColor: '#d4edda',
      borderColor: '#c3e6cb', 
      textColor: '#155724',
      icon: '✅'
    },
    erro: {
      backgroundColor: '#f8d7da',
      borderColor: '#f5c6cb',
      textColor: '#721c24', 
      icon: '❌'
    },
    aviso: {
      backgroundColor: '#fff3cd',
      borderColor: '#ffeaa7',
      textColor: '#856404',
      icon: '⚠️'
    },
    info: {
      backgroundColor: '#d1ecf1',
      borderColor: '#bee5eb', 
      textColor: '#0c5460',
      icon: 'ℹ️'
    }
  };

  // Obter a configuração para o tipo atual, com fallback para 'info'
  const config = configuracoes[tipo] || configuracoes.info;

  // Efeito para auto-fechar a notificação após o tempo especificado
  useEffect(() => {
    if (duracao > 0) {
      const timer = setTimeout(() => {
        handleFechar();
      }, duracao);

      // Limpeza do timer quando o componente é desmontado
      return () => clearTimeout(timer);
    }
  }, [duracao]);

  // Função que inicia a animação de saída antes de fechar
  const handleFechar = () => {
    setAnimacao('saindo');
    setTimeout(() => {
      setVisivel(false);
      onFechar && onFechar();
    }, 300); // Tempo da animação de saída
  };

  // Se não estiver visível, não renderizar nada
  if (!visivel) return null;

  // Estilos de animação baseados no estado atual
  const estiloAnimacao = {
    entrando: {
      transform: 'translateX(0)', // Posição final (visível)
      opacity: 1
    },
    saindo: {
      transform: 'translateX(100%)', // Move para fora do ecrã
      opacity: 0
    }
  };

  return (
    <div
      style={{
        // Posicionamento fixo no canto superior direito
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999, // Garantir que aparece por cima de tudo
        
        // Aparência visual
        backgroundColor: config.backgroundColor,
        border: `1px solid ${config.borderColor}`,
        borderRadius: '8px',
        padding: '16px 20px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        
        // Layout interno
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '300px',
        maxWidth: '500px',
        
        // Estado inicial da animação (fora do ecrã)
        transform: 'translateX(100%)',
        opacity: 0,
        transition: 'all 0.3s ease',
        
        // Aplicar a animação atual
        ...estiloAnimacao[animacao]
      }}
    >
      {/* Ícone visual */}
      <div style={{ fontSize: '20px', flexShrink: 0 }}>
        {config.icon}
      </div>

      {/* Texto da mensagem */}
      <div style={{
        flex: 1,
        color: config.textColor,
        fontSize: '14px',
        fontWeight: '500',
        lineHeight: '1.4'
      }}>
        {mensagem}
      </div>

      {/* Botão para fechar manualmente */}
      <button
        onClick={handleFechar}
        style={{
          background: 'none',
          border: 'none',
          color: config.textColor,
          cursor: 'pointer',
          fontSize: '18px',
          padding: '4px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.7,
          transition: 'opacity 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.opacity = 1}
        onMouseLeave={(e) => e.target.style.opacity = 0.7}
      >
        ✖️
      </button>
    </div>
  );
};

export default Notificacao;

