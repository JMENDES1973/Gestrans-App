import React from 'react';

export default function Notificacao({ tipo='aviso', mensagem, onClose }) {
  if (!mensagem) return null;
  const map = {
    sucesso: { bg:'#d4edda', fg:'#155724', bd:'#c3e6cb' },
    erro:    { bg:'#f8d7da', fg:'#721c24', bd:'#f5c6cb' },
    aviso:   { bg:'#fff3cd', fg:'#856404', bd:'#ffeaa7' },
  };
  const s = map[tipo] || map.aviso;
  return (
    <div style={{position:'fixed', top:20, right:20, background:s.bg, color:s.fg, border:`1px solid ${s.bd}`, padding:'10px 14px', borderRadius:6, zIndex:2000}}>
      <span>{mensagem}</span>
      <button onClick={onClose} style={{marginLeft:10}}>×</button>
    </div>
  );
}
