document.getElementById('year').textContent = new Date().getFullYear();

(function buildStarfield() {
  const field = document.getElementById('starfield');
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 50; i++) {
    const star = document.createElement('span');
    const size = (Math.random() * 1.4 + 0.8).toFixed(2);
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.left = (Math.random() * 100).toFixed(2) + '%';
    star.style.top = (Math.random() * 100).toFixed(2) + '%';
    star.style.opacity = (Math.random() * 0.5 + 0.2).toFixed(2);
    frag.appendChild(star);
  }
  field.appendChild(frag);
})();

const cursorDot = document.getElementById('cursorDot');
const isFinePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

if (isFinePointer) {
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let dotX = mouseX, dotY = mouseY;

  window.addEventListener('pointermove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });

  (function animateCursor() {
    dotX += (mouseX - dotX) * 0.2;
    dotY += (mouseY - dotY) * 0.2;
    cursorDot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateCursor);
  })();

  document.addEventListener('pointerdown', () => cursorDot.classList.add('press'));
  document.addEventListener('pointerup', () => cursorDot.classList.remove('press'));

  const HOVERABLE = 'a, button, .key, input, textarea';
  document.addEventListener('pointerover', (e) => { if (e.target.closest(HOVERABLE)) cursorDot.classList.add('hover'); });
  document.addEventListener('pointerout',  (e) => { if (e.target.closest(HOVERABLE)) cursorDot.classList.remove('hover'); });
} else {
  cursorDot.style.display = 'none';
}

const heroSection = document.getElementById('skills');
const heroPin = document.getElementById('heroPin');
const HERO_DONE_AT = 0.7;

const heroScrollRange = () => heroSection.offsetHeight - window.innerHeight;

function updateHero() {
  const rect = heroSection.getBoundingClientRect();
  let p = -rect.top / heroScrollRange();
  p = Math.min(1, Math.max(0, p / HERO_DONE_AT));
  const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  heroPin.style.setProperty('--p', eased.toFixed(4));
}

let heroTick = false;
window.addEventListener('scroll', () => {
  if (heroTick) return;
  heroTick = true;
  requestAnimationFrame(() => { updateHero(); heroTick = false; });
}, { passive: true });
window.addEventListener('resize', updateHero);
updateHero();

document.querySelectorAll('a[href="#skills"]').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const top = heroSection.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + heroScrollRange() * HERO_DONE_AT, behavior: 'smooth' });
  });
});

const SPLINE_SCENE_URL = '';
const SPLINE_LOAD_TIMEOUT_MS = 6000;

const splineWrap = document.getElementById('splineWrap');
const splineViewerEl = document.getElementById('splineViewer');
const keyboardFallback = document.getElementById('keyboard3d');

function useCssFallback() { splineWrap.hidden = true; keyboardFallback.hidden = false; }
function useSplineScene() { splineWrap.hidden = false; keyboardFallback.hidden = true; }

function initSplineViewer() {
  if (!SPLINE_SCENE_URL) { useCssFallback(); return; }

  const started = Date.now();
  const timeoutId = setTimeout(() => {
    console.warn('Spline: tempo de carregamento excedido, usando fallback CSS.');
    useCssFallback();
  }, SPLINE_LOAD_TIMEOUT_MS);

  const tryStart = () => {
    if (!window.customElements.get('spline-viewer')) {
      if (Date.now() - started > SPLINE_LOAD_TIMEOUT_MS) return;
      requestAnimationFrame(tryStart);
      return;
    }
    splineViewerEl.setAttribute('url', SPLINE_SCENE_URL);
    splineViewerEl.addEventListener('load', () => { clearTimeout(timeoutId); useSplineScene(); }, { once: true });
    splineViewerEl.addEventListener('error', () => {
      clearTimeout(timeoutId);
      console.warn('Spline: erro ao carregar a cena, usando fallback CSS.');
      useCssFallback();
    }, { once: true });
  };
  tryStart();
}
initSplineViewer();

