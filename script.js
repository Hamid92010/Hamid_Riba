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
