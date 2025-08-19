<div align="center">
	<h1>SGI-HULUX ®</h1>
	<p><strong>Sistema de Gestión Integral (Órdenes de Trabajo + Devolución de Materiales)</strong></p>
	<p>React 18 · Firebase (Auth, Firestore, Callable Functions) · Firmas digitales · PDFs profesionales</p>
</div>

---

## 🚀 Resumen
Aplicación interna para:
1. Registrar Órdenes de Trabajo con numeración secuencial formateada (OT-00001 ...).
2. Registrar Devoluciones de Material con control de modelos y cantidades.
3. Capturar firmas (revisó / autorizó / solicitó) y exportar PDFs con branding, encabezado, pie y firmas alineadas horizontalmente.
4. Filtrar y paginar resultados en tablas con estados de carga y error.

Estado actual: numeración segura preparada (callable `incrementCounter`), usando fallback transaccional local temporal (reglas abiertas para pruebas). PDFs mejorados en ambos módulos. Validación centralizada. Reglas se deben endurecer antes de producción.

## 🧱 Stack
| Capa | Tecnología |
|------|------------|
| UI | React 18 (CRA) + Bootstrap 5 |
| Routing | React Router v6 |
| Datos | Firebase Firestore (tiempo real) |
| Auth | Firebase Authentication |
| Funciones | Cloud Function callable (contador) *(desplegar para endurecer)* |
| PDFs | jsPDF + jspdf-autotable (utilidades en `utils/pdf.js`) |
| Firmas | signature_pad (canvas) |
| Notificaciones | react-toastify |
| Tests | Jest + Testing Library |

## 📂 Estructura
```
src/
	components/        # Formularios, tablas, navegación, firmas, ErrorBoundary
	pages/             # Contenedores de vistas (routing)
	firebase/          # Config + clientes (counters, callable)
	utils/             # pdf, validation, pagination, browserCompat
	assets/            # Imágenes (logo, iconos)
	components/__tests__ # Pruebas iniciales
```

## 🔐 Variables de Entorno
Crear `.env` (no versionar):
```
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
REACT_APP_FIREBASE_MEASUREMENT_ID=...
```
Sugerido incluir `.env.example` para nuevos entornos.

## ▶️ Uso Rápido
```bash
npm install
npm start         # http://localhost:3000
npm test          # pruebas existentes
npm run build     # build producción
```

## 🧾 Flujo Órdenes
1. Formulario valida y sanitiza datos (`utils/validation.js`).
2. Se obtiene número secuencial (callable -> fallback transacción). Se guarda `numero` (formateado OT-00001) + `numeroSecuencial`.
3. Se almacenan firmas opcionales (base64). 
4. Tabla lista en tiempo real. Exportación PDF con: encabezado (logo), tabla, firmas horizontales, footer con paginación.

## 📦 Flujo Devoluciones
1. Captura de cantidades (con modelos si aplica). 
2. Numeración: prefijo configurable (default `ORD-`) con padding.
3. Validación (modelos obligatorios si cantidad > 0 en equipos clave).
4. Exportación PDF uniforme con cabecera/pie.

## ✍️ Firmas
- signature_pad en componente reutilizable.
- Guardado PNG base64 (optimizable a futuro a Cloud Storage). 
- Layout PDF horizontal de 3 bloques; auto salto de página si no cabe.

## 📄 PDFs (utilidades `utils/pdf.js`)
- setDocMeta, addHeader, addFooter, loadImageToBase64, defaultTableTheme.
- Compresión habilitada (`compress: true`).
- Firmas escaladas y alineadas; tablas con colores alternos.

## 🔍 Tablas
- Filtrado en memoria (cliente / número / destino / actividades).
- Paginación configurable (10 / 25 / 50 / Todos).
- Estados: cargando, error, vacío.

## 🛡️ Seguridad / Reglas
Actualmente (modo pruebas) reglas muy abiertas o semi‑abiertas para permitir creación mientras la Cloud Function no está desplegada.

Reglas temporales recomendadas (pruebas):
```javascript
rules_version = '2';
service cloud.firestore {
	match /databases/{db}/documents {
		match /{document=**} { allow read, write: if request.auth != null; }
	}
}
```

Reglas endurecidas objetivo (post‑deploy Cloud Function):
```javascript
rules_version = '2';
service cloud.firestore {
	match /databases/{db}/documents {
		function isAuthed(){return request.auth!=null;}
		match /contadores/{id} { allow read: if isAuthed(); allow write: if false; }
		match /ordenesTrabajo/{id} {
			allow read: if isAuthed();
			allow create: if isAuthed() && request.resource.data.creadoPor.uid==request.auth.uid &&
				request.resource.data.numero is string && request.resource.data.creadoEn is timestamp;
			allow update, delete: if false;
		}
		match /devolucionesMaterial/{id} {
			allow read: if isAuthed();
			allow create: if isAuthed() && request.resource.data.creadoPor.uid==request.auth.uid &&
				request.resource.data.numero_orden is string && request.resource.data.numeroSecuencial is number &&
				request.resource.data.creadoEn is timestamp;
			allow update, delete: if false;
		}
	}
}
```
Checklist para endurecer:
1. Desplegar Cloud Function `incrementCounter`.
2. Cambiar reglas de `/contadores` a `allow write: if false;`.
3. Opcional: validar formato con regex (OT-00001 / ORD-001).
4. Añadir límites de longitud y rangos numéricos.

## 🧪 Tests
Implementado: validación, formularios, tablas (filtro + paginación). 
Pendiente: pruebas PDF (mock jsPDF), ProtectedRoute, fallback de contador y errores de firma.

## 🧩 Código Destacado
- `firebase/counters.js`: abstracción numeración con callable + fallback.
- `utils/validation.js`: sanitización y validaciones.
- `utils/pdf.js`: branding PDF reutilizable.
- `components/OrdenTrabajoForm.js` y `DevolucionMaterial.js`: lógica de guardado + toasts.

## 🛠️ Mantenimiento Futuro (roadmap corto)
- Desplegar Cloud Function y cerrar escritura a `/contadores`.
- Agregar tests PDF y ProtectedRoute.
- Exportación CSV / PDF masivo.
- Cache base64 de logo (performance micro).
- Modo oscuro y accesibilidad (roles ARIA, contraste).

## ⚠️ Riesgos Temporales
| Área | Riesgo | Mitigación futura |
|------|--------|-------------------|
| Reglas abiertas | Manipulación de datos | Endurecer tras función desplegada |
| Firmas base64 en Firestore | Crecimiento tamaño documentos | Migrar a Storage y guardar URL |
| Faltan tests PDF | Regresiones silenciosas | Añadir mocks jsPDF |

## 🤝 Contribución
Rama: `feature/<descripcion>` → PR. Mensajes convencionales (feat:, fix:, refactor:, docs: ...).

## 📜 Licencia / Uso
Uso interno Hulux®. No distribuir externamente.

## 📩 Soporte
TI interno / administrador del sistema. Documenta pasos de error + consola para acelerar resolución.

---
_Documento actualizado refleja estado actual (PDF mejorado, firmas horizontales, reglas temporales) y próximos pasos para endurecer._
