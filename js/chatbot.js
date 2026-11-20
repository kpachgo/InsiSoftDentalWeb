// Asistente de preguntas frecuentes: respuestas predefinidas, sin IA.
// Las preguntas viven en chatbot-preguntas.txt (formato explicado dentro del archivo).
const WA_URL = 'https://wa.me/50372682797?text=';
const WA_LINK = '<a href="' + WA_URL + 'Hola%2C%20tengo%20una%20pregunta%20sobre%20InciSoft" target="_blank" rel="noopener">pregúntanos por WhatsApp</a>';
const FALLBACK = 'No tengo esa respuesta todavía. Prueba con otras palabras o ' + WA_LINK + '.';
const SUGERENCIAS = 3; // cuántas preguntas sugeridas se ven a la vez

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const tokens = (s) => norm(s).split(/[^a-zñ0-9]+/).filter(Boolean);

// Bloques separados por línea en blanco. P: pregunta (sin P: queda oculta, p. ej. saludos),
// C: palabras clave, R: respuesta (puede seguir en varias líneas), S: grupo de sinónimos.
function parse(txt) {
  const faq = [], syn = [];
  for (const block of txt.split(/\r?\n\s*\r?\n/)) {
    const item = { q: '', k: [], a: [] };
    let inAnswer = false;
    for (const line of block.split(/\r?\n/)) {
      if (line.trim().startsWith('#')) continue;
      const m = line.match(/^\s*([PCRS]):\s*(.*)$/i);
      const tag = m && m[1].toUpperCase();
      if (tag === 'P') { item.q = m[2].trim(); inAnswer = false; }
      else if (tag === 'C') { item.k = m[2].split(',').map((k) => norm(k.trim())).filter(Boolean); inAnswer = false; }
      else if (tag === 'R') { item.a.push(m[2]); inAnswer = true; }
      else if (tag === 'S') { syn.push(m[2].split(/[=,]/).map((w) => norm(w.trim())).filter(Boolean)); inAnswer = false; }
      else if (inAnswer) item.a.push(line);
    }
    const a = item.a.join('<br>').trim();
    if (a && (item.q || item.k.length)) faq.push({ q: item.q, k: item.k, a });
  }
  return { faq, syn };
}

// Distancia de edición: cuántas letras hay que cambiar para pasar de a a b.
function lev(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}

// 2 = coincide (o empieza igual), 1 = parecida con error de dedo, 0 = no.
function wordMatch(w, k) {
  if (k.length <= 3) return w === k ? 2 : 0; // claves cortas ("ia", "pro") solo exactas
  if (w.startsWith(k)) return 2;
  const tol = k.length >= 8 ? 2 : k.length >= 5 ? 1 : 0;
  return tol && Math.min(lev(w, k), lev(w.slice(0, k.length), k)) <= tol ? 1 : 0;
}

// Palabras del visitante + los sinónimos de cada una.
function expand(text, syn) {
  const words = tokens(text);
  for (const group of syn) {
    if (words.some((w) => group.some((s) => wordMatch(w, s) === 2))) words.push(...group);
  }
  return words;
}

function score(item, words, text) {
  return item.k.reduce((sum, k) => sum + (k.includes(' ') ? (norm(text).includes(k) ? 2 : 0)
    : Math.max(0, ...words.map((w) => wordMatch(w, k)))), 0);
}

// Decide qué contestar: una respuesta, varias opciones ("¿te refieres a…?") o nada.
function decide(db, text, last) {
  const words = expand(text, db.syn);
  let ranked = db.faq.map((item) => [score(item, words, text), item]).filter(([s]) => s > 0);
  // "hola, ¿cuánto cuesta?": si hay una pregunta real, gana sobre el saludo.
  if (ranked.some(([, i]) => i.q)) ranked = ranked.filter(([, i]) => i.q);
  ranked.sort((a, b) => b[0] - a[0]);
  if (!ranked.length) return { options: suggest(db, text).filter((i) => score(i, tokens(text), text) || partial(i, text)) };
  const ties = ranked.filter(([s]) => s === ranked[0][0]).map(([, i]) => i);
  if (ties.length === 1) return { item: ties[0] };
  if (last && ties.includes(last)) return { item: last }; // empate: sigue el tema anterior
  if (!ties[0].q) return { item: ties[0] }; // empate entre ocultas (charla): la primera del archivo
  return { options: ties.slice(0, SUGERENCIAS) };
}

