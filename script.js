'use strict';
/* ---------- utilidades ---------- */
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const show = id => $$('.screen').forEach(e => e.hidden = e.id !== id);
document.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) show(b.dataset.go); });

const CATS = {
  'Famosos': ['Neymar','Silvio Santos','Ayrton Senna','Michael Jackson','Albert Einstein','Pelé','Xuxa','Anitta','Cristiano Ronaldo','Marilyn Monroe','Leonardo da Vinci','Chaves','Gisele Bündchen','Elvis Presley','Charlie Chaplin','Dom Pedro I','Messi','Fernanda Montenegro'],
  'Animais': ['Leão','Pinguim','Girafa','Tubarão','Camaleão','Polvo','Panda','Canguru','Coruja','Tamanduá','Onça-pintada','Elefante','Golfinho','Preguiça','Jacaré','Borboleta','Arara','Lobo-guará'],
  'Personagens': ['Harry Potter','Homem-Aranha','Mickey Mouse','Shrek','Mario','Pikachu','Batman','Cebolinha','Mulher-Maravilha','Sherlock Holmes','Darth Vader','Elsa','Goku','Saci Pererê','Chapeuzinho Vermelho','Peppa Pig','Bob Esponja','Naruto'],
  'Profissões': ['Bombeiro','Astronauta','Padeiro','Dentista','Piloto','Palhaço','Detetive','Cantor','Jardineiro','Juiz','Pescador','Cozinheiro','Mágico','Professor','Motorista de ônibus','Veterinário','Arquiteto','Cabeleireiro'],
  'Objetos': ['Guarda-chuva','Geladeira','Violão','Escova de dentes','Bicicleta','Relógio','Óculos','Micro-ondas','Chinelo','Vassoura','Controle remoto','Espelho','Cadeado','Mochila','Ventilador','Panela de pressão','Bola de futebol','Lanterna'],
  'Comidas': ['Pizza','Brigadeiro','Feijoada','Coxinha','Sushi','Pão de queijo','Hambúrguer','Pipoca','Sorvete','Açaí','Macarrão','Tapioca','Churrasco','Pastel','Banana','Melancia','Chocolate','Queijo']
};
const pool = c => c === 'Misto' ? Object.values(CATS).flat() : CATS[c];
const pick = (c, n) => { const a = [...pool(c)]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); };
['#cat', '#lCat'].forEach(s => $(s).innerHTML = ['Misto', ...Object.keys(CATS)].map(c => `<option>${c}</option>`).join(''));

/* ================= MODO LOCAL ================= */
let L = { n: ['', ''] };
function lRender() {
  $('#lNomes').innerHTML = L.n.map((v, i) => `<div class="row"><input data-i="${i}" maxlength="14" placeholder="Jogador ${i + 1}" value="${esc(v)}">${L.n.length > 2 ? `<button class="btn small danger" data-del="${i}" aria-label="Remover jogador ${i + 1}" style="flex:0">✕</button>` : ''}</div>`).join('');
  $('#lAdd').hidden = L.n.length >= 16;
}
$('#lNomes').addEventListener('input', e => { if (e.target.dataset.i) L.n[e.target.dataset.i] = e.target.value; });
$('#lNomes').addEventListener('click', e => { const d = e.target.dataset.del; if (d !== undefined) { L.n.splice(d, 1); lRender(); } });
$('#lAdd').onclick = () => { L.n.push(''); lRender(); };
lRender();

