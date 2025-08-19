import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DevolucionMaterial from '../DevolucionMaterial';

jest.mock('../../firebase/firebaseConfig', () => ({
  db: {},
  auth: { currentUser: { uid: 'u1', email: 'user@test.com' } }
}));

jest.mock('firebase/firestore', () => ({
  collection: () => ({}),
  addDoc: jest.fn(() => Promise.resolve()),
  serverTimestamp: () => new Date()
}));

jest.mock('../../firebase/counters', () => ({
  getSafeFormattedSequence: jest.fn(() => Promise.resolve({ numero: 1, idFormateado: 'ORD-001' }))
}));

describe('DevolucionMaterial', () => {
  it('requiere cliente antes de enviar', () => {
    render(<DevolucionMaterial />);
    const submitBtn = screen.getByRole('button', { name: /Guardar Devolución/i });
    fireEvent.click(submitBtn);
    expect(screen.getByText(/Cliente es requerido\./i)).toBeInTheDocument();
  });
});
