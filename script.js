/* Floating energy sparks emerging from the portal in fondo.png.
   The background is NOT a GIF: animation is painted on a transparent canvas.
   Respect reduced-motion settings and adjust particle density on mobile. */
(() => {
  const canvas = document.getElementById('portal-particles');
  const hero = document.querySelector('.hero');
  if (!canvas || !hero || !canvas.getContext) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, ratio = 1, particles = [], raf = null;
  let origin = {x:0, y:0};
  let last = 0;

  // Original illustration is 1672 × 941 px. Coordinates locate the portal opening.
  const illustration = { width:1672, height:941, portalX:1516, portalY:468 };
  const palette = ['61,231,255', '55,190,255', '230,92,255', '255,124,220', '235,250,255'];
  const random = (min, max) => min + Math.random() * (max - min);

  function locatePortal() {
    // Matches CSS background-size: cover; background-position: 50% (desktop), 100% (mobile).
    const scale = Math.max(width / illustration.width, height / illustration.height);
    const drawnWidth = illustration.width * scale;
    const drawnHeight = illustration.height * scale;
    const focus = window.innerWidth <= 740 ? 1 : 0.5;
    origin = {
      x: illustration.portalX * scale + (width - drawnWidth) * focus,
      y: illustration.portalY * scale + (height - drawnHeight) * 0.5
    };
  }

  function createParticle(fromPortal = false) {
    const lifetime = random(2.3, 5.7);
    const spread = Math.min(width, height) / 880;
    const p = {
      startX: origin.x + random(-29, 29) * spread,
      startY: origin.y + random(-105, 105) * spread,
      vx: random(-57, -12) * spread,
      vy: random(-72, -20) * spread,
      wobble: random(8, 35) * spread,
      wobbleSpeed: random(0.8, 2.6),
      phase: random(0, Math.PI * 2),
      radius: random(.7, 2.25) * Math.max(.8, spread),
      rgb: palette[Math.floor(random(0, palette.length))],
      age: fromPortal ? random(0, lifetime) : 0,
      lifetime
    };
    return p;
  }

  function resize() {
    width = Math.max(1, hero.clientWidth);
    height = Math.max(1, hero.clientHeight);
    ratio = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    locatePortal();
    particles = Array.from({length: window.innerWidth <= 740 ? 32 : 85}, () => createParticle(true));
  }

  function frame(time) {
    if (reduceMotion.matches) return;
    const dt = Math.min((time - (last || time)) / 1000, 0.035);
    last = time;
    ctx.clearRect(0,0,width,height);
    ctx.globalCompositeOperation = 'screen';

    for (let i=0;i<particles.length;i++) {
      let p = particles[i];
      p.age += dt;
      if (p.age >= p.lifetime) { particles[i] = p = createParticle(); }
      const t = p.age / p.lifetime;
      const x = p.startX + p.vx * p.age + Math.sin(p.age * p.wobbleSpeed + p.phase) * p.wobble * t;
      const y = p.startY + p.vy * p.age + Math.cos(p.age * p.wobbleSpeed + p.phase) * p.wobble * .4 * t;
      const fade = Math.sin(Math.PI * t) * .86;
      if (x < -20 || x > width+20 || y < -20 || y > height+20) continue;

      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.rgb},${(fade*.14).toFixed(3)})`;
      ctx.arc(x,y,p.radius*4,0,Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.rgb},${fade.toFixed(3)})`;
      ctx.arc(x,y,p.radius,0,Math.PI*2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (raf !== null) cancelAnimationFrame(raf);
    raf = null;
    last = 0;
    ctx.clearRect(0,0,width,height);
    if (!reduceMotion.matches) raf = requestAnimationFrame(frame);
  }
  resize();
  start();
  window.addEventListener('resize', () => { resize(); start(); }, { passive:true });
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', start);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && raf !== null) { cancelAnimationFrame(raf); raf=null; }
    else if (!document.hidden) start();
  });
})();


/* Lightweight mouse-following perspective on the existing transparent portrait. */
(() => {
  const section = document.querySelector('.profile-section');
  const img = section?.querySelector('.profile-art');
  const enabled = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  if (!section || !img || !enabled.matches) return;
  let x=0, y=0, targetX=0, targetY=0, raf=0;
  function animate() {
    x += (targetX-x)*0.13;
    y += (targetY-y)*0.13;
    img.style.setProperty('--portrait-x', `${(-y*7).toFixed(3)}deg`);
    img.style.setProperty('--portrait-y', `${(x*9).toFixed(3)}deg`);
    img.style.setProperty('--portrait-z', `${(Math.max(Math.abs(x),Math.abs(y))*16).toFixed(2)}px`);
    img.style.setProperty('--portrait-shadow-x', `${(-x*13).toFixed(2)}px`);
    if (Math.abs(x-targetX)+Math.abs(y-targetY) > .001) raf=requestAnimationFrame(animate);
    else raf=0;
  }
  function request() { if (!raf) raf=requestAnimationFrame(animate); }
  section.addEventListener('pointermove', event => {
    const box=section.getBoundingClientRect();
    targetX=Math.max(-1,Math.min(1,((event.clientX-box.left)/box.width)*2-1));
    targetY=Math.max(-1,Math.min(1,((event.clientY-box.top)/box.height)*2-1));
    request();
  }, {passive:true});
  section.addEventListener('pointerleave', () => { targetX=0; targetY=0; request(); });
  window.addEventListener('blur', () => { targetX=0; targetY=0; request(); });
})();


