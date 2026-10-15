/* Local RGB glitches activated by pointerdown: mouse or touch. No permanent trails. */
(()=>{
 const canvas=document.getElementById('game-glitch');if(!canvas)return;
 const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const palettes=[['#00eaff','#fc2679','#29fb67','#ffffff'],['#ff268d','#00e9fe','#b34cff','#ffffff'],['#46f872','#02aefa','#f42f77','#ffffff'],['#a454ff','#2eeafa','#ff416a','#ffffff'],['#ff4d5b','#1bdfff','#3fff72','#ffffff'],['#1a7eff','#fc3ef7','#34ffbf','#ffffff']];
 const random=(a,b)=>a+Math.random()*(b-a);
 let previous=-1,bursts=[],raf=0,width=1,height=1,ratio=1;
 function resize(){width=innerWidth;height=innerHeight;ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0)}
 function spawn(x,y){let index=Math.floor(Math.random()*(palettes.length-1));if(index>=previous)index++;previous=index;
 const colors=palettes[index],span=width<740?random(130,210):random(180,260);
 const strips=Array.from({length:24},()=>({x:random(-span*.55,span*.25),y:random(-span*.33,span*.33),w:random(14,span*.75),h:random(1,4),c:colors[Math.floor(random(0,colors.length))],v:random(-55,55),delay:random(0,.10)}));
 bursts.push({x,y,strips,born:performance.now(),duration:450});if(bursts.length>4)bursts.shift();if(!raf)raf=requestAnimationFrame(draw)}
 function draw(now){ctx.clearRect(0,0,width,height);bursts=bursts.filter(b=>now-b.born<b.duration);
 for(const b of bursts){const t=(now-b.born)/b.duration,alpha=t<.12?t/.12:Math.pow((1-t)/.88,1.7);
 for(const s of b.strips){if(t<s.delay)continue;ctx.globalAlpha=alpha*(.68+.32*Math.abs(Math.sin(t*61+s.x)));ctx.fillStyle=s.c;ctx.fillRect(b.x+s.x+s.v*t,b.y+s.y,s.w,s.h)}}
 ctx.globalAlpha=1;if(bursts.length&&!reduced.matches)raf=requestAnimationFrame(draw);else{raf=0;ctx.clearRect(0,0,width,height)}}
 addEventListener('resize',resize,{passive:true});resize();
 document.addEventListener('pointerdown',event=>{if(reduced.matches||(event.pointerType==='mouse'&&event.button!==0))return;spawn(event.clientX,event.clientY)},{passive:true});
 reduced.addEventListener?.('change',()=>{if(reduced.matches){bursts=[];cancelAnimationFrame(raf);raf=0;ctx.clearRect(0,0,width,height)}});
})();
