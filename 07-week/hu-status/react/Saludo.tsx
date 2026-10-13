import React, { useState } from 'react';

interface SaludoProps {
  nombreInicial?: string;
}

const Saludo: React.FC<SaludoProps> = ({ nombreInicial = "Estudiante" }) => {
  const [nombre, setNombre] = useState<string>(nombreInicial);
  const [mensaje, setMensaje] = useState<string>("");

  const handleSaludar = () => {
    setMensaje(`¡Hola, ${nombre}! Bienvenido a la Semana 07.`);
  };

  return (
    <div style={{ padding: '16px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '400px' }}>
      <h2>Componente de Saludo</h2>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>Ingresa tu nombre:</label>
        <input 
          type="text" 
          value={nombre} 
          onChange={(e) => setNombre(e.target.value)} 
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
        />
      </div>
      <button 
        onClick={handleSaludar} 
        style={{ width: '100%', padding: '10px', backgroundColor: '#3880ff', color: '#fff', border: 'none', borderRadius: '4px' }}
      >
        Saludar
      </button>
      {mensaje && <p style={{ marginTop: '12px', fontWeight: 'bold' }}>{mensaje}</p>}
    </div>
  );
};

export default Saludo;