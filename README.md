# 💞 Mitades · Zairene y el Palomito

Puzzles cooperativos en pixel art para **2 jugadores en línea**, para teléfono o laptop. Solos no se puede: ¡hay que ayudarse!

## Los poderes
- **Zairene** se hace **chiquita** (PODER): cabe por las ratoneras y el Palomito la puede cargar.
- **El Palomito** **vuela** (mantén SALTAR en el aire) y **carga** (PODER) cajas o a Zairene chiquita.

## Mundo 1 · La Casa
1. 🍳 La Cocina · 2. 🛁 El Baño · 3. 🛋️ La Sala · 🏎️ **Gran Premio de la Sala** · 4. 🛏️ La Recámara · 5. 🌻 El Jardín · 6. 🏚️ El Ático

**v2:** niveles el doble de largos y más difíciles: **picos** (en el piso y en el techo, ¡vuela bajito!), **interruptores con reloj** que abren una puerta solo 5 segundos, closets, cajas sobre repisas y metas en lo alto (el Palomito tiene que subir a Zairene).

Después del nivel 3 hay una carrera de carritos entre los dos (5 vueltas, turbos y charcos de jugo). Después queda en el menú como **Carreras**.

## Cómo jugar juntos
1. Uno toca **Crear sala** y envía el código o el enlace 💌.
2. La otra persona abre el enlace (o escribe el código) y toca **Unirse**.
3. El anfitrión elige el nivel y toca **¡A jugar!**

**Practicar solo:** controlas a los dos y cambias con TAB o el botón ⇄.

## Controles
- **Laptop:** flechas/WASD mover · ESPACIO o ↑ saltar (mantener = volar) · E poder · TAB cambiar
- **Teléfono:** palanca · ⬆ saltar · ✨ poder (mejor en horizontal)
- **Carrera:** la palanca apunta hacia dónde ir (o ← →) · ESPACIO / FRENO para derrapar

## Descargarlo (PWA)
- **Android / Chrome / Edge:** en el menú toca **Descargar el juego 📲**.
- **iPhone:** Safari → Compartir ⬆️ → «Agregar a inicio».

## Pruebas
`tests/bot.js` resuelve los 6 niveles con la física real y revisa que no se puedan pasar solos. Abre el juego, y en la consola:
```js
const s = document.createElement('script'); s.src = 'tests/bot.js'; document.body.append(s);
// cuando cargue:
runAll()
```

Hecho con HTML5 Canvas y [PeerJS](https://peerjs.com/) (conexión directa WebRTC, sin servidor propio).
