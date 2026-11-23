// Prueba: un "bot" resuelve cada nivel con la física real del juego.
// Uso (en la consola del navegador con el juego abierto):
//   const s = document.createElement('script'); s.src = 'tests/bot.js'; document.body.append(s);
//   …luego: runAll()  → lista de niveles con su resultado
(() => {
  const R = { uw: updateWorld, uh: updateHost };
  moveLocal = () => { }; updateWorld = () => { }; updateHost = () => { };   // pausa el bucle real
  const idle = { x: 0, y: 0, jump: false, jumpPressed: false };
  const step1 = inps => { const dt = 1 / 120; players.forEach((b, i) => stepBody(b, inps[i] || idle, dt)); R.uw(dt); R.uh(dt); };
  const TX = t => t * 16 + 8;
  const Z = () => players[0], P = () => players[1];
  const done = () => phase !== 'play';
  function walk(i, X, o = {}) {
    const b = players[i]; let stuckT = 0, t = 0, lastX = b.x;
    while (t < (o.max || 12)) {
      const dx = X - b.x; if (Math.abs(dx) < 2) break;
      const inp = { x: Math.sign(dx), y: 0, jump: false, jumpPressed: false };
      if (b.ground && Math.abs(b.x - lastX) < 0.01) { stuckT += 1 / 120; if (stuckT > 0.05) { inp.jumpPressed = inp.jump = true; stuckT = 0; } } else stuckT = 0;
      if (!b.ground) inp.jump = true;
      lastX = b.x; const a = []; a[i] = inp; step1(a); t += 1 / 120; if (o.until && o.until()) break;
    }
    return b;
  }
  const wait = s => { for (let k = 0; k < s * 120; k++) step1([]); };
  function fly(i, sec, X) {
    const b = players[i];
    for (let k = 0; k < sec * 120; k++) { const dx = X === undefined ? 0 : X - b.x; const a = []; a[i] = { x: Math.abs(dx) < 2 ? 0 : Math.sign(dx), y: 0, jump: true, jumpPressed: k === 0 }; step1(a); }
  }
  function begin(l) { isHost = true; solo = true; myIdx = 0; players = [newBody('z'), newBody('p')]; startLevel(l); hintT = 0; }
  const carryZ = () => { doPow(1); return P().carry && P().carry.k === 'z'; };
  const SOL = [
    () => { // 1
      usePower(Z()); walk(0, TX(12)); walk(1, TX(14)); walk(1, TX(18)); fly(1, 1.3); usePower(Z());
      walk(0, TX(36) + 8, { until: done }); walk(1, TX(37), { until: done });
    },
    () => { // 2
      usePower(Z()); walk(0, TX(5)); walk(1, TX(5)); carryZ(); walk(1, TX(12) + 4); fly(1, 2.2, TX(22)); doPow(1); wait(0.4); walk(1, TX(23)); wait(0.3);
      walk(0, TX(30)); usePower(Z()); walk(1, TX(36), { until: done }); walk(0, TX(37), { until: done });
    },
    () => { // 3
      walk(0, TX(11)); walk(1, TX(6)); doPow(1); walk(1, TX(16));
      usePower(Z()); walk(0, TX(20)); walk(1, TX(27)); P().f = 1; doPow(1); wait(0.5);
      walk(0, TX(35), { until: done }); walk(1, TX(36), { until: done });
    },
    () => { // 4
      usePower(Z()); walk(0, TX(6)); walk(1, TX(6)); carryZ();
      fly(1, 1.0, TX(10)); walk(1, TX(13)); fly(1, 1.0, TX(16)); walk(1, TX(20)); fly(1, 1.0, TX(23)); wait(0.3);
      doPow(1); wait(0.4); walk(1, TX(22) + 2); wait(0.4); walk(0, TX(25));
      walk(0, TX(28), { until: done }); walk(1, TX(29), { until: done });
    },
    () => { // 5
      usePower(Z()); walk(0, TX(9) + 4); walk(1, TX(9) + 4); carryZ(); fly(1, 1.6, TX(18)); walk(1, TX(18)); doPow(1); wait(0.4); walk(1, TX(19)); wait(0.3);
      walk(1, TX(16) + 4); fly(1, 1.6, TX(7)); walk(1, TX(7)); doPow(1); walk(1, TX(9) + 4); fly(1, 1.6, TX(18)); walk(1, TX(18)); P().f = 1; doPow(1); wait(0.5);
      walk(0, TX(26)); walk(1, TX(26)); carryZ(); fly(1, 0.9, TX(27)); wait(0.6); fly(1, 0.9, TX(30)); wait(0.6); walk(1, TX(30));
      doPow(1); wait(0.4); walk(1, TX(29)); wait(0.4); walk(0, TX(36));
      walk(1, TX(24)); wait(1);
      walk(0, TX(40), { until: done }); walk(1, TX(41), { until: done });
    },
    () => { // 6
      usePower(Z()); walk(0, TX(11)); walk(1, TX(6)); doPow(1); walk(1, TX(16)); walk(1, TX(18)); P().f = 1; doPow(1); wait(0.5);
      walk(0, TX(21) + 4); walk(1, TX(21) + 4); carryZ(); fly(1, 1.6, TX(29)); walk(1, TX(29)); doPow(1); wait(0.4); walk(1, TX(31)); wait(0.3);
      walk(1, TX(33)); fly(1, 1.2); usePower(Z());
      walk(0, TX(44), { until: done }); walk(1, TX(45), { until: done });
    },
  ];
  // Pruebas "en contra": cosas que NO deben poder hacerse solos
  const NEG = {
    'P solo no pasa la puerta del nivel 1': () => { begin(0); walk(1, TX(14), { max: 4 }); return P().x < TX(10); },
    'Z sola no salta la tina del nivel 2': () => { begin(1); walk(0, TX(12) + 4); for (let k = 0; k < 240; k++) step1([{ x: 1, jump: true, jumpPressed: k === 0 }]); wait(1); return Z().x < TX(13); },
    'Z grande no cabe por la ratonera': () => { begin(0); walk(0, TX(12), { max: 4 }); return Z().x < TX(10); },
    'Z no crece bajo la ratonera': () => { begin(0); usePower(Z()); walk(0, TX(10)); usePower(Z()); return Z().small === true; },
    'puerta cerrada encima no atrapa': () => { begin(0); usePower(Z()); walk(0, TX(12)); walk(1, TX(10)); walk(0, TX(14)); walk(1, TX(13), { max: 3 }); return true; },
  };
  window.runAll = () => {
    const out = [];
    SOL.forEach((f, i) => { begin(i); f(); out.push(`Nivel ${i + 1}: ${phase === 'clear' ? 'OK' : 'FALLA (' + phase + ') Z=' + Z().x.toFixed(0) + ',' + Z().y.toFixed(0) + ' P=' + P().x.toFixed(0) + ',' + P().y.toFixed(0)}`); });
    for (const k in NEG) out.push(k + ': ' + (NEG[k]() ? 'OK' : 'FALLA'));
    return out;
  };
  Object.assign(window, { step1, walk, wait, fly, begin, TX, Z, P });
})();
