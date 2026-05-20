import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getEtiquetas,
  crearEtiqueta,
  editarEtiqueta,
  eliminarEtiqueta,
  asignarEtiqueta,
  desasignarEtiqueta,
} from '../../api/etiquetas';

// ───────────────────────── Thunks ─────────────────────────

export const fetchEtiquetas = createAsyncThunk(
  'etiquetas/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await getEtiquetas();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addEtiqueta = createAsyncThunk(
  'etiquetas/add',
  async (data, { rejectWithValue }) => {
    try {
      return await crearEtiqueta(data);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateEtiqueta = createAsyncThunk(
  'etiquetas/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await editarEtiqueta(id, data);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeEtiqueta = createAsyncThunk(
  'etiquetas/remove',
  async (id, { rejectWithValue }) => {
    try {
      await eliminarEtiqueta(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const asignarEtiquetaAClienteThunk = createAsyncThunk(
  'etiquetas/asignar',
  async ({ dni, idEtiqueta }, { rejectWithValue }) => {
    try {
      await asignarEtiqueta(dni, idEtiqueta);
      return { dni, idEtiqueta };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const desasignarEtiquetaDeClienteThunk = createAsyncThunk(
  'etiquetas/desasignar',
  async ({ dni, idEtiqueta }, { rejectWithValue }) => {
    try {
      await desasignarEtiqueta(dni, idEtiqueta);
      return { dni, idEtiqueta };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ───────────────────────── Slice ─────────────────────────

const etiquetasSlice = createSlice({
  name: 'etiquetas',
  initialState: {
    lista:   [],
    loading: false,
    error:   null,
  },
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    const onPending  = (state) => { state.loading = true;  state.error = null; };
    const onRejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      // listar
      .addCase(fetchEtiquetas.pending,   onPending)
      .addCase(fetchEtiquetas.fulfilled, (state, action) => { state.loading = false; state.lista = action.payload; })
      .addCase(fetchEtiquetas.rejected,  onRejected)
      // crear
      .addCase(addEtiqueta.pending,   onPending)
      .addCase(addEtiqueta.fulfilled, (state, action) => { state.loading = false; state.lista.push(action.payload); })
      .addCase(addEtiqueta.rejected,  onRejected)
      // actualizar
      .addCase(updateEtiqueta.pending,   onPending)
      .addCase(updateEtiqueta.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.lista.findIndex(e => e.id === action.payload.id);
        if (idx !== -1) state.lista[idx] = action.payload;
      })
      .addCase(updateEtiqueta.rejected,  onRejected)
      // eliminar
      .addCase(removeEtiqueta.pending,   onPending)
      .addCase(removeEtiqueta.fulfilled, (state, action) => {
        state.loading = false;
        state.lista = state.lista.filter(e => e.id !== action.payload);
      })
      .addCase(removeEtiqueta.rejected,  onRejected)
      // asignar / desasignar (solo manejo de loading/error, el detalle del cliente se recarga aparte)
      .addCase(asignarEtiquetaAClienteThunk.pending,    onPending)
      .addCase(asignarEtiquetaAClienteThunk.fulfilled,  (state) => { state.loading = false; })
      .addCase(asignarEtiquetaAClienteThunk.rejected,   onRejected)
      .addCase(desasignarEtiquetaDeClienteThunk.pending,   onPending)
      .addCase(desasignarEtiquetaDeClienteThunk.fulfilled, (state) => { state.loading = false; })
      .addCase(desasignarEtiquetaDeClienteThunk.rejected,  onRejected);
  },
});

export const { clearError } = etiquetasSlice.actions;
export default etiquetasSlice.reducer;