const burger = document.getElementById('burger');
const navMobile = document.getElementById('navMobile');
burger.addEventListener('click', () => {
  const isOpen = navMobile.classList.toggle('open');
  burger.classList.toggle('open', isOpen);
  burger.setAttribute('aria-expanded', String(isOpen));
});
navMobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navMobile.classList.remove('open');
  burger.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
}));

const KEYS = [
  { id:'html',      label:'HTML',     name:'HTML',       light:'#ff9466', dark:'#8a3a12', key:'1', caption:'Onde tudo começa: divs, semântica e um carinho especial por acessibilidade.' },
  { id:'css',       label:'CSS',      name:'CSS',        light:'#6fc6ff', dark:'#0f3f66', key:'2', caption:'Flexbox, Grid e a eterna luta contra o "por que isso não centraliza".' },
  { id:'js',        label:'JS',       name:'JavaScript', light:'#ffe066', dark:'#7a5c00', key:'3', caption:'undefined is not a function — clássico dos clássicos.' },
  { id:'react',     label:'React',    name:'React',      light:'#8fe3ff', dark:'#0d4a5c', key:'4', caption:'useState, useEffect e um carinho enorme por componentes reutilizáveis.' },
  { id:'node',      label:'Node',     name:'Node.js',    light:'#8fe38f', dark:'#1c5c2a', key:'5', caption:'JavaScript no back-end — porque por que não usar em tudo?' },
  { id:'git',       label:'Git',      name:'Git',        light:'#ff8a65', dark:'#7a2e12', key:'6', caption:'git commit -m "corrige bug" (na real, criou três novos).' },
  { id:'github',    label:'GitHub',   name:'GitHub',     light:'#e5e5e5', dark:'#2a2a2a', key:'7', caption:'Onde os commits verdes viram motivo de orgulho.' },
  { id:'docker',    label:'Docker',   name:'Docker',     light:'#7fc4ff', dark:'#0f3f7a', key:'8', caption:'"Funciona na minha máquina" deixou de ser desculpa.' },
  { id:'linux',     label:'Linux',    name:'Linux',      light:'#9be89b', dark:'#1a4d1a', key:'9', caption:'sudo faz tudo — menos café, infelizmente.' },
  { id:'aws',       label:'AWS',      name:'AWS',        light:'#ffb066', dark:'#7a4a00', key:'0', caption:'Nuvem, escalabilidade e uma fatura que merece atenção.' },
  { id:'linkedin',  label:'in',       name:'LinkedIn',   light:'#5fb0ff', dark:'#0a3d75', key:'q', caption:'Onde eu falo sério sobre carreira (às vezes).' },
  { id:'whatsapp',  label:'Whats',    name:'WhatsApp',   light:'#6fe38a', dark:'#0f5c28', key:'w', caption:'Me chama! Respondo rápido, prometo.' },
  { id:'instagram', label:'Insta',    name:'Instagram',  light:'#ff7fb0', dark:'#7a1050', key:'e', caption:'Bastidores do código (e do café que nunca falta).' },
  { id:'email',     label:'Email',    name:'E-mail',     light:'#ff8a80', dark:'#7a1c12', key:'r', caption:'A forma mais formal de dizer "oi, vamos trabalhar juntos?"' },
  { id:'talk',      label:'CA',       name:'Vamos conversar?', light:'#c9a8ff', dark:'#4a2a80', key:'t', caption:'Aperte essa tecla e a gente já começa a conversar 👇', link:'#contact' },
];

const EMAIL = 'andrzejewskyantonacciclara@gmail.com';
const LINKS = {
  linkedin:  '[https://www.linkedin.com/in/clara-andrzejewsky-antonacci-5a986b3aa/](https://www.linkedin.com/in/clara-andrzejewsky-antonacci-5a986b3aa/)',
  whatsapp:  '[https://wa.me/5519982612779](https://wa.me/5519982612779)',
  instagram: '[https://www.instagram.com/clara_.antonacci/](https://www.instagram.com/clara_.antonacci/)',
  email:     `mailto:${EMAIL}`,
  github:    '[https://github.com/ClaraAntonacci](https://github.com/ClaraAntonacci)',
};

