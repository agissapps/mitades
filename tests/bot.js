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
  let deaths = 0;
  function walk(i, X, o = {}) {
    const b = players[i]; let stuckT = 0, t = 0, lastX = b.x;
    while (t < (o.max || 12)) {
      const dx = X - b.x; if (Math.abs(dx) < 2) break;
      const inp = { x: Math.sign(dx), y: 0, jump: false, jumpPressed: false };
      if (b.ground && Math.abs(b.x - lastX) < 0.01) { stuckT += 1 / 120; if (stuckT > 0.05) { inp.jumpPressed = inp.jump = true; stuckT = 0; } } else stuckT = 0;
      if (!b.ground && !o.noHold) inp.jump = true;
      lastX = b.x; const a = []; a[i] = inp; step1(a); t += 1 / 120; if (o.until && o.until()) break;
    }
    return b;
  }
  const wait = s => { for (let k = 0; k < s * 120; k++) step1([]); };
  function fly(i, sec, X) {
    const b = players[i];
    for (let k = 0; k < sec * 120; k++) { const dx = X === undefined ? 0 : X - b.x; const a = []; a[i] = { x: Math.abs(dx) < 2 ? 0 : Math.sign(dx), y: 0, jump: true, jumpPressed: k === 0 }; step1(a); }
  }
  // salto largo: corre hacia "to" saltando desde "from"
  function hop(i, from, to) {
    walk(i, from, { noHold: true }); const b = players[i], dir = Math.sign(to - from);
    for (let k = 0; k < 480; k++) { const a = []; a[i] = { x: dir, y: 0, jump: true, jumpPressed: k === 0 }; step1(a); if (k > 5 && b.ground) break; }
    walk(i, to, { noHold: true });
  }
  // vuelo con techo: solo aletea si la cabeza (o la de Zairene cargada) está debajo de topMin
  function flyCap(i, X, topMin = 175) {
    const b = players[i];
    for (let k = 0; k < 600; k++) {
      const top = b.y - b.h - (b.carry && b.carry.k === 'z' ? 7 : 0), dx = X - b.x;
      const a = []; a[i] = { x: Math.abs(dx) < 2 ? 0 : Math.sign(dx), y: 0, jump: top > topMin, jumpPressed: k === 0 }; step1(a);
      if (k > 10 && b.ground) break;
    }
  }
  // el Palomito vuela por encima hasta X y aterriza
  const pTo = X => { flyCap(1, X, 150); wait(0.8); walk(1, X); };
  function begin(l) { isHost = true; solo = true; myIdx = 0; players = [newBody('z'), newBody('p')]; startLevel(l); hintT = 0; }
  const small = v => { if (Z().small !== v) usePower(Z()); };
  const carryZ = () => { small(true); doPow(1); return P().carry && P().carry.k === 'z'; };
  const drop = (side = -1) => { doPow(1); wait(0.4); walk(1, P().x + side * 14); wait(0.3); };
  // subir a la meta alta: cargar a Zairene desde x0 y volar hasta x1
  const toHighGoal = (x0, x1, g) => { small(true); walk(0, x0); walk(1, x0); carryZ(); fly(1, 0.9); fly(1, 0.8, x1); wait(0.6); drop(1); walk(0, g, { until: done }); walk(1, g + 8, { until: done }); };
  const SOL = [
    () => { // 1 · La Cocina
      small(true); walk(0, TX(12)); walk(1, TX(14)); small(false);
      hop(0, TX(16) + 4, TX(20)); hop(0, TX(21) + 5, TX(26)); pTo(TX(26));
      walk(1, TX(31)); fly(1, 1.3); wait(0.8); walk(0, TX(39)); walk(1, TX(39));
      pTo(TX(50)); walk(0, TX(40)); hop(0, TX(43) + 5, TX(46)); hop(0, TX(47) + 5, TX(54)); walk(1, TX(56));
      toHighGoal(TX(60), TX(64), TX(66) + 8);
    },
    () => { // 2 · El Baño
      small(true); walk(0, TX(5)); walk(1, TX(5)); carryZ(); walk(1, TX(12) + 4); fly(1, 2.2, TX(22)); drop(1);
      walk(0, TX(30)); walk(1, TX(33)); walk(0, TX(33));
      walk(0, TX(36) + 4); walk(1, TX(36) + 4); carryZ(); flyCap(1, TX(43) + 8); flyCap(1, TX(52)); drop(1);
      walk(1, TX(54)); doPow(1); walk(1, TX(58)); fly(1, 1.2, TX(57)); wait(0.6); P().f = -1; doPow(1); wait(0.5);
      walk(1, TX(63)); walk(0, TX(63));
      small(true); walk(0, TX(69) + 4); hop(0, TX(69) + 4, TX(72)); small(false);
      walk(1, TX(78), { until: done }); walk(0, TX(79), { until: done });
    },
    () => { // 3 · La Sala
      walk(0, TX(11)); walk(1, TX(6)); doPow(1); walk(1, TX(16));
      small(true); walk(0, TX(20)); walk(1, TX(27)); P().f = 1; doPow(1); wait(0.5);
      walk(0, TX(30)); walk(1, TX(43)); walk(0, TX(36)); walk(1, TX(46)); walk(0, TX(48));
      walk(0, TX(51) + 4); walk(1, TX(51) + 4); carryZ(); fly(1, 1.6, TX(58)); wait(0.5); drop(1);
      toHighGoal(TX(64), TX(68), TX(71) + 8);
    },
    () => { // 4 · La Recámara
      small(true); walk(0, TX(6)); walk(1, TX(6)); carryZ();
      fly(1, 1.0, TX(10)); walk(1, TX(13)); fly(1, 1.0, TX(16)); walk(1, TX(20)); fly(1, 1.0, TX(23)); wait(0.3);
      doPow(1); wait(0.4); walk(1, TX(22) + 2); wait(0.4); walk(0, TX(25));
      walk(0, TX(40)); walk(1, TX(40)); small(false);
      hop(0, TX(41) + 5, TX(45)); hop(0, TX(45) + 5, TX(51)); walk(0, TX(49) + 4); pTo(TX(52)); P().f = 1; doPow(1); walk(1, TX(59)); fly(1, 1.2, TX(58)); wait(0.6); P().f = -1; doPow(1); wait(0.5);
      walk(1, TX(63)); walk(0, TX(66), { until: done }); walk(1, TX(67), { until: done });
    },
    () => { // 5 · El Jardín
      small(true); walk(0, TX(9) + 4); walk(1, TX(9) + 4); carryZ(); fly(1, 1.6, TX(18)); walk(1, TX(18)); drop(1);
      walk(1, TX(16) + 4); fly(1, 1.6, TX(7)); walk(1, TX(7)); doPow(1); walk(1, TX(9) + 4); fly(1, 1.6, TX(18)); walk(1, TX(18)); P().f = 1; doPow(1); wait(0.5);
      walk(0, TX(26)); walk(1, TX(26)); carryZ(); fly(1, 0.9, TX(27)); wait(0.6); fly(1, 0.9, TX(30)); wait(0.6); walk(1, TX(30));
      doPow(1); wait(0.4); walk(1, TX(29)); wait(0.4); walk(0, TX(36)); walk(1, TX(24)); wait(1);
      walk(0, TX(41) + 4); walk(1, TX(41) + 4); carryZ(); flyCap(1, TX(48) + 8); flyCap(1, TX(56)); drop(1);
      small(false); walk(0, TX(59)); hop(0, TX(61) + 5, TX(68)); pTo(TX(70)); walk(0, TX(70));
      toHighGoal(TX(72), TX(76), TX(79) + 8);
    },
    () => { // 6 · El Ático
      small(true); walk(0, TX(11)); walk(1, TX(6)); doPow(1); walk(1, TX(16)); walk(1, TX(18)); P().f = 1; doPow(1); wait(0.5);
      walk(0, TX(21) + 4); walk(1, TX(21) + 4); carryZ(); fly(1, 1.6, TX(29)); walk(1, TX(29)); drop(1);
      walk(1, TX(33)); fly(1, 1.2); wait(1); walk(0, TX(39)); walk(1, TX(39));
      walk(1, TX(49)); walk(0, TX(44)); walk(1, TX(52)); walk(0, TX(54));
      walk(0, TX(57) + 4); walk(1, TX(57) + 4); carryZ(); fly(1, 1.6, TX(64)); wait(0.5); drop(1);
      walk(0, TX(66) + 4); walk(1, TX(66) + 4); carryZ(); flyCap(1, TX(73) + 8); flyCap(1, TX(81)); drop(1);
      toHighGoal(TX(82), TX(86), TX(89) + 8);
    },
  ];
  const NEG = {
    'P solo no pasa la puerta del nivel 1': () => { begin(0); walk(1, TX(14), { max: 4 }); return P().x < TX(10); },
    'Z sola no salta la tina del nivel 2': () => { begin(1); walk(0, TX(12) + 4); for (let k = 0; k < 240; k++) step1([{ x: 1, jump: true, jumpPressed: k === 0 }]); wait(1); return Z().x < TX(13); },
    'Z grande no cabe por la ratonera': () => { begin(0); walk(0, TX(12), { max: 4 }); return Z().x < TX(10); },
    'Z no crece bajo la ratonera': () => { begin(0); usePower(Z()); walk(0, TX(10)); usePower(Z()); return Z().small === true; },
    'Z chiquita no salta 3 picos': () => { begin(0); small(true); walk(0, TX(12)); walk(1, TX(14)); hop(0, TX(21) + 5, TX(26)); return Z().x < TX(22); },
    'Z sola no sube a la meta alta': () => { begin(0); for (let k = 0; k < 120; k++) step1([{ x: 0, jump: true, jumpPressed: k === 0 }]); return Z().y > 200; },
    'volar alto bajo el techo pica': () => { begin(1); let n = 0; const R0 = respawn; respawn = b => { n++; R0(b); }; P().x = TX(43) + 8; P().y = 208; fly(1, 1.5); respawn = R0; return n > 0; },
  };
  window.runAll = () => {
    const out = [];
    SOL.forEach((f, i) => { begin(i); f(); out.push(`Nivel ${i + 1}: ${phase === 'clear' ? 'OK' : 'FALLA (' + phase + ') Z=' + Z().x.toFixed(0) + ',' + Z().y.toFixed(0) + ' P=' + P().x.toFixed(0) + ',' + P().y.toFixed(0)}`); });
    for (const k in NEG) out.push(k + ': ' + (NEG[k]() ? 'OK' : 'FALLA'));
    return out;
  };
  Object.assign(window, { step1, walk, wait, fly, hop, flyCap, begin, TX, Z, P, small, carryZ, drop, toHighGoal, SOL, pTo });
})();
