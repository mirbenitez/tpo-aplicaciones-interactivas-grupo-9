import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCobranzasPorCredito,
  addCobranza,
  updateCobranza,
  removeCobranza,
  clearCobranzas,
  clearError,
} from '../store/slices/cobranzasSlice';

const EMPTY = { idCredito:'', idCuota:'', importe:'' };

export default function Cobranzas() {
  const dispatch = useDispatch();
  const { lista, loading, error } = useSelector((state) => state.cobranzas);
  const [idCredito, setIdCredito] = useState('');
  const [buscado, setBuscado]     = useState(false);
  const [form, setForm]           = useState(EMPTY);
  const [editandoId, setEditando] = useState(null);
  const [mensaje, setMensaje]     = useState('');

  const buscar = async (e) => {
    e.preventDefault();
    dispatch(clearCobranzas());
    const result = await dispatch(fetchCobranzasPorCredito(idCredito));
    if (result.meta.requestStatus === 'fulfilled') setBuscado(true);
  };

  const resetForm = () => {
    setForm(EMPTY);
    setEditando(null);
    dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      idCredito: Number(form.idCredito),
      idCuota:   Number(form.idCuota),
      importe:   Number(form.importe),
    };

    if (editandoId === null) {
      const result = await dispatch(addCobranza(payload));
      if (result.meta.requestStatus === 'fulfilled') {
        setMensaje(`Cobranza #${result.payload.id} registrada.`);
        resetForm();
        if (String(payload.idCredito) === idCredito) {
          dispatch(fetchCobranzasPorCredito(idCredito));
        }
      }
    } else {
      const result = await dispatch(updateCobranza({ id: editandoId, data: payload }));
      if (result.meta.requestStatus === 'fulfilled') {
        setMensaje(`Cobranza #${editandoId} actualizada.`);
        resetForm();
        if (String(payload.idCredito) === idCredito) {
          dispatch(fetchCobranzasPorCredito(idCredito));
        }
      }
    }
  };

  const handleEditar = (c) => {
    setEditando(c.id);
    setForm({
      idCredito: c.idCredito,
      idCuota:   c.idCuota,
      importe:   c.importe,
    });
    dispatch(clearError());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (c) => {
    const ok = window.confirm(`¿Eliminar la cobranza #${c.id}?`);
    if (!ok) return;
    const result = await dispatch(removeCobranza(c.id));
    if (result.meta.requestStatus === 'fulfilled') {
      setMensaje(`Cobranza #${c.id} eliminada.`);
      if (editandoId === c.id) resetForm();
    }
  };

  useEffect(() => {
    if (!mensaje) return;
    const t = setTimeout(() => setMensaje(''), 3000);
    return () => clearTimeout(t);
  }, [mensaje]);

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Cobranzas</h2>

      <div style={styles.card}>
        <h3>Buscar cobranzas por crédito</h3>
        <form onSubmit={buscar} style={styles.row}>
          <input style={styles.input} placeholder="ID del crédito" type="number" value={idCredito} onChange={e => setIdCredito(e.target.value)} required />
          <button style={styles.btn} disabled={loading}>{loading ? 'Buscando...' : 'Buscar'}</button>
        </form>
      </div>

      <div style={styles.card}>
        <h3>{editandoId === null ? 'Registrar pago de cuota' : `Editar cobranza #${editandoId}`}</h3>
        {error   && <div style={styles.error}>⚠ {error}</div>}
        {mensaje && <div style={styles.success}>✔ {mensaje}</div>}
        <form onSubmit={handleSubmit} style={styles.row}>
          <input style={styles.input} placeholder="ID crédito" type="number"           value={form.idCredito} onChange={e => setForm({...form, idCredito: e.target.value})} required />
          <input style={styles.input} placeholder="Nro. cuota"  type="number" min="1"   value={form.idCuota}   onChange={e => setForm({...form, idCuota: e.target.value})}   required />
          <input style={styles.input} placeholder="Importe"     type="number"           value={form.importe}   onChange={e => setForm({...form, importe: e.target.value})}   required />
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Guardando...' : editandoId === null ? 'Registrar' : 'Guardar cambios'}
          </button>
          {editandoId !== null && (
            <button type="button" style={styles.btnSecondary} onClick={resetForm} disabled={loading}>
              Cancelar
            </button>
          )}
        </form>
      </div>

      {buscado && (
        <div style={styles.card}>
          <h3>Cobranzas del crédito #{idCredito} ({lista.length})</h3>
          {loading && <p style={styles.empty}>Cargando...</p>}
          {!loading && lista.length === 0 && <p style={styles.empty}>Sin cobranzas registradas.</p>}
          {lista.length > 0 && (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Crédito</th>
                  <th>Cuota</th>
                  <th>Importe</th>
                  <th style={{ textAlign:'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lista.map(c => (
                  <tr key={c.id}>
                    <td>#{c.id}</td>
                    <td>{c.idCredito}</td>
                    <td>{c.idCuota}</td>
                    <td>${c.importe}</td>
                    <td style={{ textAlign:'right' }}>
                      <button style={styles.btnSmall}                          onClick={() => handleEditar(c)}    disabled={loading}>Editar</button>{' '}
                      <button style={{...styles.btnSmall, ...styles.btnDanger}} onClick={() => handleEliminar(c)} disabled={loading}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  page:         { padding:'32px', maxWidth:'900px', margin:'0 auto' },
  title:        { color:'#1e3a5f', marginBottom:'24px' },
  card:         { background:'white', padding:'24px', borderRadius:'12px', boxShadow:'0 2px 10px rgba(0,0,0,0.08)', marginBottom:'24px' },
  row:          { display:'flex', gap:'12px', flexWrap:'wrap' },
  input:        { padding:'10px', border:'1px solid #ccc', borderRadius:'6px', flex:'1', minWidth:'120px' },
  btn:          { padding:'10px 20px', backgroundColor:'#1e3a5f', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'bold' },
  btnSecondary: { padding:'10px 16px', backgroundColor:'#eceff1', color:'#37474f', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' },
  btnSmall:     { padding:'5px 12px', backgroundColor:'#1976d2', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'0.85rem' },
  btnDanger:    { backgroundColor:'#e53935' },
  error:        { background:'#ffebee', color:'#c62828', padding:'10px', borderRadius:'6px', marginBottom:'12px', fontSize:'0.9rem' },
  success:      { background:'#e8f5e9', color:'#2e7d32', padding:'10px', borderRadius:'6px', marginBottom:'12px', fontSize:'0.9rem' },
  empty:        { color:'#999' },
  table:        { width:'100%', borderCollapse:'collapse' },
};
