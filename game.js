// Mitades · Zairene y el Palomito
// Plataformas cooperativas para 2 en línea (WebRTC con PeerJS) + una carrera.
'use strict';
const VERSION = 'v1 · 22 nov';   // cambia en cada actualización
const $ = id => document.getElementById(id);
$('ver').textContent = VERSION;

/* ======================= CONSTANTES ======================= */
const T = 16, ROWS = 17, VW = 480, VH = 272;
const GRAV = 900, JUMP = 310, JUMP_S = 230, SPD = 90, SPD_S = 70, MAXFALL = 420;
const FLAP_V = -90, FLAP_E = 0.75, FLAP_E_CARRY = 0.6;
const ROOM_PREFIX = 'mitades-zyp-';
const CH_COL = ['', '#ff7eb6', '#5b8cff', '#ffc93c'];
const RACE = 6, LAPS = 3;

/* ======================= NIVELES ======================= */
// # pared · . aire · = repisa (se atraviesa desde abajo) · m ratonera (solo Zairene chiquita)
// ~ agua · k banderita · Z P inicio · x caja · G meta (corazón)
// a b c botón del piso (canal 1 2 3) · u v w interruptor de pared (canal 1 2 3) · 1 2 3 puertas
function build(w, f) {
  const g = [];
  for (let y = 0; y < ROWS; y++) { const r = []; for (let x = 0; x < w; x++) r.push(y === 0 || y === ROWS - 1 || x === 0 || x === w - 1 ? '#' : '.'); g.push(r); }
  f({ set: (x, y, c) => { g[y][x] = c; }, fill: (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = c; } });
  return g.map(r => r.join(''));
}
const goal = (s, x, y) => s.fill(x, y - 1, x + 1, y, 'G');
const LEVELS = [
  {
    n: 'La Cocina', e: '🍳', wall: ['#f7c8a8', '#f0b894'], blk: ['#9a5a3a', '#c9875c', '#6e3a22'],
    hint: 'Zairene: toca PODER para hacerte chiquita y pasa por la ratonera. Pisa el botón rosa para abrirle al Palomito. Palomito: vuela (mantén SALTAR) al interruptor azul.',
    map: build(40, s => {
      s.set(2, 15, 'Z'); s.set(4, 15, 'P');
      s.fill(10, 1, 10, 12, '#'); s.fill(10, 13, 10, 14, '1'); s.set(10, 15, 'm');
      s.set(12, 15, 'a'); s.set(14, 15, 'k');
      s.fill(17, 10, 19, 10, '='); s.set(18, 9, 'v');
      s.fill(22, 1, 22, 12, '#'); s.fill(22, 13, 22, 15, '2');
      s.set(25, 15, 'k'); s.fill(30, 13, 32, 13, '='); goal(s, 36, 15);
    }),
  },
  {
    n: 'El Baño', e: '🛁', wall: ['#bfe6ef', '#a9d8e4'], blk: ['#e8eef5', '#ffffff', '#9fb2c8'],
    hint: 'La tina es muy ancha para saltar. Zairene: hazte chiquita. Palomito: acércate y usa PODER para cargarla, y vuela con ella al otro lado.',
    map: build(40, s => {
      s.fill(1, 12, 12, 15, '#'); s.set(2, 11, 'Z'); s.set(4, 11, 'P'); s.set(7, 11, 'k');
      s.fill(13, 16, 18, 16, '~');
      s.set(21, 15, 'k');
      s.fill(27, 1, 27, 12, '#'); s.fill(27, 13, 27, 14, '1'); s.set(27, 15, 'm');
      s.set(30, 15, 'u'); goal(s, 36, 15);
    }),
  },
  {
    n: 'La Sala', e: '🛋️', wall: ['#d9c8f0', '#c9b5e6'], blk: ['#7a5a3a', '#a8805a', '#4e3622'],
    hint: 'Zairene pisa el botón rosa y el Palomito pasa la caja por la puerta. Luego Zairene se mete al closet a pisar el botón azul… ¡y la caja la puede sustituir!',
    map: build(40, s => {
      s.set(2, 15, 'Z'); s.set(4, 15, 'P'); s.set(6, 15, 'x');
      s.set(11, 15, 'a');
      s.fill(14, 1, 14, 12, '#'); s.fill(14, 13, 14, 14, '1'); s.set(14, 15, 'm');
      s.set(16, 15, 'k');
      s.fill(18, 12, 22, 12, '#'); s.fill(18, 13, 18, 14, '#'); s.set(18, 15, 'm'); s.fill(22, 13, 22, 14, '#'); s.set(22, 15, 'm'); s.set(20, 15, 'b');
      s.fill(26, 1, 26, 12, '#'); s.fill(26, 13, 26, 15, '2');
      s.set(28, 15, 'b'); s.set(30, 15, 'k'); goal(s, 35, 15);
    }),
  },
  {
    n: 'La Recámara', e: '🛏️', wall: ['#f3d6e6', '#eac3d8'], blk: ['#8a4a6a', '#b8708f', '#5a2a44'],
    hint: '¡Hay que subir hasta arriba! El Palomito carga a Zairene chiquita de repisa en repisa. Arriba, Zairene abre la puerta por la ratonera.',
    map: build(32, s => {
      s.set(2, 15, 'Z'); s.set(4, 15, 'P');
      s.fill(15, 16, 30, 16, '~');
      s.fill(8, 11, 13, 11, '='); s.set(12, 10, 'k');
      s.fill(15, 7, 20, 7, '='); s.set(18, 6, 'k');
      s.fill(22, 3, 30, 3, '#');
      s.set(24, 1, '1'); s.set(24, 2, 'm'); s.set(25, 2, 'u');
      s.fill(28, 1, 29, 2, 'G');
    }),
  },
  {
    n: 'El Jardín', e: '🌻', wall: ['#bde3f7', '#a9d6f0'], blk: ['#5a8a3a', '#7cb84e', '#3a5a24'],
    hint: 'Crucen el estanque (¡el Palomito carga a Zairene!) y lleven la caja al botón. Arriba hay una ratonera que lleva al interruptor amarillo.',
    map: build(44, s => {
      s.set(2, 15, 'Z'); s.set(4, 15, 'P'); s.set(7, 15, 'x');
      s.fill(10, 16, 15, 16, '~');
      s.set(17, 15, 'k'); s.set(19, 15, 'a');
      s.fill(22, 1, 22, 12, '#'); s.fill(22, 13, 22, 15, '1');
      s.set(25, 15, 'a'); s.set(27, 15, 'k');
      s.fill(26, 12, 27, 12, '='); s.fill(29, 9, 31, 9, '=');
      s.fill(32, 1, 32, 12, '#'); s.set(32, 8, 'm'); s.fill(32, 13, 32, 15, '3');
      s.fill(33, 9, 36, 9, '='); s.set(36, 8, 'w');
      s.set(35, 15, 'k'); goal(s, 40, 15);
    }),
  },
  {
    n: 'El Ático', e: '🏚️', wall: ['#c8b8a0', '#b8a68c'], blk: ['#6a5040', '#907060', '#40302a'],
    hint: 'El gran final: closet con botón, caja, tina y un interruptor muy alto. ¡Ustedes pueden!',
    map: build(48, s => {
      s.set(2, 15, 'Z'); s.set(4, 15, 'P'); s.set(6, 15, 'x');
      s.fill(9, 12, 13, 12, '#'); s.fill(9, 13, 9, 14, '#'); s.set(9, 15, 'm'); s.fill(13, 13, 13, 14, '#'); s.set(13, 15, 'm'); s.set(11, 15, 'a');
      s.set(15, 15, 'k');
      s.fill(17, 1, 17, 12, '#'); s.fill(17, 13, 17, 15, '1');
      s.set(19, 15, 'a'); s.set(20, 15, 'k');
      s.fill(22, 16, 27, 16, '~');
      s.set(29, 15, 'k'); s.set(33, 8, 'w');
      s.fill(37, 1, 37, 12, '#'); s.fill(37, 13, 37, 15, '3');
      s.set(39, 15, 'k'); goal(s, 44, 15);
    }),
  },
];

/* ======================= SPRITES ======================= */
const SP = {};
function mk(name, rows, pal) {
  const c = document.createElement('canvas'); c.width = rows[0].length; c.height = rows.length;
  const x = c.getContext('2d');
  rows.forEach((r, j) => [...r].forEach((ch, i) => { if (pal[ch]) { x.fillStyle = pal[ch]; x.fillRect(i, j, 1, 1); } }));
  SP[name] = c;
}
mk('z', ['....hhhh....', '...hhhhhh...', '..hhhhhhhh..', '..hhsssshh..', '.hhsksskshh.', '.hhsssssshh.', '.hhrssssrhh.', '.hhhsssshhh.',
  '..hhpppphh..', '..pppppppp..', '.spppwwppps.', '..pppppppp..', '..PPPPPPPP..', '...ss..ss...', '...ss..ss...', '...bb..bb...'],
  { h: '#5a3220', s: '#ffcfa8', k: '#2a1a22', r: '#ff9aa8', p: '#ff7eb6', P: '#c4467f', w: '#fff8f0', b: '#6b3d22' });
mk('p', ['............', '...nnnnnn...', '..nnnnnnnn..', '..nnnnnnnn..', '..nssssssn..', '..skssssks..', '..ssssssss..', '..ssnnnnss..',
  '...ssssss...', '.uuuuwwuuuu.', '.uuuuwwuuuu.', '.suuuuuuuus.', '..uuuuuuuu..', '..UUUUUUUU..', '...UU..UU...', '...bb..bb...'],
  { n: '#231a1a', s: '#f2b88f', k: '#2a1a22', u: '#5b8cff', U: '#3352b8', w: '#fff8f0', b: '#6b3d22' });
