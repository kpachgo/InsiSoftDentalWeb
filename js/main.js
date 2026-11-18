// ponytail: correo y WhatsApp de prueba (clinica.json). Cambiar aquí y en index.html al tener los reales.
const CORREO = 'ventas@ejemplo.com';
const WA = '7000-0000';

// Nav sólido al bajar
const nav = document.querySelector('.nav');
const onScroll = () => nav.classList.toggle('solid', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Aparición al entrar en pantalla
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// Odontograma de demostración. Cada pulsación cambia el estado de la pieza.
const chartPreview = document.querySelector('.odontogram-panel .dental-chart');
const teeth = document.createElement('div');
teeth.className = 'tooth-grid';
const toothStates = ['Sin registro', 'Tratado', 'Pendiente'];
const toothNumbers = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
  48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

function markTooth(tooth, state) {
  tooth.dataset.state = state;
  tooth.setAttribute('aria-label', `Pieza ${tooth.dataset.number}: ${toothStates[state]}`);
}

for (const number of toothNumbers) {
  const tooth = document.createElement('button');
  tooth.type = 'button';
  tooth.className = 'tooth';
  tooth.dataset.number = number;
  markTooth(tooth, 0);
  teeth.append(tooth);
}
chartPreview.replaceWith(teeth);
document.querySelector('#odontogram-hint').hidden = false;
teeth.parentElement.setAttribute('aria-describedby', 'odontogram-hint odontogram-legend');

let interactedWithTeeth = false;
teeth.addEventListener('focusin', () => { interactedWithTeeth = true; });
teeth.addEventListener('click', (event) => {
  const tooth = event.target.closest('.tooth');
  if (!tooth) return;
  interactedWithTeeth = true;
  markTooth(tooth, (Number(tooth.dataset.state) + 1) % toothStates.length);
});

const toothDemo = new IntersectionObserver(([entry], observer) => {
  if (!entry.isIntersecting) return;
  observer.disconnect();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const example = [[15, 1], [24, 2], [42, 1]];
  example.forEach(([number, state], index) => {
    setTimeout(() => {
      if (interactedWithTeeth) return;
      markTooth(teeth.querySelector(`[data-number="${number}"]`), state);
    }, 650 + index * 500);
  });
}, { threshold: 0.6 });
toothDemo.observe(teeth);

const deviceSwitch = document.querySelector('.device-switch');
const devicePreview = document.querySelector('.dental-laptop');
const deviceButtons = deviceSwitch.querySelectorAll('button');
deviceSwitch.hidden = false;
deviceSwitch.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  devicePreview.dataset.device = button.dataset.device;
  deviceButtons.forEach((option) => {
    option.setAttribute('aria-pressed', String(option === button));
  });
});

// Botones de planes: preseleccionan el plan en el formulario
const form = document.querySelector('#cotizar');
document.querySelectorAll('[data-plan]').forEach((a) =>
  a.addEventListener('click', () => { form.plan.value = a.dataset.plan; }));

// Desplaza al contenido sin agregar su identificador a la dirección.
document.addEventListener('click', (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest('a[href^="#"]');
  if (!link || link.target || link.hasAttribute('download')) return;
  const section = document.getElementById(link.hash.slice(1));
  if (!section) return;

  event.preventDefault();
  if (location.hash) {
    const address = new URL(location.href);
    address.hash = '';
    history.replaceState(history.state, '', address);
  }
  if (!section.hasAttribute('tabindex')) section.tabIndex = -1;
  section.focus({ preventScroll: true });
  section.scrollIntoView({ block: 'start' });
});

// Envío por FormSubmit (sin base de datos: llega al correo)
const status = form.querySelector('.status');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (form._honey.value) return;
  const malos = [...form.elements].filter((el) => el.willValidate && !el.checkValidity());
  form.querySelectorAll('.invalid').forEach((el) => el.classList.remove('invalid'));
  if (malos.length) {
    malos.forEach((el) => el.classList.add('invalid'));
    malos[0].focus();
    status.className = 'status err';
    status.textContent = 'Revisa los campos marcados.';
    return;
  }
  const btn = form.querySelector('button');
  btn.disabled = true;
  status.className = 'status';
  status.textContent = 'Enviando…';
  try {
    const datos = Object.fromEntries(new FormData(form));
    datos._subject = `Cotización InciSoft · ${datos.clinica}`;
    const res = await fetch(`https://formsubmit.co/ajax/${CORREO}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(datos),
    });
    if (!res.ok) throw new Error(res.status);
    form.reset();
    status.className = 'status ok';
    status.textContent = '¡Listo! Te enviaremos tu cotización muy pronto.';
  } catch {
    status.className = 'status err';
    status.textContent = `No se pudo enviar. Escríbenos por WhatsApp al ${WA}.`;
  } finally {
    btn.disabled = false;
  }
});

document.getElementById('anio').textContent = new Date().getFullYear();
