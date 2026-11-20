(() => {
  const hero = document.querySelector('#inicio');
  const atmosphere = hero?.querySelector('.hero-atmosphere');
  if (!atmosphere) return;

  const layer = atmosphere.querySelector('.atmosphere-parallax');
  const ascii = atmosphere.querySelector('.atmosphere-ascii');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mouseVariant = hero.dataset.background === 'mouse'
    || new URLSearchParams(window.location.search).get('fondo') === 'mouse';
  const fixedCircle = hero.dataset.background === 'breathe';
  const animations = [];
  const random = (min, max) => min + Math.random() * (max - min);

  const context = ascii.getContext('2d');
  let width = 0;
  let height = 0;
  let frame = 0;
  let lastPaint = 0;
  let visible = true;

  const glyphs = ' .:;+*x%#@';
  function shadedPoint(x, y, light) {
    return {
      x, y,
      brightness: .07 + light * .48,
      glyph: glyphs[Math.min(glyphs.length - 1, Math.floor(light * glyphs.length))]
    };
  }

  // Grayscale drawings provide actual filled surfaces, highlights and recesses.
  const views = ['tooth', 'teeth', 'record', 'payments', 'signature', 'clinics', 'calendar', 'reminders'].map(view => {
    const surface = document.createElement('canvas');
    surface.width = surface.height = 240;
    const pen = surface.getContext('2d');
    const enamel = pen.createLinearGradient(50, 35, 190, 190);
    enamel.addColorStop(0, '#fafafa');
    enamel.addColorStop(.28, '#cccccc');
    enamel.addColorStop(.58, '#777777');
    enamel.addColorStop(1, '#222222');
    pen.lineCap = 'round';
    pen.lineJoin = 'round';

    function tooth(x, y, scale) {
      pen.save();
      pen.translate(x, y);
      pen.scale(scale, scale);
      pen.fillStyle = enamel;
      pen.beginPath();
      pen.moveTo(120, 44);
      pen.bezierCurveTo(76, 12, 34, 43, 53, 103);
      pen.bezierCurveTo(66, 133, 65, 197, 87, 211);
      pen.bezierCurveTo(106, 222, 99, 151, 120, 148);
      pen.bezierCurveTo(141, 151, 134, 222, 153, 211);
      pen.bezierCurveTo(175, 197, 174, 133, 187, 103);
      pen.bezierCurveTo(206, 43, 164, 12, 120, 44);
      pen.closePath();
      pen.fill();
      pen.strokeStyle = '#eeeeee';
      pen.lineWidth = 2;
      pen.stroke();
      // Raised crown and darker central fissure.
      pen.strokeStyle = '#494949';
      pen.lineWidth = 5;
      pen.beginPath();
      pen.moveTo(79, 65);
      pen.bezierCurveTo(94, 79, 104, 60, 120, 70);
      pen.bezierCurveTo(132, 82, 147, 63, 163, 66);
      pen.stroke();
      pen.strokeStyle = '#ffffff';
      pen.lineWidth = 4;
      pen.beginPath();
      pen.moveTo(67, 71);
      pen.bezierCurveTo(61, 96, 78, 113, 80, 141);
      pen.stroke();
      pen.restore();
    }

    if (view === 'tooth') {
      tooth(-9, -4, 1.07);
    } else if (view === 'teeth') {
      for (let row = 0; row < 2; row++) {
        for (let column = 0; column < 8; column++) {
          const arch = Math.sin(column / 7 * Math.PI);
          const x = 12 + column * 27;
          const y = row === 0 ? 48 - arch * 20 : 121 + arch * 16;
          tooth(x - 13, y, .23);
        }
      }
      pen.strokeStyle = '#555555';
      pen.lineWidth = 2;
      pen.setLineDash([2, 5]);
      pen.beginPath();
      pen.moveTo(24, 116);
      pen.lineTo(216, 116);
      pen.stroke();
    } else if (view === 'payments') {
      // A stack behind a face-on coin keeps the silhouette legible in ASCII.
      const edge = pen.createLinearGradient(126, 0, 210, 0);
      edge.addColorStop(0, '#dddddd');
      edge.addColorStop(.5, '#777777');
      edge.addColorStop(1, '#333333');
      for (let coin = 0; coin < 4; coin++) {
        const y = 191 - coin * 19;
        pen.fillStyle = edge;
        pen.fillRect(126, y - 10, 84, 15);
        pen.beginPath();
        pen.ellipse(168, y + 5, 42, 14, 0, 0, Math.PI * 2);
        pen.fill();
        pen.fillStyle = enamel;
        pen.beginPath();
        pen.ellipse(168, y - 10, 42, 14, 0, 0, Math.PI * 2);
        pen.fill();
        pen.strokeStyle = '#dddddd';
        pen.lineWidth = 2;
        pen.stroke();
      }
      const face = pen.createRadialGradient(74, 73, 4, 102, 110, 82);
      face.addColorStop(0, '#ffffff');
      face.addColorStop(.55, '#bbbbbb');
      face.addColorStop(1, '#444444');
      pen.fillStyle = face;
      pen.beginPath();
      pen.arc(98, 109, 69, 0, Math.PI * 2);
      pen.fill();
      pen.strokeStyle = '#eeeeee';
      pen.lineWidth = 3;
      pen.stroke();
      pen.strokeStyle = '#555555';
      pen.lineWidth = 4;
      pen.beginPath();
      pen.arc(98, 109, 57, 0, Math.PI * 2);
      pen.stroke();
      pen.fillStyle = '#262626';
      pen.font = 'bold 83px Georgia, serif';
      pen.textAlign = 'center';
      pen.textBaseline = 'middle';
      pen.fillText('$', 98, 114);
    } else if (view === 'reminders') {
      // A filled chat bubble and large notification bell read as one message.
      pen.fillStyle = enamel;
      pen.beginPath();
      pen.moveTo(52, 34);
      pen.lineTo(188, 34);
      pen.quadraticCurveTo(210, 34, 210, 56);
      pen.lineTo(210, 152);
      pen.quadraticCurveTo(210, 174, 188, 174);
      pen.lineTo(101, 174);
      pen.lineTo(54, 209);
      pen.lineTo(62, 174);
      pen.lineTo(52, 174);
      pen.quadraticCurveTo(30, 174, 30, 152);
      pen.lineTo(30, 56);
      pen.quadraticCurveTo(30, 34, 52, 34);
      pen.closePath();
      pen.fill();
      pen.strokeStyle = '#eeeeee';
      pen.lineWidth = 3;
      pen.stroke();

      pen.fillStyle = '#222222';
      pen.beginPath();
      pen.moveTo(87, 127);
      pen.quadraticCurveTo(99, 118, 99, 91);
      pen.bezierCurveTo(99, 61, 141, 61, 141, 91);
      pen.quadraticCurveTo(141, 118, 153, 127);
      pen.closePath();
      pen.fill();
      pen.beginPath();
      pen.arc(120, 136, 9, 0, Math.PI);
      pen.fill();
      pen.beginPath();
      pen.arc(120, 67, 5, 0, Math.PI * 2);
      pen.fill();

      pen.strokeStyle = '#333333';
      pen.lineWidth = 4;
      pen.beginPath();
      pen.arc(120, 92, 34, Math.PI * 1.05, Math.PI * 1.32);
      pen.stroke();
      pen.beginPath();
      pen.arc(120, 92, 34, -Math.PI * .32, -Math.PI * .05);
      pen.stroke();
    } else if (view === 'calendar') {
      // A filled calendar with broad date cells and one selected appointment.
      pen.fillStyle = enamel;
      pen.beginPath();
      pen.roundRect(30, 40, 180, 176, 9);
      pen.fill();
      pen.strokeStyle = '#eeeeee';
      pen.lineWidth = 3;
      pen.stroke();
      pen.fillStyle = '#555555';
      pen.fillRect(32, 44, 176, 36);
      pen.strokeStyle = '#ffffff';
      pen.lineWidth = 9;
      pen.beginPath();
      pen.moveTo(73, 27);
      pen.lineTo(73, 54);
      pen.moveTo(167, 27);
      pen.lineTo(167, 54);
      pen.stroke();
      pen.strokeStyle = '#eeeeee';
      pen.lineWidth = 3;
      pen.beginPath();
      pen.moveTo(32, 81);
      pen.lineTo(208, 81);
      pen.stroke();

      for (let row = 0; row < 3; row++) {
        for (let column = 0; column < 4; column++) {
          const x = 46 + column * 40;
          const y = 95 + row * 37;
          pen.fillStyle = row === 1 && column === 1 ? '#eeeeee' : '#444444';
          pen.beginPath();
          pen.roundRect(x, y, 27, 24, 3);
          pen.fill();
        }
      }
      pen.strokeStyle = '#222222';
      pen.lineWidth = 5;
      pen.beginPath();
      pen.moveTo(91, 143);
      pen.lineTo(98, 150);
      pen.lineTo(108, 137);
      pen.stroke();
    } else if (view === 'clinics') {
      // Headset operators above a clearly identified dental clinic.
      function operator(centerX) {
        const face = pen.createRadialGradient(centerX - 7, 42, 2, centerX, 53, 28);
        face.addColorStop(0, '#eeeeee');
        face.addColorStop(1, '#666666');
        pen.fillStyle = face;
        pen.beginPath();
        pen.ellipse(centerX, 53, 20, 25, 0, 0, Math.PI * 2);
        pen.fill();

        pen.fillStyle = enamel;
        pen.beginPath();
        pen.moveTo(centerX - 32, 112);
        pen.quadraticCurveTo(centerX - 34, 83, centerX - 12, 81);
        pen.quadraticCurveTo(centerX, 93, centerX + 12, 81);
        pen.quadraticCurveTo(centerX + 34, 83, centerX + 32, 112);
        pen.closePath();
        pen.fill();

        // Broad earcups and boom microphones remain clear after ASCII sampling.
        pen.strokeStyle = '#eeeeee';
        pen.lineWidth = 5;
        pen.beginPath();
        pen.arc(centerX, 49, 28, Math.PI, Math.PI * 2);
        pen.stroke();
        pen.fillStyle = '#dddddd';
        pen.beginPath();
        pen.roundRect(centerX - 32, 47, 9, 22, 3);
        pen.roundRect(centerX + 23, 47, 9, 22, 3);
        pen.fill();
        pen.strokeStyle = '#dddddd';
        pen.lineWidth = 4;
        pen.beginPath();
        pen.moveTo(centerX + 28, 65);
        pen.lineTo(centerX + 24, 77);
        pen.lineTo(centerX + 7, 77);
        pen.stroke();
        pen.fillStyle = '#ffffff';
        pen.fillRect(centerX + 4, 74, 9, 6);
      }
      operator(52);
      operator(188);

      pen.fillStyle = enamel;
      pen.beginPath();
      pen.roundRect(44, 130, 152, 99, 5);
      pen.fill();
      pen.strokeStyle = '#eeeeee';
      pen.lineWidth = 2;
      pen.stroke();

      // A large sign, tooth emblem and glazed entrance identify a dental clinic.
      pen.fillStyle = '#eeeeee';
      pen.fillRect(36, 122, 168, 30);
      pen.fillStyle = '#222222';
      pen.font = 'bold 22px Arial, sans-serif';
      pen.textAlign = 'center';
      pen.textBaseline = 'middle';
      pen.fillText('CL?NICA', 120, 138);

      pen.fillStyle = '#222222';
      pen.beginPath();
      pen.moveTo(120, 164);
      pen.bezierCurveTo(104, 155, 96, 163, 101, 177);
      pen.bezierCurveTo(104, 185, 104, 193, 110, 194);
      pen.bezierCurveTo(114, 194, 113, 182, 120, 182);
      pen.bezierCurveTo(127, 182, 126, 194, 130, 194);
      pen.bezierCurveTo(136, 193, 136, 185, 139, 177);
      pen.bezierCurveTo(144, 163, 136, 155, 120, 164);
      pen.fill();
      pen.fillStyle = '#333333';
      pen.fillRect(103, 201, 34, 28);
      pen.fillRect(58, 165, 28, 38);
      pen.fillRect(154, 165, 28, 38);
      pen.strokeStyle = '#aaaaaa';
      pen.lineWidth = 2;
      pen.beginPath();
      pen.moveTo(120, 202);
      pen.lineTo(120, 228);
      pen.moveTo(72, 165);
      pen.lineTo(72, 203);
      pen.moveTo(168, 165);
      pen.lineTo(168, 203);
      pen.stroke();
    } else if (view === 'signature') {
      // A broad check on a solid document stays recognizable at ASCII resolution.
      pen.fillStyle = enamel;
      pen.beginPath();
      pen.roundRect(49, 30, 142, 184, 10);
      pen.fill();
      pen.strokeStyle = '#dddddd';
      pen.lineWidth = 3;
      pen.stroke();

      pen.fillStyle = '#777777';
      pen.beginPath();
      pen.roundRect(87, 22, 66, 21, 6);
      pen.fill();
      pen.strokeStyle = '#eeeeee';
      pen.lineWidth = 2;
      pen.stroke();

      pen.strokeStyle = '#222222';
      pen.lineWidth = 17;
      pen.beginPath();
      pen.moveTo(77, 103);
      pen.lineTo(108, 134);
      pen.lineTo(162, 75);
      pen.stroke();

      pen.strokeStyle = '#333333';
      pen.lineWidth = 5;
      pen.beginPath();
      pen.moveTo(75, 166);
      pen.lineTo(164, 166);
      pen.moveTo(75, 183);
      pen.lineTo(139, 183);
      pen.stroke();
    } else {
      pen.fillStyle = enamel;
      pen.beginPath();
      pen.moveTo(52, 22);
      pen.lineTo(156, 22);
      pen.lineTo(190, 56);
      pen.lineTo(190, 218);
      pen.lineTo(52, 218);
      pen.closePath();
      pen.fill();
      pen.fillStyle = '#eeeeee';
      pen.beginPath();
      pen.moveTo(156, 22);
      pen.lineTo(156, 56);
      pen.lineTo(190, 56);
      pen.fill();
      pen.fillStyle = '#353535';
      pen.fillRect(69, 46, 35, 41);
      pen.fillStyle = '#aaaaaa';
      pen.beginPath();
      pen.arc(86, 57, 7, 0, Math.PI * 2);
      pen.fill();
      pen.fillRect(77, 69, 18, 13);
      pen.strokeStyle = '#333333';
      pen.lineWidth = 4;
      for (let row = 0; row < 6; row++) {
        const y = 108 + row * 13;
        pen.beginPath();
        pen.moveTo(70, y);
        pen.lineTo(row % 2 ? 150 : 173, y);
        pen.stroke();
      }
      pen.strokeStyle = '#eeeeee';
      pen.lineWidth = 3;
      pen.beginPath();
      pen.moveTo(137, 188);
      pen.lineTo(149, 200);
      pen.lineTo(173, 178);
      pen.stroke();
    }

    const pixels = pen.getImageData(0, 0, 240, 240).data;
    const points = [];
    for (let y = 0; y < 240; y += 4) {
      for (let x = 0; x < 240; x += 4) {
        let coverage = 0;
        let light = 0;
        for (let dy = 0; dy < 4; dy++) {
          for (let dx = 0; dx < 4; dx++) {
            const pixel = ((y + dy) * 240 + x + dx) * 4;
            const alpha = pixels[pixel + 3] / 255;
            coverage += alpha;
            light += pixels[pixel] / 255 * alpha;
          }
        }
        if (coverage < 3) continue;
        points.push(shadedPoint(
          (x + 2) / 240 - .5,
          (y + 2) / 240 - .5,
          Math.max(.06, light / coverage)
        ));
      }
    }
    points.sort((a, b) => Math.atan2(a.y, a.x) - Math.atan2(b.y, b.x)
      || Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y));
    return points;
  });

  const sphere = [];
  for (let latitude = 1; latitude < 42; latitude++) {
    const phi = latitude / 42 * Math.PI;
    const samples = Math.max(12, Math.round(130 * Math.sin(phi)));
    for (let longitude = 0; longitude < samples; longitude++) {
      sphere.push({ phi, theta: longitude / samples * Math.PI * 2 });
    }
  }

  function projectSphere(point, time) {
    const angle = point.theta + time * .13;
    const x = Math.sin(point.phi) * Math.cos(angle);
    const y = Math.cos(point.phi);
    const z = Math.sin(point.phi) * Math.sin(angle);
    const light = Math.max(0, -x * .48 - y * .52 + z * .7);
    const texture = .92 + .08 * Math.sin(point.theta * 14 + point.phi * 9);
    const shaded = shadedPoint(x * .55, y * .55, (.1 + .9 * light) * texture);
    // Back-facing particles are subdued so the illuminated surface has volume.
    shaded.brightness *= z < 0 ? .09 : .95;
    return shaded;
  }

  // Matching particle counts preserve the breakup and reconstruction effect.
  const shapes = views.map(points => {
    const count = sphere.length;
    return Array.from({ length: count }, (_, index) => {
      const pointIndex = Math.floor(index / count * points.length);
      const point = points[pointIndex];
      const duplicates = Math.ceil((pointIndex + 1) * count / points.length)
        - Math.ceil(pointIndex * count / points.length);
      return { ...point, brightness: point.brightness / duplicates };
    });
  });
  shapes.unshift(sphere);
  const sequenceStarted = performance.now() / 1000;
  const previewOffset = new URLSearchParams(window.location.search).get('figura') === 'cobros'
    ? 36 : 0;
  let navigation = null;

  if (fixedCircle) {
    document.addEventListener('keydown', event => {
      if (!event.ctrlKey || event.altKey || event.metaKey || event.isComposing
        || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      if (!visible || event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
      event.preventDefault();
      if (event.repeat) return;

      const now = performance.now() / 1000;
      const step = (now - sequenceStarted + previewOffset) / 9;
      const automaticIndex = Math.floor(step) + (step % 1 >= .75 ? 1 : 0);
      const current = navigation ? navigation.to : automaticIndex % shapes.length;
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      navigation = {
        from: current,
        to: (current + direction + shapes.length) % shapes.length,
        started: now
      };
      // Keep the selected figure on screen for review after the transition.
      if (reducedMotion.matches) paintBubble(0);
    });
  }

  function paintSystem(time, centerX, centerY, radius) {
    const step = (time + previewOffset) / 9;
    const current = navigation ? navigation.from : Math.floor(step) % shapes.length;
    const next = navigation ? navigation.to : (current + 1) % shapes.length;
    const navigationProgress = navigation && !reducedMotion.matches
      ? Math.min(1, (performance.now() / 1000 - navigation.started) / 1.2) : 1;
    const progress = navigation
      ? navigationProgress
      : Math.min(1, Math.max(0, (step % 1 - .5) / .5));
    const blend = progress * progress * (3 - 2 * progress);
    const transitionStarted = navigation
      ? navigation.started - sequenceStarted
      : Math.floor(step) * 9 + 4.5 - previewOffset;
    const transitionDuration = navigation ? 1.2 : 4.5;
    const sourceTime = progress > 0 ? transitionStarted : time;
    const targetTime = progress === 1 ? time : transitionStarted + transitionDuration;
    const tilt = Math.sin(time * .22) * .055;
    context.font = '10px "Courier New", monospace';

    shapes[current].forEach((source, index) => {
      const point = current === 0 ? projectSphere(source, sourceTime) : source;
      const target = next === 0
        ? projectSphere(shapes[next][index], targetTime)
        : shapes[next][index];
      const deltaX = target.x - point.x;
      const deltaY = target.y - point.y;
      const distance = Math.hypot(deltaX, deltaY);
      // A sideways arc preserves forward motion throughout the breakup.
      // Each particle follows a fixed path instead of orbiting a moving midpoint.
      const arc = Math.sin(Math.PI * blend) * Math.sin(index * 2.39996) * .3;
      const normalX = distance > .001 ? -deltaY / distance : 0;
      const normalY = distance > .001 ? deltaX / distance : 0;
      const x = point.x + deltaX * blend + normalX * arc;
      const y = point.y + deltaY * blend + normalY * arc;
      const dx = x * radius * 1.8;
      const dy = y * radius * 1.8;
      const px = centerX + dx * Math.cos(tilt) - dy * Math.sin(tilt);
      const py = centerY + dx * Math.sin(tilt) + dy * Math.cos(tilt);
      const fade = 1 - Math.max(0, (px - centerX) / radius) * .55;
      const shimmer = .94 + Math.sin(time * .8 + index * .08) * .06;
      const opacity = fade * shimmer;
      if (blend < 1) {
        context.fillStyle = `rgba(224,245,255,${point.brightness * (1 - blend) * opacity})`;
        context.fillText(point.glyph, px, py);
      }
      if (blend > 0) {
        context.fillStyle = `rgba(224,245,255,${target.brightness * blend * opacity})`;
        context.fillText(target.glyph, px, py);
      }
    });

  }

  function resizeBubble() {
    width = atmosphere.clientWidth;
    height = atmosphere.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    ascii.width = Math.round(width * ratio);
    ascii.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    paintBubble(reducedMotion.matches ? 0 : performance.now() / 1000);
  }

  function paintBubble(time) {
    context.clearRect(0, 0, width, height);
    context.font = '12px "Courier New", monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    const radius = Math.min(width * .28, height * .35, 300);
    const textBounds = hero.querySelector('.hero-txt').getBoundingClientRect();
    const backgroundBounds = atmosphere.getBoundingClientRect();
    const centerX = fixedCircle
      ? textBounds.left - backgroundBounds.left + textBounds.width * .1
      : width * (.22 + Math.sin(time * .085) * .1);
    const centerY = fixedCircle
      ? textBounds.top - backgroundBounds.top + textBounds.height * .48
      : height * (.49 + Math.cos(time * .11) * .13);
    if (fixedCircle) {
      paintSystem(Math.max(0, time - sequenceStarted), centerX, centerY, radius);
      return;
    }
    const rotation = time * .13;
    const breath = fixedCircle ? 1 : 1 + Math.sin(time * .23) * .12;

    // Project a rotating sphere of ASCII characters with a softly rippling surface.
    for (let latitude = 1; latitude < 28; latitude++) {
      const phi = latitude / 28 * Math.PI;
      const samples = Math.max(8, Math.round(90 * Math.sin(phi)));
      for (let longitude = 0; longitude < samples; longitude++) {
        const theta = longitude / samples * Math.PI * 2;
        const ripple = fixedCircle ? 1 : 1 + .065 * Math.sin(phi * 4 + theta * 3 + time * .6);
        const x = Math.sin(phi) * Math.cos(theta + rotation);
        const z = Math.sin(phi) * Math.sin(theta + rotation);
        const y = Math.cos(phi);
        const perspective = fixedCircle ? 1 : 1 + z * .12;
        const px = centerX + x * radius * breath * ripple * perspective;
        const py = centerY + y * radius * ripple * perspective;
        // The silhouette catches more light, like the rim of a soap bubble.
        const rim = Math.pow(1 - Math.abs(z), 5);
        const alpha = fixedCircle
          ? (.008 + rim * .13) * (1 - Math.max(0, x) * .7)
          : .035 + Math.max(0, z) * .11 + rim * .25;
        context.fillStyle = `rgba(255,255,255,${alpha})`;
        context.fillText(rim > .55 ? ':' : z > .5 ? '+' : '.', px, py);
      }
    }
  }

  function animateBubble(now) {
    frame = 0;
    if (!visible || reducedMotion.matches) return;
    if (now - lastPaint > 40) {
      paintBubble(now / 1000);
      lastPaint = now;
    }
    frame = requestAnimationFrame(animateBubble);
  }

  function resumeBubble() {
    cancelAnimationFrame(frame);
    if (reducedMotion.matches) paintBubble(0);
    else if (visible) frame = requestAnimationFrame(animateBubble);
  }

  function position() {
    return {
      transform: `translate(${random(-100, atmosphere.clientWidth - 220)}px, ${random(-150, atmosphere.clientHeight - 200)}px) scale(${random(.65, 1.6)}, ${random(.7, 1.5)})`,
      opacity: random(.14, .4)
    };
  }

  function startDrift() {
    animations.splice(0).forEach(animation => animation.cancel());
    if (hero.dataset.background === 'breathe') return;
    atmosphere.querySelectorAll('.glow').forEach((glow, index) => {
      const initial = {
        transform: `translate(${index ? atmosphere.clientWidth * .65 : 0}px, ${index ? atmosphere.clientHeight * .7 : 0}px) scale(1)`,
        opacity: index ? .2 : .35
      };
      Object.assign(glow.style, initial);
      if (reducedMotion.matches || mouseVariant) return;

      // Independent random paths and timing prevent mirrored movement.
      const frames = [initial, ...Array.from({ length: 7 }, position), initial];
      animations.push(glow.animate(frames, {
        duration: index ? 137000 : 109000,
        iterations: Infinity,
        easing: 'linear',
        // Each destination eases into the next without sudden jumps.
      }));
      animations[animations.length - 1].effect.setKeyframes(
        frames.map(frame => ({ ...frame, easing: 'ease-in-out' }))
      );
    });
  }

  if (mouseVariant) {
    const cursorGlow = document.createElement('div');
    cursorGlow.className = 'cursor-glow';
    cursorGlow.setAttribute('aria-hidden', 'true');
    hero.insertBefore(cursorGlow, hero.querySelector('.hero-in'));
    let lastPointer = null;
    let settleTimer;
    hero.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      const now = performance.now();
      const elapsed = lastPointer ? Math.max(8, now - lastPointer.time) : 16;
      const distance = lastPointer
        ? Math.hypot(event.clientX - lastPointer.x, event.clientY - lastPointer.y)
        : 0;
      const energy = Math.min(1, distance / elapsed / 1.5);
      lastPointer = { x: event.clientX, y: event.clientY, time: now };
      if (!reducedMotion.matches) {
        cursorGlow.style.setProperty('--cursor-scale', .85 + energy * .7);
        cursorGlow.style.setProperty('--cursor-brightness', .8 + energy * .8);
      }
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        cursorGlow.style.setProperty('--cursor-scale', '1');
        cursorGlow.style.setProperty('--cursor-brightness', '1');
        lastPointer = null;
      }, 160);
      const bounds = hero.getBoundingClientRect();
      cursorGlow.style.left = `${event.clientX - bounds.left}px`;
      cursorGlow.style.top = `${event.clientY - bounds.top}px`;
      cursorGlow.style.opacity = '1';
    });
    hero.addEventListener('pointerleave', () => {
      cursorGlow.style.opacity = '0';
      clearTimeout(settleTimer);
      lastPointer = null;
      cursorGlow.style.setProperty('--cursor-scale', '1');
      cursorGlow.style.setProperty('--cursor-brightness', '1');
    });
  }

  reducedMotion.addEventListener('change', () => {
    layer.style.transform = '';
    startDrift();
    resumeBubble();
  });
  const observer = new ResizeObserver(resizeBubble);
  observer.observe(atmosphere);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    animations.forEach(animation => visible ? animation.play() : animation.pause());
    resumeBubble();
  }).observe(hero);
  resizeBubble();
  startDrift();
  resumeBubble();
})();
