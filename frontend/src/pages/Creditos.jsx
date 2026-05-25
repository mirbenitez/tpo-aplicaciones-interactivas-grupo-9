import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCreditosPorCliente,
  addCredito,
  updateCredito,
  removeCredito,
  clearCreditos,
  clearError,
} from '../store/slices/creditosSlice';

const EMPTY = { dniCliente:'', deudaOriginal:'', fecha:'', importeCuota:'', cantidadCuotas:'' };

export default function Creditos() {
  const dispatch = useDispatch();
  const { lista, loading, error } = useSelector((state) => state.creditos);
  const [dni, setDni]             = useState('');
  const [buscado, setBuscado]     = useState(false);
  const [form, setForm]           = useState(EMPTY);
  const [editandoId, setEditando] = useState(null);
  const [mensaje, setMensaje]     = useState('');

  const buscar = async (e) => {
    e.preventDefault();
    dispatch(clearCreditos());
    const result = await dispatch(fetchCreditosPorCliente(dni));
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
      ...form,
      deudaOriginal:  Number(form.deudaOriginal),
      importeCuota:   Number(form.importeCuota),
      cantidadCuotas: Number(form.cantidadCuotas),
    };

    if (editandoId === null) {
      const result = await dispatch(addCredito(payload));
      if (result.meta.requestStatus === 'fulfilled') {
        setMensaje(`Crédito #${result.payload.id} creado correctamente.`);
        resetForm();
        if (form.dniCliente === dni) dispatch(fetchCreditosPorCliente(dni));
      }
    } else {
      const result = await dispatch(updateCredito({ id: editandoId, data: payload }));
      if (result.meta.requestStatus === 'fulfilled') {
        setMensaje(`Crédito #${editandoId} actualizado correctamente.`);
        resetForm();
        if (form.dniCliente === dni) dispatch(fetchCreditosPorCliente(dni));
      }
    }
  };

  const handleEditar = (cr) => {
    setEditando(cr.id);
    setForm({
      dniCliente:     cr.dniCliente,
      deudaOriginal:  cr.deudaOriginal,
      fecha:          cr.fecha,
      importeCuota:   cr.importeCuota,
      cantidadCuotas: cr.cantidadCuotas,
    });
    dispatch(clearError());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (cr) => {
    const ok = window.confirm(`¿Eliminar el crédito #${cr.id}? Esta acción no se puede deshacer.`);
    if (!ok) return;
    const result = await dispatch(removeCredito(cr.id));
    if (result.meta.requestStatus === 'fulfilled') {
      setMensaje(`Crédito #${cr.id} eliminado.`);
      if (editandoId === cr.id) resetForm();
    }
  };

  // limpiar mensaje a los 3s
  useEffect(() => {
    if (!mensaje) return;
    const t = setTimeout(() => setMensaje(''), 3000);
    return () => clearTimeout(t);
  }, [mensaje]);

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Créditos</h2>

      <div style={styles.card}>
        <h3>Buscar créditos por cliente</h3>
        <form onSubmit={buscar} style={styles.row}>
          <input style={styles.input} placeholder="DNI del cliente" value={dni} onChange={e => setDni(e.target.value)} required />
          <button style={styles.btn} disabled={loading}>{loading ? 'Buscando...' : 'Buscar'}</button>
        </form>
      </div>

      <div style={styles.card}>
        <h3>{editandoId === null ? 'Nuevo crédito' : `Editar crédito #${editandoId}`}</h3>
        {error   && <div style={styles.error}>⚠ {error}</div>}
        {mensaje && <div style={styles.success}>✔ {mensaje}</div>}
        <form onSubmit={handleSubmit} style={styles.grid}>
          <input style={styles.input} placeholder="DNI cliente"    value={form.dniCliente}     onChange={e => setForm({...form, dniCliente: e.target.value})}     required />
          <input style={styles.input} placeholder="Deuda original" value={form.deudaOriginal}  onChange={e => setForm({...form, deudaOriginal: e.target.value})}  type="number" required />
          <input style={styles.input} placeholder="Fecha"          value={form.fecha}          onChange={e => setForm({...form, fecha: e.target.value})}          type="date"   required />
          <input style={styles.input} placeholder="Importe cuota"  value={form.importeCuota}   onChange={e => setForm({...form, importeCuota: e.target.value})}   type="number" required />
          <input style={styles.input} placeholder="Cant. cuotas"   value={form.cantidadCuotas} onChange={e => setForm({...form, cantidadCuotas: e.target.value})} type="number" min="1" required />
          <div style={{ display:'flex', gap:'10px', gridColumn:'span 2' }}>
            <button type="submit" style={styles.btn} disabled={loading}>
              {loading ? 'Guardando...' : editandoId === null ? 'Crear crédito' : 'Guardar cambios'}
            </button>
            {editandoId !== null && (
              <button type="button" style={styles.btnSecondary} onClick={resetForm} disabled={loading}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {buscado && (
        <div style={styles.card}>
          <h3>Créditos del cliente ({lista.length})</h3>
          {loading && <p style={styles.empty}>Cargando...</p>}
          {!loading && lista.length === 0 && <p style={styles.empty}>Sin créditos.</p>}
          {lista.map(cr => (
            <div key={cr.id} style={styles.creditoBox}>
              <div style={styles.creditoHeader}>
                <p style={{ margin: 0 }}>
                  <strong>ID #{cr.id}</strong> — Deuda: ${cr.deudaOriginal} — {cr.cantidadCuotas} cuotas de ${cr.importeCuota}
                </p>
                <div>
                  <button style={styles.btnSmall}                       onClick={() => handleEditar(cr)}    disabled={loading}>Editar</button>{' '}
                  <button style={{...styles.btnSmall, ...styles.btnDanger}} onClick={() => handleEliminar(cr)} disabled={loading}>Eliminar</button>
                </div>
              </div>
              <table style={styles.table}>
                <thead><tr><th>#</th><th>Vencimiento</th><th>Estado</th></tr></thead>
                <tbody>
                  {cr.cuotas.map(c => (
                    <tr key={c.idCuota}>
                      <td>{c.idCuota}</td>
                      <td>{c.fechaVencimiento}</td>
                      <td style={{ color: c.pagada ? '#2e7d32' : '#c62828' }}>{c.pagada ? '✔ Pagada' : '✘ Pendiente'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page:          { padding:'32px', maxWidth:'900px', margin:'0 auto' },
  title:         { color:'#1e3a5f', marginBottom:'24px' },
  card:          { background:'white', padding:'24px', borderRadius:'12px', boxShadow:'0 2px 10px rgba(0,0,0,0.08)', marginBottom:'24px' },
  row:           { display:'flex', gap:'12px' },
  grid:          { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' },
  input:         { padding:'10px', border:'1px solid #ccc', borderRadius:'6px', width:'100%', boxSizing:'border-box' },
  btn:           { padding:'10px 20px', backgroundColor:'#1e3a5f', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'bold' },
  btnSecondary:  { padding:'10px 16px', backgroundColor:'#eceff1', color:'#37474f', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' },
  btnSmall:      { padding:'5px 12px', backgroundColor:'#1976d2', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'0.85rem' },
  btnDanger:     { backgroundColor:'#e53935' },
  error:         { background:'#ffebee', color:'#c62828', padding:'10px', borderRadius:'6px', marginBottom:'12px', fontSize:'0.9rem' },
  success:       { background:'#e8f5e9', color:'#2e7d32', padding:'10px', borderRadius:'6px', marginBottom:'12px', fontSize:'0.9rem' },
  empty:         { color:'#999' },
  creditoBox:    { borderLeft:'4px solid #1e3a5f', paddingLeft:'16px', marginBottom:'20px' },
  creditoHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px', flexWrap:'wrap', gap:'8px' },
  table:         { width:'100%', borderCollapse:'collapse', marginTop:'8px' },
};