/* Optional phone-tilt effect, enabled only by a deliberate tap.
   iOS Safari requires DeviceOrientationEvent.requestPermission() in a click handler.
   No sensor readings are stored or transmitted. */
(() => {
  const portrait = document.querySelector('.profile-art');
  const controls = document.getElementById('motion-controls');
  const toggle = document.getElementById('motion-toggle');
  const status = document.getElementById('motion-status');
  const mobile = window.matchMedia('(hover: none) and (pointer: coarse)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!portrait || !controls || !toggle || !status
      || !mobile.matches || reduced.matches || !window.isSecureContext
      || !('DeviceOrientationEvent' in window)) return;

  controls.hidden = false;
  let enabled = false;
  let calibration = null;
  let x = 0, y = 0, targetX = 0, targetY = 0, frameId = 0;
  let timeoutId = 0;

  const clamp = v => Math.max(-1, Math.min(1, v));
  const resetPose = () => { targetX = 0; targetY = 0; schedule(); };

  function animate() {
    x += (targetX - x) * 0.13;
    y += (targetY - y) * 0.13;
    portrait.style.setProperty('--portrait-x', `${(-y * 7).toFixed(3)}deg`);
    portrait.style.setProperty('--portrait-y', `${(x * 9).toFixed(3)}deg`);
    portrait.style.setProperty('--portrait-z', `${(Math.max(Math.abs(x), Math.abs(y)) * 16).toFixed(2)}px`);
    if (Math.abs(x - targetX) + Math.abs(y - targetY) > 0.001) {
      frameId = requestAnimationFrame(animate);
    } else { frameId = 0; }
  }
  function schedule() {
    if (!frameId) frameId = requestAnimationFrame(animate);
  }
  function onOrientation(event) {
    if (!enabled || typeof event.beta !== 'number' || typeof event.gamma !== 'number') return;
    clearTimeout(timeoutId);
    if (!calibration) {
      calibration = { beta: event.beta, gamma: event.gamma };
      status.textContent = 'Tilt your phone to move the portrait.';
    }
    // Calibrate from the angle at which the visitor taps "Enable 3D tilt".
    const deltaBeta = event.beta - calibration.beta;
    const deltaGamma = event.gamma - calibration.gamma;
    const angle = (screen.orientation && typeof screen.orientation.angle === 'number')
      ? screen.orientation.angle
      : (typeof window.orientation === 'number' ? window.orientation : 0);
    const landscape = Math.abs(angle) === 90 || angle === 270;
    const sign = angle === -90 || angle === 270 ? -1 : 1;
    const side = landscape ? sign * deltaBeta : deltaGamma;
    const forward = landscape ? -sign * deltaGamma : deltaBeta;
    targetX = clamp(side / 24);
    targetY = clamp(forward / 26);
    schedule();
  }
  function stop(message = '') {
    enabled = false;
    calibration = null;
    clearTimeout(timeoutId);
    window.removeEventListener('deviceorientation', onOrientation);
    toggle.textContent = 'Enable 3D tilt';
    toggle.setAttribute('aria-pressed', 'false');
    status.textContent = message;
    resetPose();
  }
  function start() {
    enabled = true;
    calibration = null;
    toggle.textContent = 'Disable 3D tilt';
    toggle.setAttribute('aria-pressed', 'true');
    status.textContent = 'Ready. Waiting for motion sensors…';
    window.addEventListener('deviceorientation', onOrientation, { passive: true });
    timeoutId = setTimeout(() => {
      if (!calibration) stop('Motion data unavailable in this browser.');
    }, 4000);
  }

  toggle.addEventListener('click', async () => {
    if (enabled) { stop(); return; }
    try {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // Call permission method immediately within the user tap.
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== 'granted') {
          stop('Motion permission was not granted.');
          return;
        }
      }
      start();
    } catch (error) {
      stop('Could not activate motion sensors. Try Safari over HTTPS.');
    }
  });
  window.addEventListener('orientationchange', () => {
    calibration = null; resetPose();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && enabled) stop();
  });
  if (reduced.addEventListener) reduced.addEventListener('change', () => {
    if (reduced.matches) { stop(); controls.hidden = true; }
    else { controls.hidden = false; }
  });
})();