// Coincidencias de lo que se va escribiendo ("impr" → imprimir).
function partial(item, text) {
  const pool = item.k.concat(tokens(item.q).filter((w) => w.length > 4)); // sin "que", "como"…
  return tokens(text).filter((w) => w.length > 2 && pool.some((p) => p.startsWith(w))).length;
}

// Sugerencias: las más parecidas a lo escrito; si nada se parece, las primeras del archivo.
function suggest(db, text) {
  const visible = db.faq.filter((i) => i.q);
  const words = expand(text, db.syn);
  const ranked = visible.map((i) => [score(i, words, text) * 2 + partial(i, text), i]).filter(([s]) => s > 0).sort((a, b) => b[0] - a[0]);
  return (ranked.length ? ranked.map(([, i]) => i) : visible).slice(0, SUGERENCIAS);
}

const bot = document.querySelector('.bot');
if (bot) {
  const toggle = bot.querySelector('.bot-toggle');
  const panel = bot.querySelector('.bot-panel');
  const log = bot.querySelector('.bot-log');
  const chips = bot.querySelector('.bot-chips');
  const form = bot.querySelector('.bot-form');
  let db = { faq: [], syn: [] };
  let last = null; // última pregunta respondida, para el contexto

  const optionButtons = (items) => items.map((item) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = item.q;
    b.onclick = () => { form.reset(); showChips(''); ask(item.q, { item }); };
    return b;
  });
  const say = (html, who, options) => {
    const p = document.createElement('div');
    p.className = 'bot-msg ' + who;
    if (who === 'yo') p.textContent = html; // texto del visitante: nunca como HTML
    else p.innerHTML = html; // respuestas del archivo propio de la clínica
    if (options?.length) {
      const box = document.createElement('div');
      box.className = 'bot-opts';
      box.append(...optionButtons(options));
      p.append(box);
    }
    log.append(p);
    log.scrollTop = log.scrollHeight;
  };
  const reply = ({ item, options }) => {
    if (item) {
      if (item.q) last = item;
      return say(item.a.replaceAll('{tema}', last ? '«' + last.q + '»' : 'InciSoft'), 'el');
    }
    if (options?.length) return say(options.length === 1 ? '¿Te refieres a esto?' : '¿Te refieres a alguna de estas?', 'el', options);
    say(FALLBACK, 'el');
  };
  const ask = (text, result) => {
    say(text, 'yo');
    log.querySelector('.bot-typing')?.remove(); // si preguntan rápido, solo un indicador a la vez
    const typing = document.createElement('p');
    typing.className = 'bot-msg el bot-typing';
    typing.setAttribute('aria-label', 'Escribiendo');
    typing.innerHTML = '<i></i><i></i><i></i>';
    log.append(typing);
    log.scrollTop = log.scrollHeight;
    setTimeout(() => { typing.remove(); reply(result); }, 700);
  };

  const showChips = (text) => chips.replaceChildren(...optionButtons(suggest(db, text)));
  form.elements.q.addEventListener('input', (e) => showChips(e.target.value));

  // ?v= evita que el navegador muestre una versión vieja del archivo tras editarlo.
  fetch('chatbot-preguntas.txt?v=' + Date.now())
    .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
    .then((txt) => {
      db = parse(txt);
      showChips('');
    })
    .catch((err) => {
      console.warn('No se pudo cargar chatbot-preguntas.txt', err);
      if (location.protocol === 'file:') chips.textContent = 'Abre la página con un servidor (ej. Live Server) para cargar las preguntas.';
    });

  const setOpen = (open) => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', open);
    if (open && !log.childElementCount) say('¡Hola! 👋 Soy el asistente de InciSoft. ¿En qué te ayudo?', 'el');
    if (open) form.elements.q.focus();
  };
  toggle.onclick = () => setOpen(panel.hidden);
  bot.querySelector('.bot-close').onclick = () => { setOpen(false); toggle.focus(); };
  bot.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { setOpen(false); toggle.focus(); } });
  // Los enlaces internos (#planes, #cotizar) cierran el chat para que se vea la sección.
  log.addEventListener('click', (e) => { if (e.target.closest('a[href^="#"]')) setOpen(false); });

  form.onsubmit = (e) => {
    e.preventDefault();
    const text = form.elements.q.value.trim().slice(0, 200);
    if (!text) return;
    form.reset();
    showChips('');
    ask(text, decide(db, text, last));
  };
}
