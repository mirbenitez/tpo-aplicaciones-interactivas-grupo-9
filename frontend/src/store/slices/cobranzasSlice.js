import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getCobranzasPorCredito,
  registrarCobranza,
  editarCobranza,
  eliminarCobranza,
} from '../../api/cobranzas';

export const fetchCobranzasPorCredito = createAsyncThunk(
  'cobranzas/fetchPorCredito',
  async (idCredito, { rejectWithValue }) => {
    try { return await getCobranzasPorCredito(idCredito); }
    catch (err) { return rejectWithValue(err.message); }
  }
);

export const addCobranza = createAsyncThunk(
  'cobranzas/add',
  async (data, { rejectWithValue }) => {
    try { return await registrarCobranza(data); }
    catch (err) { return rejectWithValue(err.message); }
  }
);

export const updateCobranza = createAsyncThunk(
  'cobranzas/update',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await editarCobranza(id, data); }
    catch (err) { return rejectWithValue(err.message); }
  }
);

export const removeCobranza = createAsyncThunk(
  'cobranzas/remove',
  async (id, { rejectWithValue }) => {
    try { await eliminarCobranza(id); return id; }
    catch (err) { return rejectWithValue(err.message); }
  }
);

const cobranzasSlice = createSlice({
  name: 'cobranzas',
  initialState: {
    lista:   [],
    loading: false,
    error:   null,
  },
  reducers: {
    clearCobranzas(state) { state.lista = []; },
    clearError(state)     { state.error = null; },
  },
  extraReducers: (builder) => {
    const onPending  = (state) => { state.loading = true;  state.error = null; };
    const onRejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(fetchCobranzasPorCredito.pending,   onPending)
      .addCase(fetchCobranzasPorCredito.fulfilled, (state, action) => { state.loading = false; state.lista = action.payload; })
      .addCase(fetchCobranzasPorCredito.rejected,  onRejected)

      .addCase(addCobranza.pending,    onPending)
      .addCase(addCobranza.fulfilled,  (state, action) => { state.loading = false; state.lista.push(action.payload); })
      .addCase(addCobranza.rejected,   onRejected)

      .addCase(updateCobranza.pending,   onPending)
      .addCase(updateCobranza.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.lista.findIndex(c => c.id === action.payload.id);
        if (idx !== -1) state.lista[idx] = action.payload;
      })
      .addCase(updateCobranza.rejected,  onRejected)

      .addCase(removeCobranza.pending,   onPending)
      .addCase(removeCobranza.fulfilled, (state, action) => {
        state.loading = false;
        state.lista = state.lista.filter(c => c.id !== action.payload);
      })
      .addCase(removeCobranza.rejected,  onRejected);
  },
});

export const { clearCobranzas, clearError } = cobranzasSlice.actions;
export default cobranzasSlice.reducer;