$('#lStart').onclick = () => {
  const names = L.n.map((v, i) => v.trim() || `Jogador ${i + 1}`), c = pick($('#lCat').value, names.length);
  L = { n: L.n, p: names.map((n, i) => ({ n, c: c[i], q: 0, ok: 0 })), i: 0, t: +$('#lTempo').value, msg: '', run: 0 };
  lTurn();
};
function lShow(v) {
  L.vis = v; $('#lCard').textContent = v ? L.p[L.i].c : '▒▒▒'; $('#lCard').classList.toggle('hid', !v);
  $('#lToggle').textContent = v ? 'Esconder personagem' : 'Mostrar personagem';
}
function lTurn() {
  clearInterval(L.tm); L.run = 0; L.sec = L.t; show('lTurn');
  $('#lMsg').textContent = L.msg;
  $('#lVez').textContent = `Vez de ${L.p[L.i].n} (${L.i + 1}/${L.p.length})`;
  $('#lQ').textContent = 0; $('#lT').textContent = L.t ? `⏱ ${L.t}s` : '';
  lShow(false);
}
const tick = () => { $('#lT').textContent = `⏱ ${Math.max(L.sec, 0)}s`; if (L.sec-- <= 0) lDone(0, true); };
$('#lToggle').onclick = () => {
  if (!L.run && L.t) { L.run = 1; L.tm = setInterval(tick, 1000); tick(); }
  lShow(!L.vis);
};
$('#lPlus').onclick = () => { $('#lQ').textContent = ++L.p[L.i].q; };
$('#lOk').onclick = () => lDone(1);
$('#lSkip').onclick = () => lDone(0);
function lDone(ok, timeout) {
  clearInterval(L.tm); L.run = 0;
  const p = L.p[L.i]; p.ok = ok;
  L.msg = ok ? `🎉 ${p.n} acertou: ${p.c} (${p.q} perguntas)` : `${timeout ? '⏱ Tempo esgotado!' : 'Desistiu.'} ${p.n} era: ${p.c}`;
  if (++L.i >= L.p.length) lEnd(); else lTurn();
}
function lEnd() {
  show('lEnd'); $('#lFinal').textContent = L.msg;
  const r = [...L.p].sort((a, b) => b.ok - a.ok || a.q - b.q);
  $('#lRank').innerHTML = r.map(p => `<li><b>${esc(p.n)}</b>: ${esc(p.c)} · ${p.ok ? p.q + ' perguntas' : 'não descobriu'}</li>`).join('');
}