mk('wingU', ['..wwww', '.wwwww', 'wwwwg.', 'wwg...', 'w.....'], { w: '#ffffff', g: '#c9c2d6' });
mk('wingD', ['w.....', 'wwg...', 'wwwwg.', '.wwwww', '..wwww'], { w: '#ffffff', g: '#c9c2d6' });
mk('box', ['oooooooooooo', 'oyyyyyyyyyyo', 'oyOOOOOOOOyo', 'oyOyyyyyyOyo', 'oyOyysyyyOyo', 'oyOysssyyOyo', 'oyOyysyyyOyo', 'oyOyyyyyyOyo', 'oyOOOOOOOOyo', 'oyyyyyyyyyyo', 'oyyyyyyyyyyo', 'oooooooooooo'],
  { o: '#5a3418', y: '#e0a050', O: '#b8732e', s: '#fff2b3' });
mk('heart', ['.rr.rr.', 'rrrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...'], { r: '#ff4f8b' });

/* ======================= ESTADO ======================= */
const cv = $('game');
const ctx = cv.getContext('2d');
let S = 1;
let isHost = true, solo = false, myIdx = 0, myChar = 'z';
let peer = null, conn = null;
let phase = 'menu';          // menu | lobby | play | clear | race | end
let lv = 0, MAP = LEVELS[0].map, LW = MAP[0].length;
let players = [], boxes = [], chn = [false, false, false, false], swOn = {}, effects = [], sndQ = [];
let plates = [], switches = [], spawn = {};
let roundId = 0, seenRound = -1, clearT = 0, story = false, hintT = 0, endInfo = null;
let up = 0;                  // nivel más alto desbloqueado
try { up = Math.min(5, +localStorage.getItem('mitades-up') || 0); } catch (e) { }
function saveUp(n) { if (n > up) { up = Math.min(5, n); try { localStorage.setItem('mitades-up', up); } catch (e) { } refreshLevelUI(); } }

function newBody(ch) {
  return { ch, x: 0, y: 0, vx: 0, vy: 0, w: 9, h: 14, small: false, f: 1, ground: false, flapE: FLAP_E, fl: false, mv: false, carry: null, cp: null, dx: 0, dy: 0, coyote: 0, car: null };
}

/* ======================= SONIDO ======================= */
let AC = null;
function ensureAudio() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } }
  if (AC && AC.state === 'suspended') AC.resume();
}
function tone(f, d, type = 'square', v = 0.05, slide = 0, delay = 0) {
  if (!AC) return;
  const t = AC.currentTime + delay, o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g).connect(AC.destination); o.start(t); o.stop(t + d + 0.02);
}
const SFX = {
  jump: () => tone(440, .12, 'square', .04, 300), flap: () => tone(700, .05, 'triangle', .03, -200),
  small: () => tone(900, .18, 'square', .04, 700), big: () => tone(500, .18, 'square', .04, -300),
  pick: () => tone(660, .07), drop: () => tone(440, .07), no: () => tone(160, .15, 'sawtooth', .04),
  splash: () => tone(260, .3, 'triangle', .08, -180), door: () => { tone(330, .1, 'square', .04); tone(495, .12, 'square', .04, 0, .08); },
  sw: () => { tone(988, .08, 'triangle', .08); tone(1319, .15, 'triangle', .08, 0, .07); }, flag: () => tone(784, .12, 'triangle', .06),
  win: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, .18, 'triangle', .1, 0, i * .12)); },
  beep: () => tone(440, .12, 'square', .05), go: () => tone(880, .35, 'square', .06), boost: () => tone(300, .3, 'sawtooth', .04, 600),
  slip: () => tone(200, .3, 'triangle', .06, 300), lap: () => { tone(784, .1, 'square', .05); tone(988, .15, 'square', .05, 0, .1); },
};
function play(n) { SFX[n] && SFX[n](); }
function sfx(n) { play(n); if (isHost && !solo) sndQ.push(n); }   // anfitrión: suena y avisa al invitado

/* ======================= MAPA ======================= */
function tile(tx, ty) {
  if (tx < 0 || tx >= LW || ty < 0) return '#';
  if (ty >= ROWS) return '.';
  return MAP[ty][tx];
}
function solidT(c, small) {
  if (c === '#') return true;
  if (c === 'm') return !small;
  if (c === '1' || c === '2' || c === '3') return !chn[+c];
  return false;
}
function hitsSolid(x, y, w, h, small) {
  const x0 = Math.floor((x - w / 2) / T), x1 = Math.floor((x + w / 2 - 0.01) / T);
  const y0 = Math.floor((y - h) / T), y1 = Math.floor((y - 0.01) / T);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (solidT(tile(tx, ty), small)) return true;
  return false;
}
function touches(b, test) {   // ¿alguna casilla que toca el cuerpo cumple test(c,tx,ty)?
  const x0 = Math.floor((b.x - b.w / 2) / T), x1 = Math.floor((b.x + b.w / 2 - 0.01) / T);
  const y0 = Math.floor((b.y - b.h) / T), y1 = Math.floor((b.y - 0.01) / T);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) { const r = test(tile(tx, ty), tx, ty); if (r) return r; }
  return null;
}
function loadLevel(i) {
  lv = i;
  if (i === RACE) { setupRace(); return; }
  const L = LEVELS[i];
  MAP = L.map.map(r => r); LW = MAP[0].length;
  boxes = []; plates = []; switches = []; swOn = {}; chn = [false, false, false, false]; spawn = {};
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < LW; x++) {
    const c = MAP[y][x];
    if (c === 'Z' || c === 'P' || c === 'x') {
      const pos = { x: x * T + 8, y: (y + 1) * T };
      if (c === 'x') boxes.push({ x: pos.x, y: pos.y, vy: 0, by: -1 }); else spawn[c.toLowerCase()] = pos;
      MAP[y] = MAP[y].slice(0, x) + '.' + MAP[y].slice(x + 1);
    }
    if ('abc'.includes(c)) plates.push({ x, y, n: 'abc'.indexOf(c) + 1 });
    if ('uvw'.includes(c)) switches.push({ x, y, n: 'uvw'.indexOf(c) + 1, k: x + ',' + y });
  }
}
function placeAtSpawn(b) {
  const s = spawn[b.ch]; b.x = s.x; b.y = s.y; b.vx = b.vy = 0; b.small = false; b.w = 9; b.h = 14; b.carry = null;
  b.cp = { x: s.x, y: s.y }; b.dx = b.x; b.dy = b.y; b.flapE = FLAP_E;
}

