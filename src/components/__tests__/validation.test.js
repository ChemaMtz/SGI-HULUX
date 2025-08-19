import { validateOrdenTrabajo, validateDevolucion } from '../../utils/validation';

describe('validateOrdenTrabajo', () => {
  it('rechaza sin destino y sin actividades', () => {
    const { valid, errors } = validateOrdenTrabajo({
      destino: '',
      actividades: { Instalaciones: false },
      materiales: [],
      firmas: {}
    });
    expect(valid).toBe(false);
    expect(errors).toEqual(expect.arrayContaining(['Destino es requerido.', 'Selecciona al menos una actividad.']));
  });

  it('acepta datos mínimos válidos', () => {
    const { valid, errors, clean } = validateOrdenTrabajo({
      destino: 'Ciudad X',
      actividades: { Instalaciones: true },
      materiales: [{ cantidad: '2', descripcion: 'Cable' }],
      firmas: {}
    });
    expect(valid).toBe(true);
    expect(errors.length).toBe(0);
    expect(clean.materiales.length).toBe(1);
  });
});

describe('validateDevolucion', () => {
  it('requiere cliente', () => {
    const { valid, errors } = validateDevolucion({ cliente: '', actividad: '', observaciones: '' });
    expect(valid).toBe(false);
    expect(errors).toContain('Cliente es requerido.');
  });

  it('requiere modelo cuando onu_rip > 0', () => {
    const { valid, errors } = validateDevolucion({ cliente: 'ACME', actividad: 'X', onu_rip: 1 });
    expect(valid).toBe(false);
    expect(errors.some(e => e.includes('onu rip'))).toBe(true);
  });

  it('acepta devolución válida', () => {
    const { valid, errors } = validateDevolucion({ cliente: 'ACME', actividad: 'X', onu_rip: 1, onu_rip_modelo: 'HG8145X6' });
    expect(valid).toBe(true);
    expect(errors.length).toBe(0);
  });
});
