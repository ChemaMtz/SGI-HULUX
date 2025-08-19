import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MaterialTable from '../MaterialTable';
import OrdenTrabajoTable from '../OrdenTrabajoTable';

jest.mock('../../firebase/firebaseConfig', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => ({})),
  onSnapshot: (colRef, cb) => {
    const devoluciones = [
      { id: 'd1', numero_orden: 'ORD-001', cliente: 'Alice', fecha: '2025-01-01', actividad: 'Act1' },
      { id: 'd2', numero_orden: 'ORD-002', cliente: 'Bob', fecha: '2025-01-02', actividad: 'Act2' },
      { id: 'd3', numero_orden: 'ORD-003', cliente: 'Carlos', fecha: '2025-01-03', actividad: 'Act3' },
    ];
    const docs = devoluciones.map(d => ({ id: d.id, data: () => d }));
    cb({ docs });
    return () => {};
  }
}));

describe('Tablas con filtros y paginación', () => {
  test('MaterialTable filtra por cliente', () => {
    render(<MaterialTable />);
    expect(screen.getByText('ORD-001')).toBeInTheDocument();
    const input = screen.getByPlaceholderText(/Filtrar por cliente/i);
    fireEvent.change(input, { target: { value: 'bob' } });
    expect(screen.getByText('ORD-002')).toBeInTheDocument();
    expect(screen.queryByText('ORD-001')).not.toBeInTheDocument();
  });

  test('OrdenTrabajoTable muestra mensaje vacío al no coincidir filtro', () => {
    render(<OrdenTrabajoTable />);
    const input = screen.getByPlaceholderText(/Filtrar por número, destino o actividad/i);
    fireEvent.change(input, { target: { value: 'ZZZ' } });
    expect(screen.getByText(/No hay órdenes que coincidan/)).toBeInTheDocument();
  });
});
