## Reglas de Seguridad Propuestas para Firestore

Despliega copiando el bloque en tu archivo firestore.rules y ejecuta:

firebase deploy --only firestore:rules

### Objetivos
1. Solo usuarios autenticados crean documentos.
2. Campos de auditoría y numeración no pueden ser manipulados por el cliente.
3. Contadores controlados (monotónicos) y preparación para migrar a Cloud Functions.

### Reglas ejemplo
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthed() { return request.auth != null; }
    function isServer() { return false; } // Reemplazar cuando uses Cloud Functions con custom claims

    match /contadores/{docId} {
      allow read: if isAuthed();
      allow create: if isAuthed() && request.resource.data.keys().hasOnly(['ultimo','creadoEn','actualizadoEn']) && request.resource.data.ultimo == 1;
      allow update: if isAuthed() &&
        request.resource.data.diff(resource.data).changedKeys().hasOnly(['ultimo','actualizadoEn']) &&
        request.resource.data.ultimo is int && request.resource.data.ultimo == resource.data.ultimo + 1;
    }

    match /ordenesTrabajo/{docId} {
      allow read: if isAuthed();
      allow create: if isAuthed() &&
        !('creadoEn' in request.resource.data) && !('numero' in request.resource.data) &&
        request.resource.data.creadoPor.uid == request.auth.uid;
      allow update, delete: if false;
    }

    match /devolucionesMaterial/{docId} {
      allow read: if isAuthed();
      allow create: if isAuthed() &&
        !('creadoEn' in request.resource.data) && !('numeroSecuencial' in request.resource.data) && !('numero_orden' in request.resource.data) &&
        request.resource.data.creadoPor.uid == request.auth.uid;
      allow update, delete: if false;
    }
  }
}
```

### Próximos pasos
1. Migrar incrementos a Cloud Function y cerrar escritura en /contadores.
2. Añadir custom claims para roles (admin, auditor, etc.).
3. Tests de reglas con emulador: firebase emulators:start --only firestore.

### Nota
Hasta mover la lógica a Cloud Functions, un cliente podría incrementar contadores legítimamente (monótonos). Prioriza esa migración cuanto antes.

### Después de desplegar la Cloud Function incrementCounter

Actualiza la sección de /contadores en tus reglas a:

```
match /contadores/{docId} {
  allow read: if isAuthed();
  allow write: if request.auth.token.server == true; // asigna custom claim desde backend si lo requieres
}
```

Opcionalmente puedes conservar la validación monotónica durante la transición y luego endurecer.

### Versión Final Endurecida (solo Cloud Function escribe contadores)

Si ya migraste totalmente los incrementos a la Cloud Function y no quieres ninguna escritura de clientes en `/contadores`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthed() { return request.auth != null; }

    match /contadores/{docId} {
      allow read: if isAuthed();
      allow write: if false; // Solo Admin SDK (Cloud Functions) puede escribir
    }

    match /ordenesTrabajo/{docId} {
      allow read: if isAuthed();
      allow create: if isAuthed() &&
        !('creadoEn' in request.resource.data) && !('numero' in request.resource.data) &&
        request.resource.data.creadoPor.uid == request.auth.uid;
      allow update, delete: if false;
    }

    match /devolucionesMaterial/{docId} {
      allow read: if isAuthed();
      allow create: if isAuthed() &&
        !('creadoEn' in request.resource.data) && !('numeroSecuencial' in request.resource.data) && !('numero_orden' in request.resource.data) &&
        request.resource.data.creadoPor.uid == request.auth.uid;
      allow update, delete: if false;
    }
  }
}
```

### Sobre Custom Claims (Opcional)

NO es obligatorio para la Cloud Function `incrementCounter` ya que el Admin SDK ignora las reglas. Usa un custom claim (por ejemplo `server: true`) solo si quieres permitir a ciertos clientes privilegiados (p.e. una herramienta interna) escribir directamente.

Pasos resumidos para asignar claim:
1. Ejecuta un script Node con Admin SDK (ver `scripts/setServerClaim.js`).
2. Verifica con `firebase auth:export` o en consola que el usuario posee el claim.
3. Ajusta reglas a:
```
match /contadores/{docId} {
  allow read: if isAuthed();
  allow write: if request.auth.token.server == true; // solo usuarios con claim
}
```

Recomendación: En producción permanece con `allow write: if false;` y usa únicamente la Cloud Function.