const keysGrid = document.getElementById('keysGrid');
const keyEls = {};

KEYS.forEach(k => {
  const el = document.createElement('div');
  el.className = 'key';
  el.tabIndex = 0;
  el.dataset.id = k.id;
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', k.label);
  el.style.setProperty('--kc-l', k.light);
  el.style.setProperty('--kc-d', k.dark);
  el.innerHTML = `<div class="key-side"></div><div class="key-face">${k.label}</div>`;
  keysGrid.appendChild(el);
  keyEls[k.id] = el;
});

const caption = document.getElementById('keyCaption');
const captionName = document.getElementById('captionName');
const captionText = document.getElementById('captionText');
const bongoCat = document.getElementById('bongoCat');
let captionTimer = null;
let captionFor = null;
let pawSide = 'left';

function pressKey(id, { navigate = false } = {}) {
  const data = KEYS.find(k => k.id === id);
  const el = keyEls[id];
  if (!data || !el) return;

  el.classList.add('active');
  clearTimeout(el._releaseTimer);
  el._releaseTimer = setTimeout(() => el.classList.remove('active'), 180);

  showCaption(data);
  playClick();
  bounceCat();

  if (navigate) {
    if (data.link) {
      document.querySelector(data.link)?.scrollIntoView({ behavior: 'smooth' });
    } else if (LINKS[data.id]) {
      window.open(LINKS[data.id], '_blank', 'noopener');
    }
  }
}

function showCaption(data) {
  captionFor = data.id;
  captionName.textContent = data.name;
  captionText.textContent = data.caption;
  caption.classList.add('show');
  clearTimeout(captionTimer);
  captionTimer = setTimeout(hideCaption, 3200);
}

function hideCaption() {
  clearTimeout(captionTimer);
  captionFor = null;
  caption.classList.remove('show');
}

function bounceCat() {
  pawSide = pawSide === 'left' ? 'right' : 'left';
  bongoCat.classList.remove('tap-left', 'tap-right');
  void bongoCat.offsetWidth;
  bongoCat.classList.add(pawSide === 'left' ? 'tap-left' : 'tap-right');
  clearTimeout(bongoCat._resetTimer);
  bongoCat._resetTimer = setTimeout(() => bongoCat.classList.remove('tap-left', 'tap-right'), 140);
}

Object.entries(keyEls).forEach(([id, el]) => {
  el.addEventListener('mouseenter', () => pressKey(id, { navigate: false }));
  el.addEventListener('mouseleave', () => { if (captionFor === id) hideCaption(); });
  el.addEventListener('click', () => pressKey(id, { navigate: true }));
  el.addEventListener('touchstart', () => pressKey(id, { navigate: false }), { passive: true });
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pressKey(id, { navigate: true });
    }
  });
});

window.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  const tag = document.activeElement.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  const match = KEYS.find(k => k.key === e.key.toLowerCase());
  if (match) pressKey(match.id, { navigate: false });
});

let audioCtx = null;
let soundOn = true;
const soundToggle = document.getElementById('soundToggle');
const soundIcon = soundToggle.querySelector('.sound-icon');

soundToggle.addEventListener('click', () => {
  soundOn = !soundOn;
  soundToggle.setAttribute('aria-pressed', String(!soundOn));
  soundIcon.textContent = soundOn ? '🔊' : '🔇';
});

function playClick() {
  if (!soundOn) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(520 + Math.random() * 120, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.07);
  } catch (err) {}
}

const form = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();

  if (!name || !email || !message) {
    formNote.style.color = '#ff9fd0';
    formNote.textContent = 'Preenche todos os campos antes de enviar :)';
    return;
  }

  const subject = encodeURIComponent(`Contato pelo portfólio — ${name}`);
  const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
  window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;

  formNote.style.color = '';
  formNote.textContent = 'Abrindo seu cliente de e-mail... até já!';
  form.reset();
});

const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.style.boxShadow = window.scrollY > 20 ? '0 10px 30px rgba(0,0,0,.35)' : 'none';
}, { passive: true });