/* ======================= FÍSICA DE LOS PERSONAJES ======================= */
const otherOf = b => players.find(q => q !== b);
const carrierOf = b => players.find(q => q !== b && q.carry && q.carry.k === 'z' && b.ch === 'z');
function platformTop(b, y0, y1) {
  let best = null;
  const tx0 = Math.floor((b.x - b.w / 2) / T), tx1 = Math.floor((b.x + b.w / 2 - 0.01) / T);
  for (let ty = Math.floor(y0 / T); ty <= Math.floor(y1 / T); ty++) {
    const top = ty * T;
    if (y0 > top + 0.5 || y1 < top) continue;
    for (let tx = tx0; tx <= tx1; tx++) if (tile(tx, ty) === '=') { if (best === null || top < best) best = top; }
  }
  for (const bx of boxes) {
    if (bx.by >= 0) continue;
    const top = bx.y - 12;
    if (Math.abs(b.x - bx.x) < b.w / 2 + 6 && y0 <= top + 0.5 && y1 >= top && (best === null || top < best)) best = top;
  }
  const o = otherOf(b);
  if (o && o.ch !== 'race' && !carrierOf(o) && !(b.carry && b.carry.k === 'z')) {
    const top = o.y - o.h;
    if (Math.abs(b.x - o.x) < b.w / 2 + o.w / 2 - 1 && y0 <= top + 0.5 && y1 >= top && (best === null || top < best)) best = top;
  }
  return best;
}
function respawn(b) {
  sfx('splash'); fxText(b.x, b.y - 20, '¡splash!', '#9fdcff');
  b.x = b.cp.x; b.y = b.cp.y; b.vx = b.vy = 0; b.dx = b.x; b.dy = b.y;
  if (b.small && hitsSolid(b.x, b.y, 9, 14, false)) { } else { b.small = false; b.w = 9; b.h = 14; }
}
function stepBody(b, inp, dt) {
  // cargada por el Palomito: va arriba de su cabeza
  const car = carrierOf(b);
  if (car) { b.x = car.x; b.y = car.y - car.h; b.vx = b.vy = 0; b.ground = false; b.wasCarried = true; b.mv = false; return; }
  if (b.wasCarried) { b.wasCarried = false; if (hitsSolid(b.x, b.y, b.w, b.h, b.small)) { const o = otherOf(b); if (o) { b.x = o.x; b.y = o.y; } } }
  b.w = b.small ? 6 : 9; b.h = b.small ? 7 : 14;
  const sp = b.small ? SPD_S : SPD;
  b.vx += (inp.x * sp - b.vx) * Math.min(1, dt * 16);
  if (Math.abs(inp.x) > 0.1) b.f = Math.sign(inp.x);
  b.mv = Math.abs(b.vx) > 8;
  if (b.ground) { b.coyote = 0.09; b.flapE = b.carry ? FLAP_E_CARRY : FLAP_E; } else b.coyote -= dt;
  if (b.carry && b.flapE > FLAP_E_CARRY) b.flapE = FLAP_E_CARRY;
  if (inp.jumpPressed && b.coyote > 0) { b.vy = -(b.small ? JUMP_S : JUMP); b.coyote = 0; b.ground = false; play('jump'); }
  if (!inp.jump && b.vy < -140 && !b.fl) b.vy = -140;         // salto corto si sueltas
  b.vy = Math.min(MAXFALL, b.vy + GRAV * dt);
  b.fl = false;
  if (b.ch === 'p' && !b.ground && inp.jump && b.flapE > 0 && b.vy >= FLAP_V) {
    b.vy = FLAP_V; b.flapE -= dt; b.fl = true;
    b.flapSnd = (b.flapSnd || 0) - dt; if (b.flapSnd <= 0) { play('flap'); b.flapSnd = 0.16; }
  }
  const stuck = hitsSolid(b.x, b.y, b.w, b.h, b.small);   // una puerta se cerró encima: déjalo salir
  // eje X
  let nx = b.x + b.vx * dt;
  if (!stuck && hitsSolid(nx, b.y, b.w, b.h, b.small)) {
    if (b.vx > 0) nx = Math.floor((nx + b.w / 2) / T) * T - b.w / 2 - 0.01;
    else nx = (Math.floor((nx - b.w / 2) / T) + 1) * T + b.w / 2 + 0.01;
    if (hitsSolid(nx, b.y, b.w, b.h, b.small)) nx = b.x;
    b.vx = 0;
  }
  b.x = nx;
  // eje Y
  let ny = b.y + b.vy * dt; b.ground = false;
  if (b.vy >= 0) {
    if (!stuck && hitsSolid(b.x, ny, b.w, b.h, b.small)) {
      ny = Math.floor(ny / T) * T;
      if (hitsSolid(b.x, ny, b.w, b.h, b.small)) ny = b.y;
      b.vy = 0; b.ground = true;
    } else {
      const top = platformTop(b, b.y, ny);
      if (top !== null) { ny = top; b.vy = 0; b.ground = true; }
    }
  } else if (!stuck && hitsSolid(b.x, ny, b.w, b.h, b.small)) {
    ny = (Math.floor((ny - b.h) / T) + 1) * T + b.h + 0.01;
    if (hitsSolid(b.x, ny, b.w, b.h, b.small)) ny = b.y;
    b.vy = 0;
  }
  b.y = ny;
  // agua, vacío y banderitas
  if (b.y > ROWS * T + 30 || touches(b, c => c === '~')) { respawn(b); return; }
  const flag = touches(b, (c, tx, ty) => c === 'k' ? { x: tx * T + 8, y: (ty + 1) * T } : null);
  if (flag && (!b.cp || b.cp.x !== flag.x || b.cp.y !== flag.y)) { b.cp = flag; if (b === players[myIdx] || solo) { play('flag'); fxText(flag.x, flag.y - 26, '✓', '#7cff7c'); } }
}
function usePower(b) {   // PODER de Zairene (local): encogerse / crecer
  if (b.ch !== 'z') return false;
  if (b.small) {
    if (hitsSolid(b.x, b.y, 9, 14, false)) { play('no'); fxText(b.x, b.y - 18, '¡no cabe!', '#ff6b6b'); return true; }
    b.small = false; b.w = 9; b.h = 14; play('big');
  } else { b.small = true; b.w = 6; b.h = 7; play('small'); }
  return true;
}
function doPow(i) {      // PODER del Palomito (lo decide el anfitrión): cargar / soltar
  const p = players[i]; if (!p || p.ch !== 'p' || phase !== 'play') return;
  if (p.carry) {
    if (p.carry.k === 'box') {
      const bx = boxes[p.carry.i]; bx.by = -1;
      let x = p.x + p.f * 12; if (hitsSolid(x, p.y, 12, 12, false)) x = p.x;
      bx.x = x; bx.y = p.y; if (hitsSolid(bx.x, bx.y, 12, 12, false)) bx.y = p.y - p.h; bx.vy = 0;
    }
    p.carry = null; sfx('drop'); return;
  }
  const z = players.find(q => q.ch === 'z');
  if (z && z.small && Math.abs(z.x - p.x) < 18 && Math.abs(z.y - p.y) < 20) { p.carry = { k: 'z' }; sfx('pick'); return; }
  let best = -1, bd = 22;
  boxes.forEach((bx, k) => { const d = Math.hypot(bx.x - p.x, bx.y - p.y); if (bx.by < 0 && d < bd) { bd = d; best = k; } });
  if (best >= 0) { boxes[best].by = i; p.carry = { k: 'box', i: best }; sfx('pick'); return; }
  if (z && !z.small && Math.abs(z.x - p.x) < 18 && Math.abs(z.y - p.y) < 20) fxText(p.x, p.y - 22, '¡pesa mucho!', '#ffc93c');
  sfx('no');
}

/* ======================= MUNDO (anfitrión) ======================= */
function fxText(x, y, txt, c) { effects.push({ k: 't', x, y, txt, c, l: 1.2 }); }
function fxHearts(x, y) { for (let i = 0; i < 6; i++) effects.push({ k: 'h', x: x + (Math.random() * 24 - 12), y: y + Math.random() * 6, l: 1 + Math.random() * .6 }); }
const onTile = (b, tx, ty, w) => b.y > ty * T + 2 && b.y <= (ty + 1) * T + 1 && Math.abs(b.x - (tx * T + 8)) < 8 + w / 2 - 1;
function updateWorld(dt) {
  if (phase !== 'play') return;
  // Zairene ya no está chiquita: el Palomito la suelta
  players.forEach(p => { if (p.carry && p.carry.k === 'z') { const z = players.find(q => q.ch === 'z'); if (!z || !z.small) p.carry = null; } });
  // cajas
  boxes.forEach(bx => {
    if (bx.by >= 0) { const c = players[bx.by]; if (!c || !c.carry || c.carry.k !== 'box') { bx.by = -1; return; } bx.x = c.x; bx.y = c.y - c.h; bx.vy = 0; return; }
    bx.vy = Math.min(MAXFALL, bx.vy + GRAV * dt);
    let ny = bx.y + bx.vy * dt;
    if (hitsSolid(bx.x, ny, 12, 12, false)) { ny = Math.floor(ny / T) * T; if (hitsSolid(bx.x, ny, 12, 12, false)) ny = bx.y; bx.vy = 0; }
    else {
      for (let ty = Math.floor(bx.y / T); ty <= Math.floor(ny / T); ty++) {
        const top = ty * T; if (bx.y > top + 0.5 || ny < top) continue;
        const a = tile(Math.floor((bx.x - 5) / T), ty), b = tile(Math.floor((bx.x + 5) / T), ty);
        if (a === '=' || b === '=') { ny = top; bx.vy = 0; break; }
      }
    }
    bx.y = ny;
    if (bx.y > ROWS * T + 30 || touches({ x: bx.x, y: bx.y, w: 12, h: 12 }, c => c === '~')) {   // se cayó al agua: vuelve a su lugar
      const s = LEVELS[lv].map; let k = 0;
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < LW; x++) if (s[y][x] === 'x') { if (boxes[k] === bx) { bx.x = x * T + 8; bx.y = (y + 1) * T; bx.vy = 0; } k++; }
      sfx('splash');
    }
  });
  // botones, interruptores y puertas
  const prev = chn.slice(); chn = [false, false, false, false];
  plates.forEach(pl => {
    pl.on = players.some(b => !carrierOf(b) && onTile(b, pl.x, pl.y, b.w)) || boxes.some(bx => bx.by < 0 && onTile(bx, pl.x, pl.y, 12));
    if (pl.on) chn[pl.n] = true;
  });
  switches.forEach(s => {
    if (!swOn[s.k] && players.some(b => touches(b, (c, tx, ty) => tx === s.x && ty === s.y))) {
      swOn[s.k] = true; sfx('sw'); fxText(s.x * T + 8, s.y * T - 6, '¡clic!', CH_COL[s.n]);
    }
    if (swOn[s.k]) chn[s.n] = true;
  });
  for (let n = 1; n <= 3; n++) if (chn[n] !== prev[n]) { sfx('door'); break; }
  // meta: los dos en el corazón
  if (players.length === 2 && players.every(b => touches(b, c => c === 'G'))) {
    phase = 'clear'; clearT = 2.6; sfx('win');
    const g = touches(players[0], (c, tx, ty) => c === 'G' ? { tx, ty } : null);
    fxHearts(g.tx * T + 8, g.ty * T);
    saveUp(lv + 1);
  }
}
function updateEffects(dt) {
  for (let i = effects.length - 1; i >= 0; i--) {
    const e = effects[i]; e.l -= dt; e.y -= (e.k === 'h' ? 18 : 12) * dt;
    if (e.l <= 0) effects.splice(i, 1);
  }
}
function updateHost(dt) {
  if (phase === 'clear') {
    clearT -= dt;
    if (clearT <= 0) {
      if (lv === 2) { story = true; startRace(); }
      else if (lv < 5) startLevel(lv + 1);
      else finish({ title: '¡TERMINARON LA CASA!', msg: 'Zairene y el Palomito: el mejor equipo del mundo ♥ Pronto habrá más mundos.', next: 'Jugar otra vez' });
    }
  }
  if (phase === 'race') updateRaceHost(dt);
}
function startLevel(i) {
  roundId++; story = story && i >= 3; loadLevel(i); hintT = 22;
  players.forEach(placeAtSpawn);
  if (solo) { players[1].x -= 0; }
  setPhase('play');
}
function finish(info) { endInfo = info; setPhase('end'); }

