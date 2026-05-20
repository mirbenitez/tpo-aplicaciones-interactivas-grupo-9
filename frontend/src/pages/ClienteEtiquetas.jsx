import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClientePorDni, clearSeleccionado } from '../store/slices/clientesSlice';
import {
  fetchEtiquetas,
  asignarEtiquetaAClienteThunk,
  desasignarEtiquetaDeClienteThunk,
  clearError as clearEtiquetasError,
} from '../store/slices/etiquetasSlice';

/**
 * Página para administrar las etiquetas de un cliente puntual.
 *
 * Flujo:
 *   1. el usuario busca un cliente por DNI -> GET /api/clientes/{dni}
 *   2. se muestran las etiquetas asignadas al cliente y las disponibles
 *   3. se puede asignar  -> POST   /api/clientes/{dni}/etiquetas/{idEtiqueta}
 *   4. se puede desasignar -> DELETE /api/clientes/{dni}/etiquetas/{idEtiqueta}
 *
 * Maneja estados de carga y errores básicos.
 */
export default function ClienteEtiquetas() {
  const dispatch = useDispatch();
  const { seleccionado, loading: loadingCliente, error: errorCliente } = useSelector(s => s.clientes);
  const { lista: etiquetas, loading: loadingEtiq, error: errorEtiq }   = useSelector(s => s.etiquetas);

  const [dni, setDni]       = useState('');
  const [busque, setBusque] = useState(false);
  const [mensaje, setMensaje] = useState('');

  // Cargar todas las etiquetas al entrar
  useEffect(() => {
    dispatch(fetchEtiquetas());
    return () => { dispatch(clearSeleccionado()); };
  }, [dispatch]);

  // Limpieza del mensaje de éxito
  useEffect(() => {
    if (!mensaje) return;
    const t = setTimeout(() => setMensaje(''), 3000);
    return () => clearTimeout(t);
  }, [mensaje]);

  const buscarCliente = async (e) => {
    e.preventDefault();
    dispatch(clearEtiquetasError());
    const result = await dispatch(fetchClientePorDni(dni.trim()));
    setBusque(result.meta.requestStatus === 'fulfilled');
  };

  const recargarCliente = () => {
    if (!seleccionado) return;
    dispatch(fetchClientePorDni(seleccionado.dni));
  };

  const handleAsignar = async (idEtiqueta) => {
    if (!seleccionado) return;
    const result = await dispatch(asignarEtiquetaAClienteThunk({ dni: seleccionado.dni, idEtiqueta }));
    if (result.meta.requestStatus === 'fulfilled') {
      setMensaje('Etiqueta asignada correctamente.');
      recargarCliente();
    }
  };

  const handleDesasignar = async (idEtiqueta, nombre) => {
    if (!seleccionado) return;
    const ok = window.confirm(`¿Quitar la etiqueta "${nombre}" al cliente?`);
    if (!ok) return;
    const result = await dispatch(desasignarEtiquetaDeClienteThunk({ dni: seleccionado.dni, idEtiqueta }));
    if (result.meta.requestStatus === 'fulfilled') {
      setMensaje('Etiqueta desasignada correctamente.');
      recargarCliente();
    }
  };

  // Etiquetas que el cliente todavía NO tiene
  const idsAsignadas = (seleccionado?.etiquetas ?? []).map(e => e.id);
  const disponibles  = etiquetas.filter(e => !idsAsignadas.includes(e.id));

  const errorVisible = errorEtiq || errorCliente;
  const cargando     = loadingCliente || loadingEtiq;

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>🏷️ Etiquetas por cliente</h2>
      <p style={styles.subtitle}>Asigná o quitá etiquetas a un cliente buscándolo por DNI.</p>

      {/* Buscador de cliente */}
      <div style={styles.card}>
        <h3>Buscar cliente</h3>
        <form onSubmit={buscarCliente} style={styles.row}>
          <input
            style={styles.input}
            placeholder="DNI del cliente"
            value={dni}
            onChange={e => setDni(e.target.value)}
            required
          />
          <button type="submit" style={styles.btn} disabled={loadingCliente}>
            {loadingCliente ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      </div>

      {/* Mensajes globales */}
      {errorVisible && <div style={styles.error}>⚠ {errorVisible}</div>}
      {mensaje      && <div style={styles.success}>✔ {mensaje}</div>}

      {/* Detalle del cliente */}
      {busque && seleccionado && (
        <>
          <div style={styles.card}>
            <h3>Cliente: {seleccionado.nombre}</h3>
            <p style={styles.helper}>DNI: <strong>{seleccionado.dni}</strong></p>

            <h4 style={styles.sectionTitle}>Etiquetas asignadas ({seleccionado.etiquetas?.length ?? 0})</h4>
            {(!seleccionado.etiquetas || seleccionado.etiquetas.length === 0) && (
              <p style={styles.empty}>Este cliente todavía no tiene etiquetas asignadas.</p>
            )}
            <div style={styles.chipList}>
              {(seleccionado.etiquetas ?? []).map(et => (
                <span key={et.id} style={styles.chipAssigned}>
                  {et.nombre}
                  <button
                    style={styles.chipCloseBtn}
                    onClick={() => handleDesasignar(et.id, et.nombre)}
                    disabled={cargando}
                    title="Quitar etiqueta"
                  >×</button>
                </span>
              ))}
            </div>
          </div>

          <div style={styles.card}>
            <h4 style={styles.sectionTitle}>Etiquetas disponibles para asignar ({disponibles.length})</h4>
            {disponibles.length === 0 && (
              <p style={styles.empty}>No quedan etiquetas para asignar. Podés crear más en la pantalla de Etiquetas.</p>
            )}
            <div style={styles.chipList}>
              {disponibles.map(et => (
                <button
                  key={et.id}
                  style={styles.chipAdd}
                  onClick={() => handleAsignar(et.id)}
                  disabled={cargando}
                >
                  + {et.nombre}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {busque && !seleccionado && !loadingCliente && !errorCliente && (
        <p style={styles.empty}>No se encontró un cliente con ese DNI.</p>
      )}
    </div>
  );
}

const styles = {
  page:         { padding:'32px', maxWidth:'900px', margin:'0 auto' },
  title:        { color:'#1e3a5f', marginBottom:'4px' },
  subtitle:     { color:'#666', marginBottom:'24px', fontSize:'0.95rem' },
  card:         { background:'white', padding:'24px', borderRadius:'12px', boxShadow:'0 2px 10px rgba(0,0,0,0.08)', marginBottom:'24px' },
  row:          { display:'flex', gap:'12px', flexWrap:'wrap' },
  input:        { padding:'10px', border:'1px solid #ccc', borderRadius:'6px', flex:'1', minWidth:'160px' },
  btn:          { padding:'10px 20px', backgroundColor:'#1e3a5f', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'bold' },
  error:        { background:'#ffebee', color:'#c62828', padding:'10px', borderRadius:'6px', marginBottom:'12px', fontSize:'0.9rem' },
  success:      { background:'#e8f5e9', color:'#2e7d32', padding:'10px', borderRadius:'6px', marginBottom:'12px', fontSize:'0.9rem' },
  empty:        { color:'#999', padding:'8px 0' },
  helper:       { color:'#666', fontSize:'0.95rem', marginBottom:'10px' },
  sectionTitle: { color:'#1e3a5f', marginTop:'16px', marginBottom:'10px' },
  chipList:     { display:'flex', flexWrap:'wrap', gap:'8px', marginTop:'4px' },
  chipAssigned: { display:'inline-flex', alignItems:'center', gap:'6px', padding:'6px 8px 6px 14px', backgroundColor:'#e3f2fd', color:'#1565c0', borderRadius:'18px', fontWeight:'500', fontSize:'0.9rem' },
  chipCloseBtn: { background:'#c62828', color:'white', border:'none', borderRadius:'50%', width:'22px', height:'22px', cursor:'pointer', fontSize:'0.9rem', display:'flex', alignItems:'center', justifyContent:'center' },
  chipAdd:      { padding:'6px 14px', background:'#f1f8e9', color:'#33691e', border:'1px dashed #aed581', borderRadius:'18px', cursor:'pointer', fontWeight:'500', fontSize:'0.9rem' },
};
