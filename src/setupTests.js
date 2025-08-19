// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// --- Canvas & signature pad stubs for JSDOM test environment ---
// JSDOM no implementa completamente <canvas>. Las librerías signature_pad y jsPDF
// invocan getContext('2d') y acceden a propiedades/métodos del contexto.
// Definimos un stub mínimo para evitar errores durante las pruebas.
if (!HTMLCanvasElement.prototype.getContext) {
	HTMLCanvasElement.prototype.getContext = function () {
		return {
			// Propiedades configurables
			fillStyle: '',
			strokeStyle: '',
			lineWidth: 0,
			// Métodos vacíos usados comúnmente
			clearRect: () => {},
			fillRect: () => {},
			beginPath: () => {},
			moveTo: () => {},
			lineTo: () => {},
			closePath: () => {},
			stroke: () => {},
			scale: () => {},
			// Medidas
			measureText: (text) => ({ width: text.length * 6 }),
			// Path2D substitutes
			quadraticCurveTo: () => {},
			bezierCurveTo: () => {},
			arc: () => {},
			rect: () => {},
			fill: () => {},
			save: () => {},
			restore: () => {},
			translate: () => {},
		};
	};
}

// toDataURL usado para exportar la firma
if (!HTMLCanvasElement.prototype.toDataURL) {
	HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,stub';
}

// Mock ligero de signature_pad para aislar pruebas del canvas real
jest.mock('signature_pad', () => {
	return jest.fn().mockImplementation(() => ({
		clear: jest.fn(),
		isEmpty: () => true,
		off: jest.fn(),
	}));
});

// Evitar ruido de "Not implemented: HTMLCanvasElement.prototype.getContext"
const originalError = console.error;
console.error = (...args) => {
	if (typeof args[0] === 'string' && args[0].includes('Not implemented: HTMLCanvasElement.prototype.getContext')) {
		return; // silenciar mensaje esperado en entorno de test
	}
	originalError(...args);
};
