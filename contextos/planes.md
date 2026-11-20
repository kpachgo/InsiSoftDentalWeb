# Planes y precios

Definidos el 2026-11-19. Publicados en `index.html` (sección `#planes` y FAQ "¿Cuánto cuesta InciSoft?") y en `contenido-index.txt`. Si cambias un precio, actualiza los tres lugares.

## Precios (USD)

| Plan | Mensual | Anual | Ahorro anual |
|---|---|---|---|
| Esencial | $29 | $290 | $58 |
| Pro (recomendado) | $59 | $590 | $118 |
| Premium | $99 | $990 | $198 |

- Anual = 10 meses (2 meses gratis, ~17% de descuento).
- Pago con tarjeta y transferencia. Aplican términos y condiciones.

## Límites por plan

| | Esencial | Pro | Premium |
|---|---|---|---|
| Odontólogos incluidos | 1 | hasta 3 | hasta 6 |
| Odontólogo adicional | — | +$15/mes c/u | sin definir (pendiente) |
| Sedes | 1 | 1 | 2 |
| Sede adicional | — | — | +$39/mes c/u |

## Qué incluye cada plan

- **Esencial:** expediente clínico e historia médica, odontograma digital con historial, radiografías y fotos, firma del paciente y del doctor, agenda y sala de espera, presupuestos impresos, control de caja y cobros. **Nunca lleva Seguimiento.**
- **Pro:** todo lo de Esencial + autorización de tratamientos por odontólogo, reportes de gestión, control de gastos, seguimiento de pacientes, inventario y pedidos.
- **Premium:** todo lo de Pro + multisucursal, recordatorios automáticos por WhatsApp*, Agente IA en WhatsApp*, capacitación personalizada, soporte prioritario.

## Vistas por plan (app `clinicaElectron`, panel Super Admin > Planes)

| Vista | Esencial | Pro | Premium |
|---|:-:|:-:|:-:|
| Agenda | ✅ | ✅ | ✅ |
| Paciente | ✅ | ✅ | ✅ |
| En Cola | ✅ | ✅ | ✅ |
| Doctores | ✅ | ✅ | ✅ |
| Servicios | ✅ | ✅ | ✅ |
| Cobro | ✅ | ✅ | ✅ |
| Monitor de Seguimiento | ❌ | ✅ | ✅ |
| Inventario | ❌ | ✅ | ✅ |
| Mensajes (recordatorios + Agente IA) | ❌ | ❌ | ✅ |

`max_usuarios` sugerido (cuenta todos los usuarios, no solo odontólogos): Esencial 3, Pro 8, Premium 15.

Limitaciones actuales de la app:
- El servidor bloquea Mensajes, Inventario y Monitor de Seguimiento (`tenant.VISTA_DE_RUTA`, desde 2026-11-19): un Esencial recibe 403 `vista_no_incluida` aunque llame la API directo. Las demás vistas solo se ocultan del menú.
- Reportes de gestión, control de gastos y autorización por odontólogo están dentro de vistas que también tiene el Esencial. Hoy no se bloquean funciones dentro de una vista.
- Los recordatorios automáticos viven en la vista Mensajes (`mensajes.js`), por eso van en Premium.

## Agente IA en WhatsApp: costo aparte

*El Agente IA y los recordatorios por WhatsApp son solo de Premium. El consumo de mensajes de WhatsApp **no está incluido** en el plan. La clínica lo paga directamente a Meta (API oficial de WhatsApp Business), según su uso. Así lo dice la web.

**Por qué:** cada mensaje por la API de WhatsApp tiene costo variable. Si se incluyera en el precio fijo, una clínica que use mucho el agente dejaría el plan en pérdida.

Pendientes:
- El costo del modelo de IA (si el agente usa uno) lo paga InciSoft, no Meta, y no está cubierto por la nota.

## Por qué estos precios (competencia, nov 2026)

| Software | Entrada | Varios doctores | Más completo |
|---|---|---|---|
| Revodent (opera en El Salvador) | $29 | $59 (2 sillones) | +$19 por sillón |
| DentalPro | $29 | $69 (hasta 5) | $129 |
| Dentalink | ~$29 por usuario | por doctor y sede | cotización |
| Odontix / XDentalCloud | ~$49 | — | — |
| Cenident | gratis (limitado) | — | $169 |
| SMILE | $19 | $23 | +$5 por módulo |
| Solo un agente IA de WhatsApp (Aurora) | — | — | $99–179 |

- **Esencial $29:** igual que Revodent y DentalPro. Es el plan de entrada para captar clientes.
- **Pro $59:** igual que el plan Dúo de Revodent, pero con seguimiento de pacientes e inventario incluidos (en SMILE son módulos aparte).
- **Premium $99:** es el único con Agente IA y recordatorios por WhatsApp; solo el agente cuesta $99–179 en el mercado.
- Premium queda por debajo del mercado ($129–169) sin verse barato.
- **Cada plan cuesta ~2× el anterior:** así la mayoría elige el del medio.
- **Se descartó 29 / 39 / 59:** Pro y Premium quedaban muy baratos frente a lo que incluyen, y daban imagen de producto de menor calidad.
- Subir precios después es más difícil que bajarlos. Para atraer clientes conviene usar descuentos de lanzamiento, no bajar la lista.

Los precios de la competencia vienen de las webs de cada empresa y de sitios de reseñas; los de Dentalink y Dentidesk no son oficiales. Fuentes: revodent.ai, dentalpro.tech, smiledental.app, cenident.com, odontix.app, xdentalcloud.com, capterra.com (Dentalink), aurorainbox.com.
