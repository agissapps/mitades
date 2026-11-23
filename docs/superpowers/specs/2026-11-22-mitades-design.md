# Mitades · Zairene y el Palomito — diseño

## Para qué
Juego de puzzles cooperativo para 2 en línea (teléfono o laptop), para que Zairene y el Palomito jueguen juntos. Solo se avanza ayudándose. Hermano de Cocina Caótica: mismo estilo pixel art, misma conexión y misma forma de instalarlo.

## Metas
- Plataformas de vista lateral. Cada quien tiene un poder:
  - **Zairene se encoge** (tecla E / botón): cabe por ratoneras de 1 bloque, no puede empujar cajas, salta menos.
  - **El Palomito vuela** (mantener saltar en el aire = aleteo con energía limitada que se recarga al tocar el piso) y **carga** (E: levanta o suelta una caja o a Zairene chiquita).
- Mundo 1 "La Casa": 6 niveles cortos + 1 carrera después del nivel 3.
- Carrera "Gran Premio de la Sala": vista desde arriba, 3 vueltas, turbos y charcos de jugo, el carro acelera solo, palanca para girar y botón de freno. Después queda en el menú como "Carreras".
- Sin vidas ni tiempo: quien cae al vacío o a un peligro reaparece en el último punto de control.
- Modo práctica: un jugador controla a los dos y cambia con TAB / botón ⇄.
- Descargable (PWA) y con el progreso guardado en el dispositivo (los niveles desbloqueados).

## No metas
- Más mundos (vendrán después), editor de niveles, más de 2 jugadores, música compleja.

## Anti-metas
- Que se pueda pasar un nivel sin la ayuda del otro.
- Que se sienta lento o con retraso en conexiones regulares.

## Enfoques considerados
1. **Anfitrión con autoridad (elegido)** — como Cocina Caótica: cada quien mueve su personaje localmente y manda su posición; el anfitrión simula cajas, botones, puertas y carrera y manda el estado. Probado, reconexión ya resuelta.
2. Simulación determinista en los dos lados — menos datos, pero se desincroniza con facilidad.
3. Servidor propio — no hay servidor; descartado.

## Decisiones técnicas (mías)
- HTML5 Canvas + PeerJS 1.5.4 desde unpkg, sin compilación; archivos: index.html, game.js, sw.js, manifest, íconos.
- Mapas de texto por nivel (bloques de 16 px, pantalla de 30×17 bloques con cámara si el nivel es más ancho).
- Prefijo de sala propio (`mitades-zyp-`) para no chocar con la cocina.
- Carrera: pista definida por una lista de puntos (línea central + ancho), el anfitrión cuenta vueltas.
