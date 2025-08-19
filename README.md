<div align="center">
	<h1>SGI-HULUX ®</h1>
	<p><strong>Sistema de Gestión Integral para Órdenes de Trabajo y Devolución de Materiales</strong></p>
	<p>React + Firebase (Auth & Firestore) · Firmas digitales · PDF dinámicos · Control administrativo</p>
</div>

---

## 🚀 Descripción
SGI-HULUX es una aplicación web interna para gestionar:
- Órdenes de trabajo externas/internas con numeración automática
- Devolución de materiales con control detallado y modelos
- Firmas digitales en canvas (reviso / autorizo / solicito)
- Generación de reportes PDF (jsPDF + autotable)
- Control de acceso (usuarios vs administrador)

## 🧱 Tecnologías Principales
- React 18 (Create React App)
- React Router v6
- Firebase (Auth + Firestore + Realtime counters vía transacciones)
- jsPDF & jspdf-autotable
- signature_pad (captura de firmas)
- Bootstrap 5 (desde npm, no CDN)

## 📂 Estructura Principal
```
src/
	components/    # Componentes reutilizables y funcionales principales
	pages/         # Wrappers de página para enrutado
	firebase/      # Configuración de Firebase (usa .env)
	utils/         # Utilidades (compatibilidad navegador, polyfills)
	assets/        # Imágenes / logos
```

## 🔐 Variables de Entorno (.env)
Crea un archivo `.env` (NO subir a git) basado en `.env.example`:
```
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
REACT_APP_FIREBASE_MEASUREMENT_ID=...
```

## ▶️ Instalación y Ejecución
```bash
npm install
npm start       # Desarrollo (http://localhost:3000)
npm run build   # Producción
```

## 👥 Roles y Acceso
- Usuario autenticado: acceso a Devoluciones y Órdenes.
- Administrador (email: `admin@hulux.com`): acceso adicional a Panel con todas las tablas.
- Rutas protegidas mediante `ProtectedRoute` + verificación en tiempo real.

## 🧾 Flujo: Órdenes de Trabajo
1. Usuario completa formulario (actividades, materiales, recursos).
2. Se genera número único vía transacción Firestore (`contadores/ordenesTrabajo`).
3. Se pueden capturar firmas (canvas -> dataURL base64).
4. Registro persistido junto con metadatos del usuario creador.
5. Exportación a PDF desde la tabla administrativa.

## 📦 Flujo: Devolución de Material
1. Captura de cantidades + modelos condicionales.
2. Numeración: `contadores/devolucionesMaterial` (transacción).
3. Asociación de usuario creador.
4. Exportación individual a PDF desde tabla.

## ✍️ Firmas Digitales
- Implementadas con `signature_pad`.
- Limpieza y resize seguro (manejo de retina + desmontaje defensivo).
- Guardadas como dataURL (PNG base64) en Firestore dentro de `firmas`.

## 📄 PDFs
- Generación dinámica con jsPDF.
- Tablas autoTable con datos limpiezos y formateados.
- Inclusión de firmas (al convertir dataURL / imagen base64).

## ♻️ Compatibilidad Navegadores
- Polyfills y utilidades en `utils/browserCompat.js`.
- Prefijos CSS y fallbacks (`browser-compatibility.css`).
- Manejo de clases dinámicas por soporte de features.

## 🛡️ Seguridad / Buenas Prácticas
- Credenciales Firebase solo vía `.env`.
- Validación de email admin en cliente (para mayor seguridad agregar reglas Firestore).
- Transacciones para garantizar numeración única (evita colisiones).
- ErrorBoundary captura fallos de render (mejora UX en errores críticos).

## 🗄️ Reglas Firestore (Sugerencia Inicial)
Configura reglas (ejemplo base, ajusta a tus necesidades):
```javascript
rules_version = '2';
service cloud.firestore {
	match /databases/{database}/documents {
		function isSignedIn() { return request.auth != null; }
		function isAdmin() { return request.auth.token.email == 'root@hulux.com'; }

		match /ordenesTrabajo/{docId} {
			allow read, create: if isSignedIn();
			allow update, delete: if isAdmin();
		}
		match /devolucionesMaterial/{docId} {
			allow read, create: if isSignedIn();
			allow update, delete: if isAdmin();
		}
		match /contadores/{docId} {
			allow read: if isSignedIn();
			allow write: if isSignedIn(); // restringir a cloud functions si escalas
		}
	}
}
```

## 🧪 Tests (Pendiente de Implementar)
Ideas:
- Unit tests para utilidades (browserCompat)
- Tests de componentes críticos (Login, ProtectedRoute)
- Snapshot de tablas

## 🛠️ Scripts Disponibles
```bash
npm start        # Modo desarrollo
npm run build    # Compilación producción
npm test         # (Agregar pruebas futuras)
```

## 📈 Futuras Mejoras Sugeridas
- Exportación masiva de PDFs (zip)
- Filtro / búsqueda avanzada en tablas
- Paginación / carga perezosa
- Integrar almacenamiento de firmas en Cloud Storage
- Validación adicional servidor (Cloud Functions)
- Dark mode / tema configurable
- Auditoría de cambios (logs historial)

## 🤝 Contribución
1. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
2. Commit descriptivo: `git commit -m "feat: agregar filtro en tabla de órdenes"`
3. Push y PR

## 📜 Licencia
Proyecto interno Hulux ®. Uso restringido. No distribuir sin autorización.

## 📩 Soporte
Para incidencias internas contactar al administrador del sistema / TI.

---
_Generado y documentado para facilitar mantenimiento y escalabilidad._