/* ================= MODO ONLINE (salas via PeerJS / WebRTC) ================= */
let peer, hc, isHost = false, left = false, conns = {}, G = null, S = null;
/* Servidores de conexão. Para redes difíceis (4G x Wi-Fi), cadastre-se grátis em metered.ca e cole seus servidores TURN em TURN_EXTRA. */
const TURN_EXTRA = [];
const ICE = { config: { iceServers: [
  { urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' },
  { urls: ['turn:openrelay.metered.ca:80', 'turn:openrelay.metered.ca:443', 'turn:openrelay.metered.ca:443?transport=tcp'], username: 'openrelayproject', credential: 'openrelayproject' },
  ...TURN_EXTRA] } };
const tok = sessionStorage.getItem('qse_tok') || (() => { const t = Math.random().toString(36).slice(2, 12); sessionStorage.setItem('qse_tok', t); return t; })();
let sess = null, rt = 0, gen = 0, lostAt = 0, wl = null;
async function wake() { try { if ('wakeLock' in navigator && !document.hidden) wl = await navigator.wakeLock.request('screen'); } catch {} }
const CH = 'ABCDEFGHJKLMNPQRSTUVWXYZ', PID = c => 'quemsoueu-' + c;
const mkCode = () => Array.from({ length: 5 }, () => CH[Math.random() * CH.length | 0]).join('');
const status = m => $('#msg').textContent = m;
function getName() { const n = $('#nome').value.trim().slice(0, 14); if (!n) status('Digite seu nome.'); return n; }
const send = m => isHost ? act('host', m) : hc && hc.open && hc.send(m);

/* --- anfitrião: guarda o estado verdadeiro do jogo --- */
function createRoom() {
  const name = getName(); if (!name) return;
  peer && peer.destroy(); left = false; status('Criando sala…');
  const code = mkCode(); peer = new Peer(PID(code), ICE);
  peer.on('open', () => {
    isHost = true;
    G = { code, phase: 'lobby', cat: 'Misto', turn: 0, pending: null, last: '', log: [], players: [{ id: 'host', name, connected: true }] };
    peer.on('connection', hostConn); broadcast();
  });
  peer.on('error', e => { if (e.type === 'unavailable-id') createRoom(); else status('Erro de conexão: ' + e.type); });
}
function hostConn(c) {
  c.on('data', m => {
    if (m.t === 'join') {
      const t = String(m.tok || '').slice(0, 24); if (!t || t === 'host') return;
      const ex = G.players.find(p => p.id === t);
      if (!ex && (G.phase !== 'lobby' || G.players.length >= 16)) { c.send({ t: 'err', msg: G.phase !== 'lobby' ? 'O jogo já começou.' : 'Sala cheia (16 jogadores).' }); setTimeout(() => c.close(), 400); return; }
      const old = conns[t]; conns[t] = c; c.tok = t; if (old && old !== c) old.close();
      if (ex) ex.connected = true;
      else { let nm = String(m.name || 'Jogador').slice(0, 14), k = 2; const base = nm; while (G.players.some(p => p.name === nm)) nm = `${base} ${k++}`; G.players.push({ id: t, name: nm, connected: true }); }
      broadcast();
    } else if (c.tok && conns[c.tok] === c) act(c.tok, m);
  });
  c.on('close', () => { if (c.tok && conns[c.tok] === c) drop(c.tok); });
}
function act(id, m) {
  const P = G.players.find(p => p.id === id); if (!P) return;
  const T = G.players[G.turn], pd = G.pending;
  if (id === 'host' && m.t === 'cfg' && G.phase === 'lobby' && (m.cat === 'Misto' || CATS[m.cat])) G.cat = m.cat;
  else if (id === 'host' && m.t === 'start' && G.phase === 'lobby' && G.players.length >= 2) start();
  else if (id === 'host' && m.t === 'again' && G.phase === 'end') { G.players = G.players.filter(p => p.connected); G.phase = 'lobby'; G.pending = null; G.log = []; G.last = ''; }
  else if (G.phase === 'play' && !pd && T === P && (m.t === 'ask' || m.t === 'guess') && String(m.text || '').trim())
    G.pending = { kind: m.t, by: id, text: String(m.text).trim().slice(0, 120), ans: {} };
  else if (G.phase === 'play' && pd && m.t === 'ans' && id !== pd.by && ['sim', 'nao', 'talvez'].includes(m.v) && !(pd.kind === 'guess' && m.v === 'talvez'))
    pd.ans[id] = m.v;
  check(); broadcast();
}
function start() {
  const ch = pick(G.cat, G.players.length);
  G.players.forEach((p, i) => { p.character = ch[i]; p.done = 0; p.rank = 0; p.q = 0; });
  G.phase = 'play'; G.pending = null; G.log = []; G.last = ''; G.turn = G.players.length - 1; next();
}
function next() {
  if (G.players.filter(x => x.connected && !x.done).length <= 1) { G.phase = 'end'; return; }
  let i = G.turn; do { i = (i + 1) % G.players.length; } while (!(G.players[i].connected && !G.players[i].done));
  G.turn = i;
}
function check() {
  const p = G.pending; if (!p || G.phase !== 'play') return;
  const a = G.players.find(x => x.id === p.by), el = G.players.filter(x => x.connected && x.id !== p.by);
  if (!a.connected || !el.length) { G.pending = null; next(); return; }
  if (!el.every(x => p.ans[x.id])) return;
  const s = el.filter(x => p.ans[x.id] === 'sim').length, n = el.filter(x => p.ans[x.id] === 'nao').length;
  let keep = false; a.q++;
  if (p.kind === 'ask') { keep = s > n; G.last = `${a.name}: “${p.text}” → ${keep ? 'Sim' : 'Não'} (${s} sim, ${n} não)`; }
  else if (s >= n) { a.done = 1; a.rank = G.players.filter(x => x.done).length; G.last = `🎉 ${a.name} acertou: ${a.character}!`; }
  else G.last = `❌ ${a.name} errou o palpite “${p.text}”`;
  G.log.unshift(G.last); G.pending = null;
  if (!keep) next();
}
function drop(id) {
  if (!G) return; const i = G.players.findIndex(p => p.id === id); if (i < 0) return;
  delete conns[id];
  if (G.phase === 'lobby') G.players.splice(i, 1);
  else {
    G.players[i].connected = false;
    if (G.phase === 'play') {
      if (G.players[G.turn].id === id && !G.pending) next(); else check();
      if (G.phase === 'play' && G.players.filter(x => x.connected && !x.done).length <= 1) G.phase = 'end';
    }
  }
  broadcast();
}
/* cada jogador recebe a visão dele: nunca vê o próprio personagem */
const view = rid => ({
  code: G.code, phase: G.phase, cat: G.cat, turn: G.turn, pending: G.pending, last: G.last, log: G.log.slice(0, 30), you: rid,
  players: G.players.map(p => ({ id: p.id, name: p.name, connected: p.connected, done: p.done, rank: p.rank, q: p.q,
    character: (G.phase === 'end' || (G.phase === 'play' && p.id !== rid)) ? p.character : null }))
});
function broadcast() {
  for (const id in conns) if (conns[id].open) conns[id].send({ t: 's', s: view(id) });
  S = view('host'); render();
}

/* --- convidado (reconecta sozinho se o celular travar a tela ou a rede cair) --- */
function joinRoom() {
  const name = getName(), code = $('#codigo').value.trim().toUpperCase();
  if (!name) return; if (code.length < 4) return status('Digite o código da sala.');
  left = false; sess = { code, name }; status('Conectando…'); connectTo();
}
function connectTo() {
  const my = ++gen; try { peer && peer.destroy(); } catch {}
  peer = new Peer(undefined, ICE);
  const fail = msg => { if (my !== gen) return; if (S) lost(); else { status(msg); try { peer.destroy(); } catch {} } };
  peer.on('open', () => {
    if (my !== gen) return;
    hc = peer.connect(PID(sess.code), { reliable: true });
    const tm = setTimeout(() => fail('Sala não encontrada. Confira o código.'), 12000);
    hc.on('open', () => { clearTimeout(tm); if (my === gen) hc.send({ t: 'join', name: sess.name, tok }); });
    hc.on('data', m => {
      if (my !== gen) return;
      if (m.t === 's') { S = m.s; lostAt = 0; clearTimeout(rt); $('#net').hidden = true; render(); }
      else if (m.t === 'err') bye(m.msg);
    });
    hc.on('close', () => { if (my === gen) lost(); });
  });
  peer.on('error', e => fail(e.type === 'peer-unavailable' ? 'Sala não encontrada. Confira o código.' : 'Erro de conexão: ' + e.type));
}
function lost() {
  if (left || !S || isHost) return;
  lostAt = lostAt || Date.now(); $('#net').hidden = false; clearTimeout(rt);
  rt = setTimeout(() => Date.now() - lostAt > 90000 ? bye('Conexão perdida com a sala.') : connectTo(), 2000);
}
function bye(msg) { left = true; ++gen; clearTimeout(rt); lostAt = 0; $('#net').hidden = true; try { peer.destroy(); } catch {} S = G = sess = null; isHost = false; show('onMenu'); status(msg); }
function leave() { left = true; ++gen; clearTimeout(rt); lostAt = 0; $('#net').hidden = true; try { peer && peer.destroy(); } catch {} peer = hc = sess = null; conns = {}; G = S = null; isHost = false; show('home'); }
document.addEventListener('visibilitychange', () => {
  if (document.hidden || !S) return;
  if (S.phase === 'play') wake();
  if (!isHost && !left && sess && !(hc && hc.open)) { lostAt = lostAt || Date.now(); connectTo(); }
});

/* --- telas --- */
function render() {
  if (!S) return;
  if (S.phase === 'lobby') {
    show('lobby'); $('#cod').textContent = S.code; $('#cnt').textContent = `${S.players.length}/16 jogadores (mínimo 2)`;
    $('#lista').innerHTML = S.players.map(p => `<li class="pl"><b>${esc(p.name)}</b>${p.id === 'host' ? '<small>anfitrião</small>' : ''}</li>`).join('');
    $('#cfg').hidden = !isHost; $('#espera').hidden = isHost; $('#iniciar').disabled = S.players.length < 2; $('#cat').value = S.cat;
  } else if (S.phase === 'play') { show('game'); renderGame(); }
  else {
    show('end');
    const d = S.players.filter(p => p.done).sort((a, b) => a.rank - b.rank), r = S.players.filter(p => !p.done);
    $('#rank').innerHTML = d.map(p => `<li><b>${esc(p.name)}</b>: ${esc(p.character)} · ${p.q} tentativas</li>`).join('')
      + r.map(p => `<li><b>${esc(p.name)}</b>: ${esc(p.character)} · não descobriu</li>`).join('');
    $('#again').hidden = !isHost; $('#espera2').hidden = isHost;
  }
}
function renderGame() {
  $('#cod2').textContent = S.code; if (!wl || wl.released) wake();
  $('#jog').innerHTML = S.players.map((p, i) => {
    const eu = p.id === S.you;
    return `<li class="pl${i === S.turn ? ' cur' : ''}${p.done ? ' ok' : ''}${p.connected ? '' : ' off'}"><b>${esc(p.name)}${eu ? ' (você)' : ''}</b><span class="note${eu ? ' hid' : ''}">${eu ? (p.done ? '🎉' : '▒▒ OCULTO ▒▒') : esc(p.character)}</span>${p.done ? `<small>#${p.rank} a acertar</small>` : ''}</li>`;
  }).join('');
  const T = S.players[S.turn], pd = S.pending, keep = $('#txt') ? $('#txt').value : '';
  let h;
  if (pd) {
    const a = S.players.find(p => p.id === pd.by), g = pd.kind === 'guess', n = S.players.filter(p => p.connected && p.id !== pd.by).length;
    h = `<p>${esc(a.name)} ${g ? 'quer adivinhar' : 'pergunta'}:</p><p class="q">“${esc(pd.text)}”</p>`;
    if (pd.by === S.you || pd.ans[S.you]) h += `<p class="sub">Respostas: ${Object.keys(pd.ans).length}/${n}</p>`;
    else h += `<div class="row">${(g ? [['sim', '✔ Acertou'], ['nao', '✘ Errou']] : [['sim', '👍 Sim'], ['nao', '👎 Não'], ['talvez', '🤷 Talvez']]).map(([v, t]) => `<button class="btn" data-ans="${v}">${t}</button>`).join('')}</div>`;
  } else if (T.id === S.you) {
    h = `<p><b>Sua vez!</b> Faça uma pergunta de sim ou não, ou arrisque um palpite.</p><input id="txt" maxlength="120" placeholder="Sou uma pessoa real?"><div class="row"><button class="btn" data-act="ask">Perguntar</button><button class="btn alt" data-act="guess">Tentar adivinhar</button></div>`;
  } else h = `<p>Vez de <b>${esc(T.name)}</b>. Responda quando ele perguntar.</p>`;
  $('#acao').innerHTML = h;
  if ($('#txt')) { $('#txt').value = keep; if (keep) $('#txt').focus(); }
  $('#ult').textContent = S.last; $('#hist').innerHTML = S.log.map(l => `<li>${esc(l)}</li>`).join('');
}

/* --- eventos --- */
$('#acao').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.ans) send({ t: 'ans', v: b.dataset.ans });
  if (b.dataset.act) { const t = $('#txt').value.trim(); if (t) send({ t: b.dataset.act, text: t }); }
});
$('#acao').addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'txt' && e.target.value.trim()) send({ t: 'ask', text: e.target.value.trim() });
});
$('#criar').onclick = createRoom; $('#entrar').onclick = joinRoom;
$('#iniciar').onclick = () => send({ t: 'start' });
$('#cat').onchange = e => send({ t: 'cfg', cat: e.target.value });
$('#again').onclick = () => send({ t: 'again' });
['#sair1', '#sair2', '#sair3'].forEach(s => $(s).onclick = leave);
$('#copiar').onclick = () => {
  const url = location.origin + location.pathname + '?sala=' + S.code, b = $('#copiar');
  (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => { b.textContent = 'Link copiado!'; setTimeout(() => b.textContent = 'Copiar link de convite', 2000); }).catch(() => prompt('Copie o link:', url));
};
const q = new URLSearchParams(location.search).get('sala');
if (q) { show('onMenu'); $('#codigo').value = q.toUpperCase().slice(0, 5); }
