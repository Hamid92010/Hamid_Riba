/* Process showcase controller; independent of homepage and glitch behavior. */
(() => {
  const root = document.getElementById('process-showcase');
  if (!root) return;
  const image = document.getElementById('process-photo');
  const video = document.getElementById('process-video');
  const error = document.getElementById('process-media-error');
  const activeNumber = document.getElementById('process-active-number');
  const activeTitle = document.getElementById('process-active-title');
  const activeCaption = document.getElementById('process-active-caption');
  const activeCounter = document.getElementById('process-active-counter');
  const buttons = Array.from(root.querySelectorAll('.process-stage'));
  const asset = path => `assets/process/${path}`;
  const config = {
    idea: {
      number:'01', title:'Idea & Design',
      caption:'Cookie Panic — mechanics and cooperative gameplay sketches.',
      type:'slideshow', interval:4000,
      images:[asset('idea-design-2.png'),asset('idea-design-1.png')],
      alts:['Cookie Panic annotated concept sketch of gameplay and repair mechanics',
        'Cookie Panic illustrated design flow for cooperative gameplay']
    },
    prototype: {
      number:'02', title:'Prototyping',
      caption:'Gameplay prototypes — four short clips in sequence.',type:'sequence',
      videos:[1,2,3,4].map(n=>asset(`prototyping-${n}.mp4`)),
      posters:[1,2,3,4].map(n=>asset(`prototyping-${n}-poster.jpg`))
    },
    programming: {
      number:'03', title:'Programming',
      caption:'Code and behavior — still image followed by GIF.',type:'code',
      image:asset('programming-1.png'), gif:asset('programming-2.gif'),
      imageDelay:2000, gifDelay:6500
    },
    integration: {
      number:'04', title:'Integration',
      caption:'Integration of gameplay systems and game content.',type:'loop',
      videos:[asset('integration-1.mp4')],posters:[asset('integration-1-poster.jpg')]
    },
    testing: {
      number:'05', title:'Testing & Optimization',
      caption:'Testing gameplay behavior and optimizing the experience.',type:'loop',
      videos:[asset('testing-optimization-1.mp4')],
      posters:[asset('testing-optimization-1-poster.jpg')]
    }
  };
  let stage='idea';
  let slide=0;
  let timer=0;
  let active=true;
  let token=0;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hover = window.matchMedia('(hover: hover) and (pointer: fine)');

  function stop() {
    token++;
    window.clearTimeout(timer); timer=0;
    video.pause();
    video.onended=null;
    video.onerror=null;
    video.removeAttribute('src');
    video.load();
    video.hidden=true;
  }
  function setImage(src,alt) {
    video.hidden=true;
    image.alt=alt;
    image.src=src;
    image.hidden=false;
  }
  function schedule(cb,ms) {
    if (active && !reduced.matches) timer=window.setTimeout(cb,ms);
  }
  function showError() {
    if (!active) return;
    video.hidden=true;
    image.hidden=true;
    error.hidden=false;
  }
  function runImages(cfg, runToken) {
    setImage(cfg.images[slide],cfg.alts[slide]);
    activeCounter.textContent=`${String(slide+1).padStart(2,'0')} / ${String(cfg.images.length).padStart(2,'0')}`;
    schedule(() => {
      if (runToken!==token || !active) return;
      slide=(slide+1)%cfg.images.length;
      runImages(cfg,runToken);
    },cfg.interval);
  }
  function runCode(cfg, runToken, showGif=false) {
    if (runToken!==token || !active) return;
    if (showGif) {
      // Browsers do not expose GIF 'ended'; this uploaded GIF is one static frame.
      // gifDelay is an adjustable display duration, not an animation event.
      setImage(cfg.gif,'Programming: second GIF reference frame');
      activeCounter.textContent='02 / 02';
      schedule(()=>runCode(cfg,runToken,false),cfg.gifDelay);
    } else {
      setImage(cfg.image,'Programming: C# code screenshot from Unity');
      activeCounter.textContent='01 / 02';
      schedule(()=>runCode(cfg,runToken,true),cfg.imageDelay);
    }
  }
  function runVideos(cfg, runToken) {
    if (!active || runToken!==token) return;
    const idx=slide%cfg.videos.length;
    const media=cfg.videos[idx];
    video.hidden=false;
    image.hidden=true;
    error.hidden=true;
    video.poster=cfg.posters[idx];
    video.src=media;
    video.muted=true;
    video.playsInline=true;
    video.preload='auto';
    activeCounter.textContent=`${String(idx+1).padStart(2,'0')} / ${String(cfg.videos.length).padStart(2,'0')}`;
    video.onended=() => {
      if (!active || runToken!==token) return;
      slide=(slide+1)%cfg.videos.length;
      runVideos(cfg,runToken);
    };
    video.onerror=showError;
    video.load();
    if (!reduced.matches) {
      const result=video.play();
      if (result && typeof result.catch==='function') result.catch(() => {
        // Browser autoplay may be denied even for muted video.
        if (active && runToken===token) {
          video.controls=true;
          activeCaption.textContent=cfg.caption+' Tap play to continue.';
        }
      });
    } else {
      video.controls=true; // Keep a usable manual-play option under reduced motion.
    }
  }
  function start() {
    if (!active) return;
    const cfg=config[stage];
    if (!cfg) return;
    error.hidden=true;
    video.controls=false;
    const t=token;
    if (cfg.type==='slideshow') runImages(cfg,t);
    else if (cfg.type==='code') runCode(cfg,t,false);
    else runVideos(cfg,t);
  }
  function select(name) {
    if (!config[name]) return;
    // Re-selecting a tab does not unexpectedly restart a playing video.
    if (name===stage && active) return;
    stop();
    stage=name; slide=0;
    const cfg=config[name];
    buttons.forEach(button=>{
      const selected=button.dataset.stage===name;
      button.classList.toggle('is-active',selected);
      button.setAttribute('aria-pressed',String(selected));
    });
    activeNumber.textContent=cfg.number;
    activeTitle.textContent=cfg.title;
    activeCaption.textContent=cfg.caption;
    start();
  }
  for (const btn of buttons) {
    btn.addEventListener('click',()=>select(btn.dataset.stage));
    btn.addEventListener('pointerenter',e=>{
      if (hover.matches && e.pointerType==='mouse') select(btn.dataset.stage);
    });
    btn.addEventListener('focus',()=>select(btn.dataset.stage));
  }
  // Don't download or animate large videos when scrolled away.
  if ('IntersectionObserver' in window) {
    const observer=new IntersectionObserver(entries=>{
      const visible=entries[0]?.isIntersecting && !document.hidden;
      if (visible!==active) {
        active=visible;
        stop();
        if (active) start();
      }
    },{threshold:0.03});
    observer.observe(root);
  }
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){active=false;stop();}
    else {
      const r=root.getBoundingClientRect();
      active=r.bottom>0&&r.top<innerHeight;
      if(active){stop();start();}
    }
  });
  image.onerror=showError;
  // Start with the first Idea & Design image. Stage is initially selected in HTML.
  start();
})();