/* ======================= CARRERA ======================= */
// Vista desde arriba. La pista es una línea de puntos con ancho; cada quien maneja su carro
// y cuenta sus propias vueltas; el anfitrión decide quién llegó primero.
const TRACK = [[70, 52], [250, 40], [410, 52], [448, 112], [438, 192], [398, 236], [300, 240], [250, 196], [200, 240], [90, 236], [42, 192], [36, 104]];
const TW = 21;   // medio ancho de la pista
const NT = TRACK.length;
const TURBOS = [1.5, 5.45, 9.4], PUDDLES = [[3.5, 7], [7.6, -7], [10.55, 0]];
let race = { cd: 0, t: 0, win: -1, endT: 0 };
let raceItems = { turbo: [], juice: [] };
function trackPoint(p, off = 0) {
  const i = Math.floor(p) % NT, j = (i + 1) % NT, t = p - Math.floor(p);
  const [ax, ay] = TRACK[i], [bx, by] = TRACK[j], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy);
  return { x: ax + dx * t - dy / L * off, y: ay + dy * t + dx / L * off, a: Math.atan2(dy, dx) };
}
function trackInfo(x, y) {   // distancia a la pista y avance (0..NT)
  let best = { d: 1e9, p: 0 };
  for (let i = 0; i < NT; i++) {
    const [ax, ay] = TRACK[i], [bx, by] = TRACK[(i + 1) % NT];
    const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L2));
    const d = Math.hypot(x - (ax + dx * t), y - (ay + dy * t));
    if (d < best.d) best = { d, p: i + t };
  }
  return best;
}
function setupRace() {
  raceItems.turbo = TURBOS.map(p => trackPoint(p));
  raceItems.juice = PUDDLES.map(([p, o]) => trackPoint(p, o));
}
function newCar(idx) {
  const s = trackPoint(NT - 0.12, idx ? 9 : -9);
  const a = trackPoint(0).a;
  const info = trackInfo(s.x, s.y);
  return { x: s.x, y: s.y, a, s: 0, prev: info.p, tot: info.p - NT, boost: 0, slip: 0, lapShown: 1, done: false };
}
function startRace() {
  roundId++; loadLevel(RACE);
  race = { cd: 3.5, t: 0, win: -1, endT: 0, lastCd: 4 };
  players.forEach((p, i) => { p.car = newCar(i); });
  setPhase('race');
}
function stepCar(c, inp, dt) {
  if (race.cd > 0 || c.done) { c.s = Math.max(0, c.s - 200 * dt); return; }
  let steer = 0;
  if (inp.joy) {   // palanca: el carro gira hacia donde apuntas
    let da = Math.atan2(inp.y, inp.x) - c.a; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
    steer = Math.max(-1, Math.min(1, da * 2.2));
  } else steer = inp.x;
  const info = trackInfo(c.x, c.y), on = info.d <= TW;
  let max = on ? 150 : 70; if (c.boost > 0) max = 240;
  if (inp.brake) c.s = Math.max(35, c.s - 260 * dt);
  else c.s += (c.s < max ? 170 : -220) * dt;
  let turn = steer * (2.7 + (inp.brake ? 1.8 : 0)) * Math.min(1, c.s / 50);
  if (c.slip > 0) { turn += Math.sin(performance.now() / 45) * 3.2; c.slip -= dt; }
  c.boost -= dt;
  c.a += turn * dt;
  c.x = Math.max(6, Math.min(VW - 6, c.x + Math.cos(c.a) * c.s * dt));
  c.y = Math.max(6, Math.min(VH - 6, c.y + Math.sin(c.a) * c.s * dt));
  raceItems.turbo.forEach(t => { if (Math.hypot(t.x - c.x, t.y - c.y) < 11 && c.boost < 0.6) { c.boost = 1.1; play('boost'); } });
  raceItems.juice.forEach(t => { if (Math.hypot(t.x - c.x, t.y - c.y) < 10 && c.slip <= 0) { c.slip = 0.7; c.s = Math.min(c.s, 90); play('slip'); } });
  // vueltas
  const p = trackInfo(c.x, c.y).p;
  let d = p - c.prev; if (d < -NT / 2) d += NT; if (d > NT / 2) d -= NT;
  c.tot += d; c.prev = p;
  const lap = Math.min(LAPS, Math.floor(c.tot / NT) + 1);
  if (lap > c.lapShown && c.tot > 0) { c.lapShown = lap; play('lap'); }
  if (c.tot >= LAPS * NT) { c.done = true; c.time = race.t; }
}
function updateRaceHost(dt) {
  if (race.cd > 0) {
    race.cd -= dt; const n = Math.ceil(race.cd);
    if (n !== race.lastCd) { race.lastCd = n; sfx(n > 0 ? 'beep' : 'go'); }
    return;
  }
  race.t += dt;
  if (race.win < 0) {
    const fin = players.map((p, i) => [i, p.car]).filter(([, c]) => c && c.tot >= LAPS * NT);
    if (fin.length) { race.win = fin[0][0]; race.endT = 3.2; sfx('win'); }
  } else {
    race.endT -= dt;
    if (race.endT <= 0) {
      const wch = players[race.win].ch;
      if (solo) {
        const t = race.t - 3.2; let best = 0; try { best = +localStorage.getItem('mitades-best') || 0; } catch (e) { }
        const rec = !best || t < best; if (rec) try { localStorage.setItem('mitades-best', t.toFixed(1)); } catch (e) { }
        finish({ title: rec ? '¡NUEVO RÉCORD!' : '¡META!', msg: `Tiempo: ${t.toFixed(1)} s` + (best && !rec ? ` · récord: ${best} s` : ''), next: story ? 'Seguir al nivel 4' : 'Otra carrera' });
      } else finish({ title: '¡GANÓ ' + (wch === 'z' ? 'ZAIRENE' : 'EL PALOMITO') + '!', msg: wch === 'z' ? 'Zairene es la reina de la sala 🏆' : 'El Palomito vuela también en carro 🏆', next: story ? 'Seguir al nivel 4' : 'Revancha' });
      saveUp(3);
    }
  }
}

