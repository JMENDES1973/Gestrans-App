import React, { useState, useEffect } from "react";

const FormularioCliente = ({ cliente, onSalvar, onCancelar }) => {
  const [formData, setFormData] = useState({
    nome: "",
    nif: "",
    email: "",
  });

  // Preenche dados ao editar
  useEffect(() => {
    if (cliente) {
      setFormData({
        nome: cliente.nome || "",
        nif: cliente.nif || "",
        email: cliente.email || "",
      });
    }
  }, [cliente]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSalvar(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        margin: "20px 0",
        padding: "15px",
        border: "1px solid #ccc",
        borderRadius: "6px",
      }}
    >
      <h3>{cliente ? "Editar Cliente" : "Novo Cliente"}</h3>

      <div style={{ marginBottom: "10px" }}>
        <label>Nome:</label>
        <input
          type="text"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          required
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>NIF:</label>
        <input
          type="text"
          name="nif"
          value={formData.nif}
          onChange={handleChange}
          required
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button type="submit">💾 Guardar</button>
        <button type="button" onClick={onCancelar}>
          ❌ Cancelar
        </button>
      </div>
    </form>
  );
};

export default FormularioCliente;

