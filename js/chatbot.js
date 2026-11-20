const bot = document.querySelector('.bot');
if (bot) {
  const toggle = bot.querySelector('.bot-toggle');
  const panel = bot.querySelector('.bot-panel');
  const log = bot.querySelector('.bot-log');
  const form = bot.querySelector('.bot-form');
  const send = form.querySelector('button[type="submit"]');
  const SALUDO = 'Hola 😊 Soy el asistente de InciSoft Dental. ¿Tu clínica todavía lleva expedientes en papel o Excel? Te cuento cómo tenerlo todo en un solo lugar. ¿Qué te gustaría saber?';
  const historial = []; // el saludo no va: si no, la IA cree que ya habló y dice "hola de nuevo"
  let leadEnviado = false;

  const say = (text, who) => {
    const msg = document.createElement('div');
    msg.className = 'bot-msg ' + who;
    msg.textContent = text;
    log.append(msg);
    log.scrollTop = log.scrollHeight;
  };

  // Los tres puntitos de "escribiendo…".
  const escribiendo = () => {
    const typing = document.createElement('p');
    typing.className = 'bot-msg el bot-typing';
    typing.setAttribute('aria-label', 'Escribiendo');
    for (let i = 0; i < 3; i++) typing.append(document.createElement('i'));
    log.append(typing);
    log.scrollTop = log.scrollHeight;
    return typing;
  };

  const setOpen = (open) => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    // El saludo "llega" tras un momento escribiendo, como un mensaje real, en vez de estar ya pegado.
    if (open && !log.childElementCount) {
      const typing = escribiendo();
      setTimeout(() => { typing.remove(); if (!log.querySelector('.bot-msg')) say(SALUDO, 'el ia'); }, 1100);
    }
    if (open) form.elements.q.focus();
  };

  toggle.onclick = () => setOpen(panel.hidden);
  bot.querySelector('.bot-close').onclick = () => { setOpen(false); toggle.focus(); };
  bot.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) { setOpen(false); toggle.focus(); }
  });

  const registrarLead = async (lead) => {
    const conversacion = [...log.querySelectorAll('.bot-msg:not(.bot-typing)')]
      .map((msg) => `${msg.classList.contains('yo') ? 'Cliente' : 'Asistente'}: ${msg.textContent}`)
      .join('\n');
    const res = await fetch(`https://formsubmit.co/ajax/${FORM_ID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        ...lead,
        origen: 'Chat IA de la web',
        conversacion,
        _subject: `Chat IA · ${lead.interes} · ${lead.clinica}`,
      }),
    });
    const data = await res.json();
    if (!res.ok || (data.success !== true && data.success !== 'true')) throw new Error('FormSubmit rechazó el envío');
  };

  form.onsubmit = async (e) => {
    e.preventDefault();
    if (send.disabled) return;
    const text = form.elements.q.value.trim().slice(0, 1000);
    if (!text) return;
    form.reset();
    send.disabled = true;
    say(text, 'yo');
    log.querySelector('.bot-typing')?.remove(); // si escribe antes de que llegue el saludo, solo un indicador
    const typing = escribiendo();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...historial, { role: 'user', content: text }].slice(-10) }),
      });
      const data = await res.json();
      if (!res.ok) {
        typing.remove();
        say(data.reply || data.error || 'No pude conectarme. Escríbenos por WhatsApp al 7268-2797.', 'el ia');
        return;
      }
      let reply = data.reply;
      // Primero se envían los datos; la confirmación de la IA solo se muestra si llegaron.
      if (data.lead && !leadEnviado) {
        try {
          await registrarLead(data.lead);
          leadEnviado = true;
        } catch {
          reply = 'Disculpa, no pude registrar tus datos. Escríbenos por WhatsApp al 7268-2797 y te atendemos de inmediato.';
        }
      }
      typing.remove();
      historial.push({ role: 'user', content: text }, { role: 'assistant', content: reply });
      say(reply, 'el ia');
    } catch {
      typing.remove();
      say('No pude conectarme. Escríbenos por WhatsApp al 7268-2797.', 'el ia');
    } finally {
      send.disabled = false;
    }
  };
}