/* ======================= ENTRADA ======================= */
const keys = {};
let joyX = 0, joyY = 0, joyOn = false, jumpTouch = false, jumpQueued = false;
addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  keys[e.code] = true;
  if ((phase === 'play' || phase === 'race') && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab'].includes(e.code)) e.preventDefault();
  if (e.repeat) return;
  ensureAudio();
  if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') jumpQueued = true;
  if (e.code === 'KeyE' || e.code === 'KeyJ' || e.code === 'Enter') doPower();
  if (e.code === 'Tab' && solo) switchChar();
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
function inputNow() {
  let x = 0, y = 0;
  if (keys.ArrowLeft || keys.KeyA) x -= 1;
  if (keys.ArrowRight || keys.KeyD) x += 1;
  if (keys.ArrowUp || keys.KeyW) y -= 1;
  if (keys.ArrowDown || keys.KeyS) y += 1;
  const joy = joyOn && Math.hypot(joyX, joyY) > 0.3;
  if (joy) { x = joyX; y = joyY; }
  const jump = !!(keys.Space || keys.ArrowUp || keys.KeyW || jumpTouch);
  const jp = jumpQueued; jumpQueued = false;
  return { x: Math.max(-1, Math.min(1, phase === 'play' && joy ? (Math.abs(joyX) > 0.3 ? Math.sign(joyX) * Math.min(1, Math.abs(joyX) * 1.4) : 0) : x)), y, jump, jumpPressed: jp, joy, brake: !!(keys.Space || keys.ArrowDown || keys.KeyS || jumpTouch) };
}
function doPower() {
  ensureAudio();
  if (phase !== 'play') return;
  const me = players[myIdx]; if (!me) return;
  if (me.ch === 'z') { if (!carrierOf(me) || true) usePower(me); return; }
  if (isHost) doPow(myIdx);
  else if (conn && conn.open) conn.send({ t: 'a', k: 'pow' });
}
function switchChar() {
  if (!solo || phase !== 'play') return;
  myIdx = 1 - myIdx; myChar = players[myIdx].ch; play('pick');
}
// palanca táctil
const joy = $('joy'), knob = $('knob');
let joyId = null, jcx = 0, jcy = 0;
function joyMove(e) {
  let dx = e.clientX - jcx, dy = e.clientY - jcy; const R = 52, d = Math.hypot(dx, dy);
  if (d > R) { dx *= R / d; dy *= R / d; }
  knob.style.transform = `translate(${dx}px,${dy}px)`;
  joyX = dx / R; joyY = dy / R;
}
joy.addEventListener('pointerdown', e => {
  ensureAudio(); joyId = e.pointerId; joy.setPointerCapture(e.pointerId); joyOn = true;
  const r = joy.getBoundingClientRect(); jcx = r.left + r.width / 2; jcy = r.top + r.height / 2; joyMove(e);
});
joy.addEventListener('pointermove', e => { if (e.pointerId === joyId) joyMove(e); });
const joyEnd = e => { if (e.pointerId === joyId) { joyId = null; joyX = joyY = 0; joyOn = false; knob.style.transform = ''; } };
joy.addEventListener('pointerup', joyEnd); joy.addEventListener('pointercancel', joyEnd);
const bA = $('bA'), bB = $('bB');
bA.addEventListener('pointerdown', e => { e.preventDefault(); ensureAudio(); bA.setPointerCapture(e.pointerId); jumpTouch = true; jumpQueued = true; bA.classList.add('on'); });
['pointerup', 'pointercancel'].forEach(ev => bA.addEventListener(ev, () => { jumpTouch = false; bA.classList.remove('on'); }));
bB.addEventListener('pointerdown', e => { e.preventDefault(); bB.classList.add('on'); doPower(); });
['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => bB.addEventListener(ev, () => bB.classList.remove('on')));
$('sw').addEventListener('click', switchChar);
addEventListener('contextmenu', e => e.preventDefault());

function moveLocal(dt) {
  const inp = inputNow();
  if (phase === 'play') {
    const idle = { x: 0, y: 0, jump: false, jumpPressed: false };
    if (solo) players.forEach((b, i) => stepBody(b, i === myIdx ? inp : idle, dt));
    else if (players[myIdx]) stepBody(players[myIdx], inp, dt);
  } else if (phase === 'race') {
    const me = players[myIdx]; if (me && me.car) stepCar(me.car, inp, dt);
  }
}

/* ======================= RED ======================= */
const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const randCode = () => Array.from({ length: 4 }, () => ALPHA[Math.floor(Math.random() * ALPHA.length)]).join('');
let roomCode = '', pickLv = 0;
const r1 = v => Math.round(v * 10) / 10;
function bodyMsg(p) {
  const m = { ch: p.ch, x: r1(p.x), y: r1(p.y), f: p.f, sm: p.small, fl: p.fl, mv: p.mv, gr: p.ground, carry: p.carry };
  if (p.car) m.car = { x: r1(p.car.x), y: r1(p.car.y), a: +p.car.a.toFixed(3), s: Math.round(p.car.s), tot: +p.car.tot.toFixed(3), b: p.car.boost > 0, sl: p.car.slip > 0 };
  return m;
}
function snapshot() {
  const s = {
    t: 's', ph: phase, lv, rid: roundId, story, chn, sw: swOn, ct: clearT, hint: hintT, end: endInfo, pick: pickLv,
    bx: boxes.map(b => [r1(b.x), r1(b.y), b.by]), fx: effects, snd: sndQ,
    rc: { cd: +race.cd.toFixed(2), t: +race.t.toFixed(2), win: race.win },
    pl: players.map(bodyMsg),
  };
  sndQ = [];
  return s;
}
function applySnap(s) {
  if (s.lv !== lv || s.rid !== seenRound) {
    const fresh = s.rid !== seenRound; seenRound = s.rid; loadLevel(s.lv);
    if (fresh) players.forEach((p, i) => { if (!p) return; if (s.lv === RACE) p.car = newCar(i); else placeAtSpawn(p); });
  }
  story = s.story; chn = s.chn; swOn = s.sw; clearT = s.ct; hintT = s.hint; endInfo = s.end; effects = s.fx;
  race.cd = s.rc.cd; race.t = s.rc.t; race.win = s.rc.win;
  if (s.pick !== pickLv) { pickLv = s.pick; refreshLevelUI(); }
  boxes = s.bx.map(([x, y, by]) => ({ x, y, by, vy: 0 }));
  s.snd.forEach(play);
  s.pl.forEach((sp, i) => {
    let p = players[i];
    if (!p) { p = players[i] = newBody(sp.ch); Object.assign(p, { x: sp.x, y: sp.y, dx: sp.x, dy: sp.y }); if (lv !== RACE && spawn[p.ch]) placeAtSpawn(p); if (lv === RACE) p.car = newCar(i); }
    p.ch = sp.ch;
    if (i === myIdx) { p.carry = sp.carry; return; }
    const { dx, dy } = p;
    Object.assign(p, { x: sp.x, y: sp.y, f: sp.f, small: sp.sm, fl: sp.fl, mv: sp.mv, ground: sp.gr, carry: sp.carry, dx, dy });
    p.w = p.small ? 6 : 9; p.h = p.small ? 7 : 14;
    if (sp.car) { if (!p.car) p.car = newCar(i); Object.assign(p.car, sp.car); p.car.boost = sp.car.b ? 1 : 0; p.car.slip = sp.car.sl ? 1 : 0; }
  });
  players.length = s.pl.length;
  if (s.ph !== phase) setPhase(s.ph);
}
function sendPos() {
  const p = players[myIdx];
  if (p && conn && conn.open) conn.send(Object.assign({ t: 'p' }, bodyMsg(p)));
}
function closeNet() {
  try { conn && conn.close(); } catch (e) { }
  try { peer && peer.destroy(); } catch (e) { }
  conn = null; peer = null; roomJoined = '';
}
function hostRoom() {
  if (!window.Peer) { setStatus('No cargó la conexión. Revisa tu internet.'); return; }
  closeNet(); isHost = true; solo = false; myIdx = 0;
  players = [newBody(myChar)];
  roomCode = randCode();
  setStatus('Creando sala…');
  peer = new Peer(ROOM_PREFIX + roomCode, { debug: 0 });
  peer.on('open', () => {
    $('roomCode').textContent = roomCode;
    $('hostBox').classList.remove('hidden');
    lobbyStatus('Esperando a tu pareja… 💌');
    $('bStart').classList.add('hidden');
    setPhase('lobby');
  });
  peer.on('connection', c => {
    c.on('open', () => {
      const old = conn; conn = c; lastRecvGuest = performance.now();
      if (old && old !== c) { try { old.close(); } catch (e) { } }
      const other = myChar === 'z' ? 'p' : 'z';
      const resume = !!players[1] && phase !== 'lobby';
      if (!players[1]) players[1] = newBody(other);
      c.send({ t: 'hello', ch: other, host: myChar, resume });
      if (phase === 'lobby') { lobbyStatus('¡' + nameOf(other) + ' se conectó! ♥'); $('bStart').classList.remove('hidden'); }
      play('sw');
    });
    c.on('data', d => { if (c === conn) { lastRecvGuest = performance.now(); onHostData(d); } });
    c.on('close', () => onGuestLeft(c));
    c.on('error', () => onGuestLeft(c));
  });
  peer.on('error', err => {
    if (err.type === 'unavailable-id') { hostRoom(); return; }
    setStatus('Error de conexión: ' + err.type);
    if (phase === 'lobby' && !conn) setPhase('menu');
  });
  peer.on('disconnected', () => { try { peer.reconnect(); } catch (e) { } });
}
function onGuestLeft(c) {
  if (c !== conn) return;
  conn = null;
  if (phase === 'lobby') { players.length = 1; lobbyStatus('Tu pareja se desconectó. Esperando que vuelva…'); $('bStart').classList.add('hidden'); }
}
function onHostData(d) {
  const p = players[1]; if (!p) return;
  if (d.t === 'p') {
    Object.assign(p, { x: d.x, y: d.y, f: d.f, small: d.sm, fl: d.fl, mv: d.mv, ground: d.gr });
    p.w = p.small ? 6 : 9; p.h = p.small ? 7 : 14;
    if (d.car && p.car && phase === 'race') { Object.assign(p.car, d.car); p.car.boost = d.car.b ? 1 : 0; p.car.slip = d.car.sl ? 1 : 0; }
  }
  else if (d.t === 'a' && d.k === 'pow') doPow(1);
  else if (d.t === 'ping') conn.send({ t: 'pong', ts: d.ts });
  else if (d.t === 'rtt') rtt = d.v;
  else if (d.t === 'next' && phase === 'end') nextFromEnd();
}
let roomJoined = '', lastRecv = 0, lastRecvGuest = 0, reconnecting = 0, reconnectStart = 0;
function joinRoom(code) {
  code = (code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length !== 4) { setStatus('Escribe el código de 4 letras'); return; }
  if (!window.Peer) { setStatus('No cargó la conexión. Revisa tu internet.'); return; }
  closeNet(); isHost = false; solo = false; myIdx = 1; seenRound = -1; players = [];
  roomJoined = ''; reconnecting = 0;
  setStatus('Conectando…');
  peer = new Peer({ debug: 0 });
  let opened = false;
  const timer = setTimeout(() => { if (!opened) { setStatus('No pude conectar. ¿El código es correcto?'); closeNet(); } }, 15000);
  peer.on('open', () => {
    const c = peer.connect(ROOM_PREFIX + code, { reliable: true, serialization: 'json' });
    c.on('open', () => { opened = true; clearTimeout(timer); roomJoined = code; });
    bindGuestConn(c);
  });
  peer.on('disconnected', () => { try { peer.reconnect(); } catch (e) { } });
  peer.on('error', err => {
    if (roomJoined) { reconnecting = 0; return; }
    clearTimeout(timer);
    setStatus(err.type === 'peer-unavailable' ? 'No encontré esa sala 🤔' : 'Error de conexión: ' + err.type);
    if (phase !== 'menu') setPhase('menu');
  });
}
function bindGuestConn(c) {
  conn = c; lastRecv = performance.now();
  c.on('data', d => {
    if (c !== conn) return;
    lastRecv = performance.now(); reconnecting = 0; reconnectStart = 0;
    if (d.t === 'hello') {
      myChar = d.ch;
      if (!d.resume) {
        $('hostBox').classList.add('hidden'); $('bStart').classList.add('hidden');
        lobbyStatus('¡Conectado! Eres ' + nameOf(d.ch) + '. Esperando a que ' + nameOf(d.host) + ' empiece…');
        if (phase === 'menu') setPhase('lobby');
        play('sw');
      }
    } else if (d.t === 's') applySnap(d);
    else if (d.t === 'pong') { rtt = Math.round(performance.now() - d.ts); c.send({ t: 'rtt', v: rtt }); }
  });
  c.on('close', () => { if (c === conn) lastRecv = 0; });
}
function guestReconnect() {
  const now = performance.now();
  if (reconnecting && now - reconnecting < 4000) return;
  if (!reconnectStart) reconnectStart = now;
  if (now - reconnectStart > 45000) {
    const code = roomJoined; closeNet(); roomJoined = ''; reconnectStart = 0;
    setPhase('menu'); setStatus('Se perdió la conexión 💔 Vuelve a unirte con ' + code); $('code').value = code; return;
  }
  reconnecting = now;
  try { conn && conn.close(); } catch (e) { }
  if (!peer || peer.destroyed) { peer = new Peer({ debug: 0 }); peer.on('open', () => bindGuestConn(peer.connect(ROOM_PREFIX + roomJoined, { reliable: true, serialization: 'json' }))); peer.on('error', () => { reconnecting = 0; }); peer.on('disconnected', () => { try { peer.reconnect(); } catch (e) { } }); return; }
  if (peer.disconnected) { try { peer.reconnect(); } catch (e) { } }
  bindGuestConn(peer.connect(ROOM_PREFIX + roomJoined, { reliable: true, serialization: 'json' }));
}
function startSolo() {
  closeNet(); isHost = true; solo = true; myIdx = myChar === 'z' ? 0 : 1;
  players = [newBody('z'), newBody('p')];
  startPicked();
}
function startPicked() { story = false; if (pickLv === RACE) startRace(); else startLevel(pickLv); }
function nextFromEnd() {
  if (!endInfo) return;
  if (lv === RACE) { if (story) { story = false; startLevel(3); } else startRace(); }
  else startLevel(0);
}

/* ======================= DIBUJO ======================= */
const r = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
function text(s, x, y, c, size = 8, align = 'left') {
  ctx.font = size + "px 'Press Start 2P', monospace"; ctx.textAlign = align; ctx.textBaseline = 'top';
  ctx.fillStyle = '#000'; ctx.fillText(s, x + 1, y + 1);
  ctx.fillStyle = c; ctx.fillText(s, x, y);
}
function wrap(s, maxW, size) {
  ctx.font = size + "px 'Press Start 2P', monospace";
  const out = []; let line = '';
  s.split(' ').forEach(w => { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; });
  if (line) out.push(line); return out;
}
let camX = 0;
function drawTile(c, tx, ty, L, now) {
  const X = tx * T, Y = ty * T;
  if (c === '#' || c === 'm') {
    const [base, hi, lo] = L.blk;
    r(X, Y, T, T, base);
    if (!solidT(tile(tx, ty - 1), false) && tile(tx, ty - 1) !== 'm') { r(X, Y, T, 3, hi); }
    r(X, Y + T - 1, T, 1, lo); r(X + (ty % 2 ? 0 : 8), Y + 4, 1, 11, lo);
    if (c === 'm') {   // ratonera
      r(X + 3, Y + 6, 10, 10, '#1a1020'); r(X + 4, Y + 5, 8, 1, '#1a1020'); r(X + 5, Y + 4, 6, 1, '#1a1020');
      r(X + 2, Y + 15, 12, 1, lo);
    }
    return;
  }
  if (c === '=') { r(X, Y, T, 4, L.blk[1]); r(X, Y + 3, T, 1, L.blk[2]); r(X + 2, Y + 4, 2, 3, L.blk[2]); r(X + 12, Y + 4, 2, 3, L.blk[2]); return; }
  if (c === '~') {
    const top = tile(tx, ty - 1) !== '~';
    r(X, Y, T, T, '#3a8ad8');
    if (top) { const o = Math.floor(now / 200 + tx) % 4; r(X, Y, T, 3, '#7cc4ff'); r(X + o * 4, Y, 3, 1, '#ffffff'); }
    return;
  }
  if (c === '1' || c === '2' || c === '3') {
    const n = +c, col = CH_COL[n];
    if (!chn[n]) { r(X + 2, Y, 12, T, '#2a2040'); for (let i = 0; i < 3; i++) r(X + 3 + i * 4, Y, 2, T, col); r(X + 2, Y, 1, T, '#000'); r(X + 13, Y, 1, T, '#000'); }
    else { r(X + 2, Y, 1, T, col); r(X + 13, Y, 1, T, col); }
    return;
  }
  if ('abc'.includes(c)) {
    const n = 'abc'.indexOf(c) + 1, pl = plates.find(p => p.x === tx && p.y === ty), on = pl && pl.on;
    r(X + 1, Y + 14, 14, 2, '#3a3040'); r(X + 3, Y + (on ? 13 : 11), 10, on ? 1 : 3, CH_COL[n]); r(X + 3, Y + (on ? 13 : 11), 10, 1, '#fff8');
    return;
  }
  if ('uvw'.includes(c)) {
    const n = 'uvw'.indexOf(c) + 1, on = swOn[tx + ',' + ty];
    r(X + 3, Y + 2, 10, 12, '#2a2040'); r(X + 4, Y + 3, 8, 10, on ? CH_COL[n] : '#5a5070');
    r(X + 6, on ? Y + 4 : Y + 9, 4, 3, '#fff');
    if (!on && Math.floor(now / 300) % 2) { r(X + 2, Y + 1, 12, 1, CH_COL[n]); r(X + 2, Y + 14, 12, 1, CH_COL[n]); }
    return;
  }
  if (c === 'k') {
    const me = players[myIdx], mine = me && me.cp && me.cp.x === X + 8 && me.cp.y === Y + T;
    r(X + 4, Y + 2, 2, 14, '#6b4a2a'); r(X + 6, Y + 2, 7, 5, mine ? '#4caf3a' : '#b8b0c8'); r(X + 6, Y + 6, 4, 1, mine ? '#2f7d24' : '#8a8098');
    return;
  }
  if (c === 'G') {
    if (tile(tx - 1, ty) !== 'G' && tile(tx, ty - 1) !== 'G') {   // esquina: dibuja la puerta del corazón (2x2)
      r(X, Y, 32, 32, '#ff7eb6'); r(X + 2, Y + 2, 28, 30, '#5c2a4a');
      const b = Math.floor(now / 250) % 2;
      ctx.drawImage(SP.heart, X + 9, Y + 8 - b, 14, 12);
      r(X + 4, Y + 26, 24, 2, '#ffc93c');
    }
  }
}
function drawBody(b, i, now) {
  const x = Math.round(b.dx), y = Math.round(b.dy);
  const bob = b.mv && b.ground ? Math.floor(now / 110) % 2 : 0;
  const spr = SP[b.ch], flip = b.f < 0;
  ctx.save();
  ctx.translate(x, 0); if (flip) ctx.scale(-1, 1);
  if (b.ch === 'p' && (!b.ground || b.fl)) {   // alitas
    const wsp = b.fl && Math.floor(now / 80) % 2 ? SP.wingD : SP.wingU;
    ctx.drawImage(wsp, -11, y - 13);
  }
  if (b.small) { r(-3, y, 6, 1, 'rgba(0,0,0,.25)'); ctx.drawImage(spr, -3, y - 8 - bob, 6, 8); }
  else { r(-5, y, 10, 2, 'rgba(0,0,0,.25)'); ctx.drawImage(spr, -6, y - 16 - bob); }
  ctx.restore();
  if (b.carry && b.carry.k === 'box') { }   // la caja se dibuja con las cajas
  // flechita de "tú"
  if (i === myIdx) {
    const a = Math.floor(now / 300) % 2, c = b.ch === 'z' ? '#ff7eb6' : '#5b8cff', ty = y - (b.small ? 13 : 21) - a;
    r(x - 2, ty, 5, 1, c); r(x - 1, ty + 1, 3, 1, c); r(x, ty + 2, 1, 1, c);
  }
  // energía de vuelo
  if (b.ch === 'p' && !b.ground && i === myIdx) {
    const max = b.carry ? FLAP_E_CARRY : FLAP_E, v = Math.max(0, b.flapE) / max;
    r(x - 8, y + 3, 16, 3, '#000'); r(x - 7, y + 4, Math.round(14 * v), 1, v > .3 ? '#7cc4ff' : '#ff6b6b');
  }
}
function renderLevel(now, dt) {
  const L = LEVELS[lv] || LEVELS[0];
  const me = players[myIdx];
  if (me) { const tx = Math.max(0, Math.min(LW * T - VW, me.dx - VW / 2)); camX += (tx - camX) * Math.min(1, dt * 8); if (Math.abs(tx - camX) > 200) camX = tx; }
  const cx = Math.round(camX);
  // papel tapiz
  r(0, 0, VW, VH, L.wall[0]);
  for (let x = -(cx / 2 % 24); x < VW; x += 24) r(Math.round(x), 0, 10, VH, L.wall[1]);
  ctx.save(); ctx.translate(-cx, 0);
  // ventanas y cuadros de fondo
  for (let x = 6 * T; x < LW * T; x += 13 * T) { r(x, 3 * T, 40, 30, '#6a5040'); r(x + 3, 3 * T + 3, 34, 24, '#9fdcff'); r(x + 19, 3 * T + 3, 2, 24, '#6a5040'); r(x + 3, 3 * T + 14, 34, 2, '#6a5040'); }
  const x0 = Math.floor(cx / T), x1 = Math.min(LW - 1, x0 + Math.ceil(VW / T) + 1);
  for (let y = 0; y < ROWS; y++) for (let x = x0; x <= x1; x++) { const c = MAP[y][x]; if (c !== '.') drawTile(c, x, y, L, now); }
  boxes.forEach(bx => ctx.drawImage(SP.box, Math.round(bx.x - 6), Math.round(bx.y - 12)));
  players.forEach((p, i) => {
    if (i === myIdx && !solo) { p.dx = p.x; p.dy = p.y; }
    else if (solo) { p.dx = p.x; p.dy = p.y; }
    else { const f = Math.min(1, dt * 14); p.dx += (p.x - p.dx) * f; p.dy += (p.y - p.dy) * f; }
  });
  players.map((p, i) => [p, i]).sort((a, b) => (carrierOf(a[0]) ? 1 : 0) - (carrierOf(b[0]) ? 1 : 0)).forEach(([p, i]) => drawBody(p, i, now));
  effects.forEach(e => {
    ctx.globalAlpha = Math.min(1, e.l * 2);
    if (e.k === 'h') ctx.drawImage(SP.heart, Math.round(e.x), Math.round(e.y));
    else text(e.txt, Math.round(e.x), Math.round(e.y), e.c, 6, 'center');
    ctx.globalAlpha = 1;
  });
  ctx.restore();
  // pareja fuera de pantalla: flechita en el borde
  const o = players[1 - myIdx];
  if (o && (o.dx < cx - 4 || o.dx > cx + VW + 4)) {
    const left = o.dx < cx, c = o.ch === 'z' ? '#ff7eb6' : '#5b8cff', yy = Math.max(30, Math.min(VH - 20, o.dy - 10));
    const xx = left ? 4 : VW - 10;
    for (let k = 0; k < 4; k++) r(left ? xx + k : xx + 3 - k, yy - k, 1, 1 + k * 2, c);
    text(o.ch === 'z' ? 'Z' : 'P', left ? xx + 8 : xx - 10, yy - 3, c, 6);
  }
  // barra superior
  r(0, 0, VW, 14, 'rgba(20,12,36,.75)');
  text(`${L.e} ${lv + 1}. ${L.n}`, 6, 4, '#ffc93c', 6);
  if (solo) text('Práctica: TAB / ⇄ cambia', VW - 6, 4, '#fff4e0', 6, 'right');
  else if (rtt >= 0) { const c = rtt < 150 ? '#4caf3a' : rtt < 400 ? '#ffc93c' : '#e8443a'; for (let k = 0; k < 3; k++) r(VW - 14 + k * 3, 10 - k * 2, 2, 2 + k * 2, rtt < [9999, 400, 150][k] ? c : '#5c4a78'); }
  if (hintT > 0) {
    const lines = wrap(L.hint, VW - 40, 6);
    ctx.globalAlpha = Math.min(1, hintT / 1.5);
    r(14, 18, VW - 28, lines.length * 10 + 8, 'rgba(20,12,36,.85)');
    lines.forEach((ln, k) => text(ln, VW / 2, 23 + k * 10, '#fff4e0', 6, 'center'));
    ctx.globalAlpha = 1;
  }
  if (phase === 'clear') {
    r(0, VH / 2 - 26, VW, 52, 'rgba(20,12,36,.8)');
    text('¡NIVEL SUPERADO!', VW / 2, VH / 2 - 16, '#ffc93c', 14, 'center');
    text(lv === 2 ? 'Siguiente: ¡carrera en la sala! 🏎' : lv < 5 ? '♥ ¡Qué buen equipo! ♥' : '♥ ♥ ♥', VW / 2, VH / 2 + 6, '#ff7eb6', 7, 'center');
  }
}
function renderRace(now) {
  // piso de madera y alfombra
  r(0, 0, VW, VH, '#b07a46');
  for (let y = 0; y < VH; y += 12) { r(0, y, VW, 1, '#9a6a3a'); for (let x = (y / 12 % 2) * 30; x < VW; x += 60) r(x, y, 1, 12, '#9a6a3a'); }
  ctx.fillStyle = '#7a3a6a'; ctx.beginPath(); ctx.ellipse(245, 140, 150, 62, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#9a4a8a'; ctx.beginPath(); ctx.ellipse(245, 140, 136, 52, 0, 0, Math.PI * 2); ctx.fill();
  // mesa de centro
  r(196, 108, 108, 50, '#5a3418'); r(199, 111, 102, 44, '#8a5230'); r(240, 118, 20, 14, '#fff8f0'); r(244, 121, 12, 8, '#ff7eb6');
  // sillón y planta (decoración)
  r(110, 92, 50, 70, '#3352b8'); r(114, 96, 42, 62, '#5b8cff'); r(108, 92, 54, 8, '#2a3f8a');
  r(340, 110, 26, 26, '#a8502a'); ctx.fillStyle = '#3d9a35'; ctx.beginPath(); ctx.arc(353, 108, 16, 0, Math.PI * 2); ctx.fill();
  // pista de juguete
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const path = () => { ctx.beginPath(); TRACK.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); };
  path(); ctx.strokeStyle = '#a8401a'; ctx.lineWidth = TW * 2 + 6; ctx.stroke();
  path(); ctx.strokeStyle = '#ff8a2a'; ctx.lineWidth = TW * 2; ctx.stroke();
  path(); ctx.strokeStyle = '#ffb060'; ctx.lineWidth = 2; ctx.setLineDash([8, 8]); ctx.stroke(); ctx.setLineDash([]);
  // rampa de libro
  const bk = trackPoint(7.0); ctx.save(); ctx.translate(bk.x, bk.y); ctx.rotate(bk.a); r(-8, -TW, 16, TW * 2, '#2f7d24'); r(-8, -TW, 2, TW * 2, '#fff4e0'); ctx.restore();
  // meta (cuadros)
  const st = trackPoint(0); ctx.save(); ctx.translate(st.x, st.y); ctx.rotate(st.a);
  for (let k = -TW; k < TW; k += 4) for (let j = 0; j < 2; j++) r(-4 + j * 4, k, 4, 4, ((k / 4) + j) % 2 ? '#000' : '#fff');
  ctx.restore();
  raceItems.turbo.forEach(t => { ctx.save(); ctx.translate(t.x, t.y); ctx.rotate(t.a); const b = Math.floor(now / 150) % 2; r(-7, -6, 14, 12, b ? '#ffc93c' : '#ffe08a'); r(-4, -3, 3, 6, '#e8443a'); r(1, -3, 3, 6, '#e8443a'); ctx.restore(); });
  raceItems.juice.forEach(t => { ctx.fillStyle = 'rgba(255,170,40,.85)'; ctx.beginPath(); ctx.ellipse(t.x, t.y, 9, 6, 0.4, 0, Math.PI * 2); ctx.fill(); r(t.x - 2, t.y - 2, 2, 2, '#fff3'); });
  // carros
  players.forEach((p, i) => {
    const c = p.car; if (!c) return;
    if (i !== myIdx && !solo) { c.dx = c.dx === undefined ? c.x : c.dx + (c.x - c.dx) * 0.3; c.dy = c.dy === undefined ? c.y : c.dy + (c.y - c.dy) * 0.3; } else { c.dx = c.x; c.dy = c.y; }
    if (solo && i !== myIdx) return;
    const col = p.ch === 'z' ? ['#ff7eb6', '#c4467f'] : ['#5b8cff', '#3352b8'];
    ctx.save(); ctx.translate(Math.round(c.dx), Math.round(c.dy)); ctx.rotate(c.a);
    if (c.boost > 0) { r(-12, -2, 4, 4, Math.floor(now / 60) % 2 ? '#ffc93c' : '#e8443a'); }
    r(-6, -5, 3, 2, '#111'); r(3, -5, 3, 2, '#111'); r(-6, 3, 3, 2, '#111'); r(3, 3, 3, 2, '#111');
    r(-7, -4, 14, 8, col[1]); r(-6, -3, 12, 6, col[0]); r(1, -2, 3, 4, '#bfe6ff'); r(-4, -1, 3, 2, p.ch === 'z' ? '#5a3220' : '#231a1a');
    ctx.restore();
  });
  players.forEach((p, i) => { const c = p.car; if (!c || (solo && i !== myIdx)) return; text(p.ch === 'z' ? 'Z' : 'P', Math.round(c.dx), Math.round(c.dy) - 16, p.ch === 'z' ? '#ff7eb6' : '#5b8cff', 6, 'center'); });
  // marcador
  const me = players[myIdx], mc = me && me.car;
  r(0, 0, VW, 14, 'rgba(20,12,36,.75)');
  if (mc) {
    text(`Vuelta ${Math.max(1, Math.min(LAPS, Math.floor(mc.tot / NT) + 1))}/${LAPS}`, 6, 4, '#ffc93c', 6);
    if (!solo) { const o = players[1 - myIdx], first = !o || !o.car || mc.tot >= o.car.tot; text(first ? '1° lugar' : '2° lugar', VW / 2, 4, first ? '#7cff7c' : '#fff4e0', 6, 'center'); }
    text(race.t.toFixed(1) + ' s', VW - 6, 4, '#fff4e0', 6, 'right');
  }
  if (race.cd > 0) {
    const n = Math.ceil(race.cd);
    text(n > 0 ? String(Math.min(3, n)) : '¡YA!', VW / 2, VH / 2 - 14, '#ffc93c', 24, 'center');
    text('Gran Premio de la Sala', VW / 2, VH / 2 + 18, '#ff7eb6', 8, 'center');
  } else if (race.cd > -1 && race.t < 0.8) text('¡YA!', VW / 2, VH / 2 - 14, '#ffc93c', 24, 'center');
  if (race.win >= 0) {
    const wch = players[race.win] && players[race.win].ch;
    r(0, VH / 2 - 22, VW, 44, 'rgba(20,12,36,.8)');
    text(solo ? '¡META!' : '¡GANÓ ' + (wch === 'z' ? 'ZAIRENE' : 'EL PALOMITO') + '!', VW / 2, VH / 2 - 10, '#ffc93c', 14, 'center');
  }
}
function render(dt) {
  ctx.setTransform(S, 0, 0, S, 0, 0); ctx.imageSmoothingEnabled = false;
  const now = performance.now();
  if (phase === 'race' || (phase === 'end' && lv === RACE)) renderRace(now);
  else if (phase === 'play' || phase === 'clear' || phase === 'end') renderLevel(now, dt);
  else { // fondo del menú
    r(0, 0, VW, VH, '#1b1430');
    for (let i = 0; i < 40; i++) { const x = (i * 97 + now / 40) % VW, y = (i * 53) % VH; r(x, y, 2, 2, i % 3 ? '#4a3d78' : '#ff7eb6'); }
  }
  if (!solo && (phase === 'play' || phase === 'race')) {
    const t = performance.now(); let msg = '';
    if (!isHost && t - lastRecv > 1500) msg = 'Reconectando...';
    if (isHost && players[1] && (!conn || t - lastRecvGuest > 2500)) msg = 'Esperando a tu pareja...';
    if (msg && Math.floor(t / 400) % 2) { r(0, 16, VW, 14, 'rgba(20,12,36,.85)'); text(msg, VW / 2, 20, '#ffc93c', 7, 'center'); }
  }
}

/* ======================= UI ======================= */
const nameOf = ch => ch === 'z' ? 'Zairene' : 'el Palomito';
const isTouch = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;
function setStatus(s) { $('status').textContent = s; }
function lobbyStatus(s) { $('lobbyStatus').textContent = s; }
function setPhase(p) {
  phase = p;
  ['menu', 'lobby', 'end'].forEach(id => $(id).classList.toggle('hidden', id !== p));
  $('help').classList.add('hidden');
  const playing = p === 'play' || p === 'race' || p === 'clear';
  $('touch').classList.toggle('hidden', !(isTouch && playing));
  $('sw').classList.toggle('hidden', !(solo && p === 'play'));
  $('bAl').textContent = p === 'race' ? 'FRENO' : 'SALTA';
  $('bB').classList.toggle('hidden', p === 'race');
  $('lobbyLv').classList.toggle('hidden', !isHost);
  if (p === 'end') showEnd();
  if (p === 'menu') { players = []; solo = false; }
  resize();
}
function showEnd() {
  const e = endInfo || { title: '', msg: '', next: 'Continuar' };
  $('endTitle').textContent = e.title; $('endMsg').textContent = e.msg;
  $('bNext').textContent = isHost ? e.next : 'Pedir: ' + e.next;
  $('endWait').textContent = isHost ? '' : 'Esperando a tu pareja…';
}
function drawPreview(id, ch) { const c = $(id), x = c.getContext('2d'); x.clearRect(0, 0, 12, 16); x.drawImage(SP[ch], 0, 0); }
drawPreview('cvz', 'z'); drawPreview('cvp', 'p');
document.querySelectorAll('.char').forEach(b => b.addEventListener('click', () => {
  myChar = b.dataset.ch;
  document.querySelectorAll('.char').forEach(o => o.classList.toggle('sel', o === b));
  ensureAudio(); play('pick');
}));
const lvBoxes = document.querySelectorAll('[data-lv]');
lvBoxes.forEach(box => {
  box.innerHTML = LEVELS.map((l, i) => `<button data-i="${i}"><span class="e">${l.e}</span>${i + 1}</button>`).join('') +
    `<button data-i="${RACE}" class="race"><span class="e">🏎️</span>Carreras</button>`;
  box.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    if (!isHost && phase !== 'menu') return;
    ensureAudio(); play('pick'); pickLv = +b.dataset.i; refreshLevelUI();
  }));
});
function refreshLevelUI() {
  lvBoxes.forEach(box => box.querySelectorAll('button').forEach(b => {
    const i = +b.dataset.i, locked = i === RACE ? up < 3 : i > up;
    b.disabled = locked; b.classList.toggle('sel', i === pickLv);
    if (i < RACE) b.innerHTML = `<span class="e">${locked ? '🔒' : LEVELS[i].e}</span>${i + 1}`;
    else b.innerHTML = `<span class="e">${locked ? '🔒' : '🏎️'}</span>Carreras`;
  }));
}
pickLv = Math.min(up, 5); refreshLevelUI();
$('bCreate').onclick = () => { ensureAudio(); hostRoom(); };
$('bJoin').onclick = () => { ensureAudio(); joinRoom($('code').value); };
$('code').addEventListener('keydown', e => { if (e.key === 'Enter') { ensureAudio(); joinRoom($('code').value); } });
$('bSolo').onclick = () => { ensureAudio(); startSolo(); };
$('bHelp').onclick = () => $('help').classList.remove('hidden');
$('bHelpClose').onclick = () => $('help').classList.add('hidden');
$('bStart').onclick = () => { ensureAudio(); if (conn && conn.open) startPicked(); };
$('bLeave').onclick = () => { closeNet(); setPhase('menu'); setStatus(''); };
$('bMenu').onclick = () => { closeNet(); setPhase('menu'); setStatus(''); refreshLevelUI(); };
$('bNext').onclick = () => {
  ensureAudio();
  if (isHost) { if (solo || (conn && conn.open)) nextFromEnd(); else setPhase('lobby'); }
  else if (conn && conn.open) { conn.send({ t: 'next' }); $('endWait').textContent = 'Pedido enviado ♥'; }
};
$('bShare').onclick = async () => {
  const url = location.origin + location.pathname + '?sala=' + roomCode;
  const msg = `¡Ven a jugar Mitades conmigo! 💞 Código: ${roomCode}\n${url}`;
  try {
    if (navigator.share) await navigator.share({ title: 'Mitades', text: msg, url });
    else { await navigator.clipboard.writeText(msg); lobbyStatus('¡Enlace copiado! Pégalo en WhatsApp 💌'); }
  } catch (e) {
    try { await navigator.clipboard.writeText(msg); lobbyStatus('¡Enlace copiado! Pégalo en WhatsApp 💌'); } catch (e2) { lobbyStatus('Código: ' + roomCode); }
  }
};
$('fs').onclick = () => {
  const d = document;
  if (!d.fullscreenElement) { (d.documentElement.requestFullscreen || d.documentElement.webkitRequestFullscreen || (() => { })).call(d.documentElement); try { screen.orientation.lock('landscape').catch(() => { }); } catch (e) { } }
  else (d.exitFullscreen || d.webkitExitFullscreen).call(d);
};
const qs = new URLSearchParams(location.search).get('sala');
if (qs) { $('code').value = qs.toUpperCase(); setStatus('Te invitaron 💌 Elige quién eres y toca Unirse'); }

