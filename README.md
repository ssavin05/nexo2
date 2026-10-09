# Nexo V37 — Experiencia guiada estable

## Novedades
- Selección múltiple actualiza las tarjetas en el lugar, sin reconstruir toda la pantalla.
- Elegir el giro cambia el estado de la tarjeta sin volver a renderizar la página.
- Guarda automáticamente el borrador del asistente en el navegador.
- Ofrece continuar una configuración sin terminar al volver a crear una empresa.
- Conserva las preguntas por giro y la vista previa adaptativa de V36.
- Evita envíos accidentales de formularios desde botones con acciones JavaScript.
- Añade transiciones suaves y estados de foco accesibles.

## Probar
1. Descomprime el ZIP completo en una carpeta nueva.
2. Abre `index.html`.
3. Pulsa Crear empresa y prueba varios giros.
4. En preguntas con selección múltiple, marca y desmarca opciones: no debería parpadear toda la pantalla.
5. Avanza algunas preguntas, cierra y vuelve a abrir el flujo; si el borrador existe, Nexo ofrecerá continuar.

## Límites
Es un prototipo local: el borrador se guarda en `localStorage` de ese navegador. No sincroniza el progreso entre dispositivos ni reemplaza un backend autenticado.
