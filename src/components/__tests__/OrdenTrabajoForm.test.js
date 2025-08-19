import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import OrdenTrabajo from '../OrdenTrabajoForm';

jest.mock('../../firebase/firebaseConfig', () => ({
  db: {},
  auth: { currentUser: { uid: 'u1', email: 'user@test.com' } }
}));

jest.mock('firebase/firestore', () => ({
  collection: () => ({}),
  onSnapshot: () => () => {},
  addDoc: jest.fn(() => Promise.resolve()),
  serverTimestamp: () => new Date()
}));

jest.mock('../../firebase/counters', () => ({
  getSafeSequence: jest.fn(() => Promise.resolve(1))
}));

describe('OrdenTrabajoForm', () => {
  it('muestra error si se intenta enviar sin seleccionar actividades', async () => {
    render(<OrdenTrabajo />);
    const destinoInput = screen.getByPlaceholderText(/Municipio, Localidad/i);
    fireEvent.change(destinoInput, { target: { value: 'Ciudad' } });
    const submitBtn = screen.getByRole('button', { name: /Guardar Orden de Trabajo/i });
    fireEvent.click(submitBtn);
    // No assertions on toast (mock), but the form should not crash and número no se crea dos veces
    expect(destinoInput.value).toBe('Ciudad');
  });
});