function resize() {
  const vw = innerWidth, vh = innerHeight;
  const playing = phase === 'play' || phase === 'race' || phase === 'clear';
  const pad = isTouch && playing ? 0 : 24;
  const sc = Math.max(0.5, Math.min((vw - pad) / VW, (vh - pad) / VH));
  const cw = Math.floor(VW * sc), ch = Math.floor(VH * sc);
  const dpr = Math.min(3, devicePixelRatio || 1);
  cv.style.width = cw + 'px'; cv.style.height = ch + 'px';
  cv.style.left = Math.floor((vw - cw) / 2) + 'px'; cv.style.top = Math.floor((vh - ch) / 2) + 'px';
  cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
  S = cv.width / VW;
  $('rot').classList.toggle('hidden', !(isTouch && vh > vw));
}
addEventListener('resize', resize);
addEventListener('orientationchange', () => setTimeout(resize, 200));
resize();

/* ======================= BUCLE ======================= */
let last = performance.now(), lastR = performance.now(), sendAcc = 0, pingAcc = 0, rtt = -1;
function tick() {
  const now = performance.now();
  let dt = Math.min(0.5, (now - last) / 1000); last = now;
  while (dt > 0) {
    const step = Math.min(1 / 120, dt); dt -= step;
    moveLocal(step);
    if (isHost) { updateWorld(step); updateHost(step); }
    updateEffects(step);
    if (hintT > 0 && phase === 'play') hintT -= step;
    if (phase === 'race' && !isHost && race.cd <= 0) race.t += step;
  }
  sendAcc += (now - (tick.prev || now)) / 1000; tick.prev = now;
  if (sendAcc >= 1 / 15) {
    sendAcc = 0;
    if (conn && conn.open) { if (canStream()) { if (isHost) conn.send(snapshot()); else if (phase === 'play' || phase === 'race') sendPos(); } }
    else if (isHost) sndQ = [];
  }
  if (!isHost && !solo && roomJoined && phase !== 'menu' && now - lastRecv > 3500) guestReconnect();
  pingAcc += 1 / 60;
  if (!isHost && conn && conn.open && pingAcc >= 2) { pingAcc = 0; conn.send({ t: 'ping', ts: performance.now() }); }
}
function canStream() { const dc = conn.dataChannel; return (conn.bufferSize || 0) === 0 && (!dc || dc.bufferedAmount < 6000); }
try {
  const wk = new Worker(URL.createObjectURL(new Blob(['setInterval(()=>postMessage(0),16)'], { type: 'text/javascript' })));
  wk.onmessage = tick;
} catch (e) { setInterval(tick, 1000 / 60); }
function loop(ts) {
  const dt = Math.min(0.05, (ts - lastR) / 1000); lastR = ts;
  render(dt);
  requestAnimationFrame(loop);
}
if (document.fonts && document.fonts.load) document.fonts.load("8px 'Press Start 2P'");
requestAnimationFrame(loop);

/* ======================= DESCARGAR (PWA) ======================= */
if ('serviceWorker' in navigator && location.protocol !== 'file:') addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { }));
const standalone = matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone;
let installEv = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEv = e; $('bInstall').classList.remove('hidden'); });
$('bInstall').onclick = async () => { if (!installEv) return; installEv.prompt(); try { await installEv.userChoice; } catch (e) { } installEv = null; $('bInstall').classList.add('hidden'); };
addEventListener('appinstalled', () => { $('bInstall').classList.add('hidden'); setStatus('¡Descargado! Ábrelo desde su ícono.'); });
if (!standalone && /iPhone|iPad|iPod/.test(navigator.userAgent)) $('iosHint').classList.remove('hidden');
