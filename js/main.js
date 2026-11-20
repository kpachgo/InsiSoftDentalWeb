// Correo y WhatsApp de contacto de InciSoft.
// Alias de FormSubmit para contacto@incisoftdental.com (oculta el correo a los bots)
const FORM_ID = '3c0ac99a984a724d2e4ad822bdffaed3';
const WA = '7268-2797';

// Nav sólido al bajar
const nav = document.querySelector('.nav');
const onScroll = () => nav.classList.toggle('solid', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Odontograma animado de la tarjeta del recorrido del paciente.
const miniTeeth = document.querySelector('.mini-teeth');
if (miniTeeth) {
  const miniPieces = Array.from({ length: 32 }, () => {
    const piece = document.createElement('span');
    piece.className = 'mini-tooth';
    miniTeeth.append(piece);
    return piece;
  });
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let timer;
    const animateChart = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !timer) {
        timer = setInterval(() => {
          const piece = miniPieces[Math.floor(Math.random() * miniPieces.length)];
          piece.classList.remove('treated', 'pending');
          const nextState = Math.floor(Math.random() * 4);
          if (nextState === 1) piece.classList.add('treated');
          if (nextState === 2) piece.classList.add('pending');
        }, 650);
      } else if (!entry.isIntersecting && timer) {
        clearInterval(timer);
        timer = undefined;
      }
    }, { threshold: 0.5 });
    animateChart.observe(miniTeeth);
  }
}

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
const setDevice = (device) => {
  devicePreview.dataset.device = device;
  deviceButtons.forEach((option) => {
    option.setAttribute('aria-pressed', String(option.dataset.device === device));
  });
};
let deviceTimer;
let viewTimer;
let viewIndex = 0;
const viewTitle = document.querySelector('[data-view-title]');
const viewSubtitle = document.querySelector('[data-view-subtitle]');
const actionTitle = document.querySelector('[data-action-title]');
const actionSubtitle = document.querySelector('[data-action-subtitle]');
const viewSequence = [
  ['Odontograma', 'vista clínica', 'Tratamiento guardado', 'en su expediente'],
  ['Agenda', 'citas y horarios', 'Cita confirmada', 'jueves · 3:00 p. m.'],
  ['Doctores', 'equipo clínico', 'Doctor asignado', 'a la cita'],
  ['Servicios', 'catálogo de atención', 'Servicio actualizado', 'en el catálogo'],
  ['Cobros', 'caja y saldos', 'Abono registrado', 'saldo actualizado'],
  ['Seguimientos', 'control del paciente', 'Paciente contactado', 'llamada registrada'],
  ['Inventario', 'insumos de clínica', 'Pedido generado', 'listo para enviar'],
];
const updateViewChips = () => {
  viewIndex = (viewIndex + 1) % viewSequence.length;
  [viewTitle, viewSubtitle, actionTitle, actionSubtitle].forEach((el) => {
    el.parentElement.classList.remove('is-updating');
    void el.parentElement.offsetWidth;
  });
  [viewTitle, viewSubtitle, actionTitle, actionSubtitle].forEach((el, index) => {
    el.textContent = viewSequence[viewIndex][index];
    el.parentElement.classList.add('is-updating');
  });
};
deviceSwitch.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  setDevice(button.dataset.device);
});
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const deviceDemo = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !deviceTimer) {
      deviceTimer = setInterval(() => {
        setDevice(devicePreview.dataset.device === 'laptop' ? 'tablet' : 'laptop');
      }, 5000);
      viewTimer = setInterval(updateViewChips, 3000);
    } else if (!entry.isIntersecting && deviceTimer) {
      clearInterval(deviceTimer);
      deviceTimer = undefined;
      clearInterval(viewTimer);
      viewTimer = undefined;
    }
  }, { threshold: 0.35 });
  deviceDemo.observe(devicePreview);
}

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
    datos._replyto = datos.correo;
    const res = await fetch(`https://formsubmit.co/ajax/${FORM_ID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(datos),
    });
    const respuesta = await res.json();
    if (!res.ok || (respuesta.success !== true && respuesta.success !== 'true')) {
      throw new Error(respuesta.message || `HTTP ${res.status}`);
    }
    form.reset();
    status.className = 'status ok';
    status.textContent = '¡Listo! Te enviaremos tu cotización muy pronto.';
  } catch (error) {
    console.error('No se pudo enviar el formulario de cotización:', error);
    status.className = 'status err';
    const detalle = error instanceof Error && error.message ? ` Detalle: ${error.message}` : '';
    status.textContent = `No se pudo confirmar el envío.${detalle} Intenta de nuevo o escríbenos por WhatsApp al ${WA}.`;
  } finally {
    btn.disabled = false;
  }
});

document.getElementById('anio').textContent = new Date().getFullYear();
