// src/features/clientes/components/Notificacao.jsx
import React, { useEffect } from "react";

const Notificacao = ({ tipo = "info", mensagem, onFechar, duracao = 3000 }) => {
  useEffect(() => {
    if (duracao) {
      const timer = setTimeout(() => {
        onFechar();
      }, duracao);
      return () => clearTimeout(timer);
    }
  }, [duracao, onFechar]);

  if (!mensagem) return null;

  return (
    <div style={{ ...styles.base, ...styles[tipo] }}>
      <span>{mensagem}</span>
      <button style={styles.botao} onClick={onFechar}>
        X
      </button>
    </div>
  );
};

const styles = {
  base: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    padding: "12px 20px",
    borderRadius: "6px",
    color: "white",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    zIndex: 2000,
  },
  sucesso: {
    backgroundColor: "green",
  },
  erro: {
    backgroundColor: "red",
  },
  info: {
    backgroundColor: "blue",
  },
  botao: {
    background: "transparent",
    border: "none",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default Notificacao;

