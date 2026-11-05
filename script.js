const audio = document.querySelector('#audio');
const canvas = document.querySelector('#sky');
const ctx = canvas.getContext('2d');
const playButton = document.querySelector('#playButton');
const playIcon = document.querySelector('#playIcon');
const seek = document.querySelector('#seek');
const elapsed = document.querySelector('#elapsed');
const duration = document.querySelector('#duration');
const intro = document.querySelector('#intro');
const currentWord = document.querySelector('#currentWord');
const editor = document.querySelector('#editor');

const STORAGE_KEY = 'reflections-constellation-timings-v1';
let words = loadWords();
let stars = [];
let ambient = [];
let lastActive = -1;
let width = 0, height = 0, dpr = 1;

function loadWords(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]').sort((a,b)=>a.time-b.time); }
  catch { return []; }
}
function saveWords(){
  words.sort((a,b)=>a.time-b.time);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
  renderWordList();
}
function formatTime(value){
  if(!Number.isFinite(value)) return '00:00';
  const m = Math.floor(value/60), s = Math.floor(value%60);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function resize(){
  const rect = canvas.getBoundingClientRect();
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = rect.width; height = rect.height;
  canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ambient = Array.from({length:Math.max(90,Math.floor(width*height/5200))},()=>({
    x:Math.random()*width,y:Math.random()*height,r:Math.random()*1.05+.2,a:Math.random()*.45+.08,phase:Math.random()*6.28
  }));
  layoutStars();
}
function layoutStars(){
  stars = words.map((item,i)=>{
    const angle = i*2.399963;
    const radius = 18 + Math.sqrt(i+1)*Math.min(width,height)*.052;
    return {x:width/2+Math.cos(angle)*radius,y:height/2+Math.sin(angle)*radius*.62,item};
  });
}
function draw(now=0){
  ctx.clearRect(0,0,width,height);
  ambient.forEach(p=>{
    const twinkle=.72+.28*Math.sin(now*.0008+p.phase);
    ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle=`rgba(225,232,255,${p.a*twinkle})`;ctx.fill();
  });
  const activeIndex = words.reduce((found,w,i)=>w.time<=audio.currentTime?i:found,-1);
  const visible = stars.slice(0,activeIndex+1);
  if(visible.length>1){
    ctx.beginPath();
    visible.forEach((s,i)=>i===0?ctx.moveTo(s.x,s.y):ctx.lineTo(s.x,s.y));
    ctx.strokeStyle='rgba(225,232,255,.38)';ctx.lineWidth=.7;ctx.stroke();
  }
  visible.forEach((s,i)=>{
    const isActive=i===activeIndex;
    const isSpecial=!!s.item.highlight;
    const pulse=isActive?1+.18*Math.sin(now*.006):1;
    const radius=(isSpecial?2.1:1.25)*(isActive?pulse:1);
    if(isSpecial || isActive){
      const glow=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,isSpecial?38:19);
      glow.addColorStop(0,isSpecial?'rgba(255,255,255,.62)':'rgba(220,230,255,.32)');
      glow.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(s.x,s.y,isSpecial?38:19,0,Math.PI*2);ctx.fill();
    }
    ctx.beginPath();ctx.arc(s.x,s.y,radius,0,Math.PI*2);
    ctx.fillStyle=isSpecial?'#fff':'rgba(245,247,255,.92)';ctx.fill();
  });
  requestAnimationFrame(draw);
}
function update(){
  const t=audio.currentTime;
  elapsed.textContent=formatTime(t);
  if(Number.isFinite(audio.duration)&&audio.duration>0){
    duration.textContent=formatTime(audio.duration);
    seek.value=String(t/audio.duration*1000);
  }
  const index=words.reduce((found,w,i)=>w.time<=t?i:found,-1);
  if(index!==lastActive){
    lastActive=index;
    if(index>=0){
      currentWord.textContent=words[index].word;
      currentWord.classList.add('show');
      intro.classList.add('hide');
    }else{
      currentWord.classList.remove('show');
      intro.classList.remove('hide');
    }
  }
}
function renderWordList(){
  const list=document.querySelector('#wordList');
  list.innerHTML='';
  words.forEach((item,index)=>{
    const row=document.createElement('div');row.className='word-row';
    const time=document.createElement('input');time.type='number';time.min='0';time.step='.01';time.value=item.time;
    time.addEventListener('change',()=>{item.time=Math.max(0,Number(time.value)||0);saveWords();});
    const word=document.createElement('input');word.type='text';word.maxLength=32;word.value=item.word;
    word.addEventListener('change',()=>{item.word=word.value.trim()||item.word;saveWords();});
    const tag=document.createElement('span');tag.className='tag';tag.textContent=item.highlight?'SPECIAL GLOW':'STAR';
    const remove=document.createElement('button');remove.className='remove';remove.textContent='×';remove.title='Remove word';
    remove.addEventListener('click',()=>{words.splice(index,1);saveWords();layoutStars();});
    row.append(time,word,tag,remove);list.append(row);
  });
  layoutStars();
}
playButton.addEventListener('click',async()=>{
  if(audio.paused){try{await audio.play();}catch(e){alert('Die Audiodatei konnte nicht abgespielt werden. Bitte prüfe, ob assets/reflections.mp3 vorhanden ist.');}}
  else audio.pause();
});
audio.addEventListener('play',()=>playIcon.textContent='Ⅱ');
audio.addEventListener('pause',()=>playIcon.textContent='▶');
audio.addEventListener('timeupdate',update);
audio.addEventListener('loadedmetadata',()=>{duration.textContent=formatTime(audio.duration);});
audio.addEventListener('ended',()=>{playIcon.textContent='▶';});
seek.addEventListener('input',()=>{if(Number.isFinite(audio.duration))audio.currentTime=Number(seek.value)/1000*audio.duration;update();});
document.querySelector('#restartButton').addEventListener('click',()=>{audio.currentTime=0;update();});
document.querySelector('#editorToggle').addEventListener('click',()=>editor.classList.toggle('hidden'));
document.querySelector('#closeEditor').addEventListener('click',()=>editor.classList.add('hidden'));
document.querySelector('#addWord').addEventListener('click',()=>{
  const word=document.querySelector('#wordInput').value.trim();
  if(!word){alert('Enter a word first.');return;}
  const manual=document.querySelector('#timeInput').value;
  const time=manual===''?audio.currentTime:Number(manual);
  if(!Number.isFinite(time)||time<0){alert('Enter a valid timestamp.');return;}
  words.push({word,time,highlight:document.querySelector('#highlightInput').checked});
  document.querySelector('#wordInput').value='';
  document.querySelector('#timeInput').value='';
  document.querySelector('#highlightInput').checked=false;
  saveWords();
});
document.querySelector('#exportJson').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify(words,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='reflections-timings.json';a.click();URL.revokeObjectURL(url);
});
document.querySelector('#importJson').addEventListener('change',async e=>{
  const file=e.target.files[0];if(!file)return;
  try{
    const data=JSON.parse(await file.text());
    if(!Array.isArray(data)||!data.every(x=>typeof x.word==='string'&&Number.isFinite(Number(x.time))))throw new Error();
    words=data.map(x=>({word:x.word,time:Number(x.time),highlight:!!x.highlight}));saveWords();
  }catch{alert('Invalid timing JSON file.');}
  e.target.value='';
});
document.querySelector('#clearWords').addEventListener('click',()=>{
  if(confirm('Delete all word timings?')){words=[];saveWords();}
});
window.addEventListener('resize',resize);
resize();renderWordList();requestAnimationFrame(draw);update();
