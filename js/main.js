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

// Botones de planes: preseleccionan el plan en el formulario
const form = document.querySelector('#cotizar');
document.querySelectorAll('[data-plan]').forEach((a) =>
  a.addEventListener('click', () => { form.plan.value = a.dataset.plan; }));

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
