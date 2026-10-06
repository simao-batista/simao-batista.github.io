/* ---------- CONFIG: fill these in, empty = button stays hidden ---------- */
const CONFIG = {
  github:   "",   // e.g. "https://github.com/your-username"
  linkedin: "",   // e.g. "https://www.linkedin.com/in/your-profile"
  video:    "https://www.youtube.com/watch?v=t56WMLTEBsA",   // gameplay video of Silver & Gunpowder (YouTube link)
  repo:     ""    // repository of the game, if public
};
const SKILLS = {
  languages: [["C#",85],["JavaScript",70],["HTML",68],["CSS / Sass",70]],
  tools:     [["Unity",85],["Node.js",60],["Figma → code",70],["Visual Studio Code",70],["Canva",65]],
  hardware:  [["PC repair & building",70]],
  soft:      ["problem solving","teamwork","project management","autonomous learning","organization","time management"]
};
const $ = s => document.querySelector(s);

/* links */
[["#ghLink",CONFIG.github],["#liLink",CONFIG.linkedin],["#videoLink",CONFIG.video],["#repoLink",CONFIG.repo]]
  .forEach(([s,u]) => { const a=$(s); if(u){a.href=u;a.hidden=false;} });
$("#yr").textContent = new Date().getFullYear();

/* skills.json */
(function(){
  const j=$("#skillsJson"); let h='<span class="br">{</span>';
  const row=(n,v)=>`<div class="row"><span class="name"><span class="key">"${n}"</span>:</span><span class="meter" title="${v}%"><span data-w="${v}"></span></span><span class="num">${v}</span></div>`;
  for(const g of ["languages","tools","hardware"]){
    h+=`<div class="row"><span class="key">"${g}"</span>: <span class="br">{</span></div>`;
    SKILLS[g].forEach(([n,v])=>h+=row(n,v)); h+=`<div class="row"><span class="br">},</span></div>`;
  }
  h+=`<div class="row"><span class="key">"soft"</span>: <span class="br">[</span>${SKILLS.soft.map(s=>`<span class="str">"${s}"</span>`).join(", ")}<span class="br">]</span></div><span class="br">}</span>`;
  j.innerHTML=h;
  new IntersectionObserver((es,o)=>es.forEach(e=>{if(e.isIntersecting){j.querySelectorAll("[data-w]").forEach(m=>m.style.width=m.dataset.w+"%");o.disconnect();}}),{threshold:.3}).observe(j);
})();

/* section reveals */
const revealTargets=[...document.querySelectorAll("main section, footer")];
if(matchMedia("(prefers-reduced-motion: reduce)").matches){
  revealTargets.forEach(el=>el.classList.add("rv","in"));
}else if("IntersectionObserver" in window){
  const revealObserver=new IntersectionObserver((entries,observer)=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add("in");observer.unobserve(entry.target);}
  }),{threshold:.08});
  revealTargets.forEach((el,index)=>{
    el.classList.add("rv");
    el.style.setProperty("--d",`${Math.min(index*55,220)}ms`);
    revealObserver.observe(el);
  });
}else{
  revealTargets.forEach(el=>el.classList.add("rv","in"));
}

/* active nav */
const links=[...document.querySelectorAll(".tree a")];
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){links.forEach(l=>l.classList.toggle("on",l.getAttribute("href")==="#"+e.target.id));}
}),{rootMargin:"-40% 0px -55% 0px"});
document.querySelectorAll("main section").forEach(s=>io.observe(s));

/* theme */
const root=document.documentElement;
function setTheme(t){root.dataset.theme=t;try{localStorage.setItem("theme",t)}catch(e){}}
try{const t=localStorage.getItem("theme");if(t)root.dataset.theme=t;}catch(e){}
$("#themeBtn").onclick=()=>setTheme(root.dataset.theme==="dark"?"light":"dark");

/* copy email */
$("#copyBtn").onclick=async e=>{
  try{await navigator.clipboard.writeText("simaobatista981@gmail.com");e.target.textContent="Copied!";}
  catch{e.target.textContent="Copy failed, select the address above";}
  setTimeout(()=>e.target.textContent="Copy address",1800);
};

/* terminal */
const out=$("#out"),input=$("#cmd"),hist=[];let hi=0;
const print=(t,c="")=>{const p=document.createElement("pre");if(c)p.className=c;p.innerHTML=t;out.appendChild(p);out.scrollTop=out.scrollHeight;};
const go=id=>{document.getElementById(id).scrollIntoView({behavior:"smooth"});return `scrolling to ${id}...`;};
const COMMANDS={
  help:()=>`<span class="k">help</span>        list commands
<span class="k">whoami</span>      short intro
<span class="k">about</span>       open about.md
<span class="k">experience</span>  open experience.log
<span class="k">projects</span>    open projects/
<span class="k">skills</span>      open skills.json
<span class="k">education</span>   open education.yml
<span class="k">contact</span>     open contact.sh
<span class="k">theme</span>       switch light/dark
<span class="k">clear</span>       clear the terminal`,
  whoami:()=>`Simão Batista, curious about anything with a compiler.
Computer Systems Management and Programming graduate from Alcobaça, Portugal.
I build websites (Node.js, Sass, Figma → code) and games (Unity, C#).`,
  ls:()=>"about.md  experience.log  projects/  skills.json  education.yml  contact.sh",
  theme:()=>{setTheme(root.dataset.theme==="dark"?"light":"dark");return `theme: ${root.dataset.theme}`;},
  clear:()=>{out.innerHTML="";return null;},
  "sudo hire-me":()=>`<span class="e">[sudo] permission granted.</span> Great choice. Opening contact...${(setTimeout(()=>go("contact"),700),"")}`,
  "git blame":()=>"every bug: Simão (probably a missing semicolon)",
};
["about","experience","projects","skills","education","contact"].forEach(s=>COMMANDS[s]=()=>go(s));
COMMANDS.cd=()=>"you are already home. try 'ls'";
function run(raw){
  const c=raw.trim().toLowerCase(); if(!c)return;
  hist.push(raw);hi=hist.length;
  const d=document.createElement("div");d.innerHTML=`<span class="p">$</span> `;d.append(raw);out.appendChild(d);
  const r=COMMANDS[c]; const res=r?r():`<span class="e">command not found:</span> ${c.replace(/</g,"&lt;")}. Type <span class="k">help</span>.`;
  if(res!==null)print(res); out.scrollTop=out.scrollHeight;
}
input.addEventListener("keydown",e=>{
  if(e.key==="Enter"){run(input.value);input.value="";}
  else if(e.key==="ArrowUp"&&hist.length){hi=Math.max(0,hi-1);input.value=hist[hi];e.preventDefault();}
  else if(e.key==="ArrowDown"){hi=Math.min(hist.length,hi+1);input.value=hist[hi]||"";}
});
document.addEventListener("keydown",e=>{
  if(e.key==="/"&&document.activeElement.tagName!=="INPUT"){e.preventDefault();input.focus();}
});

/* intro: type "whoami" once */
(function(){
  const t=$("#typed"),txt="whoami";
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const done=()=>{print(COMMANDS.whoami());print("Type <span class=\"k\">help</span> to see what I can do. Press <span class=\"k\">/</span> to focus the prompt.");};
  if(reduce){t.textContent=txt;return done();}
  let i=0;const tick=()=>{t.textContent=txt.slice(0,++i);i<txt.length?setTimeout(tick,110):setTimeout(done,350);};
  setTimeout(tick,500);
})();

/* konami */
const K=["arrowup","arrowup","arrowdown","arrowdown","arrowleft","arrowright","arrowleft","arrowright","b","a"];let ki=0;
const toast=document.createElement("div");toast.className="toast";toast.setAttribute("role","status");document.body.appendChild(toast);
let tt;const say=m=>{toast.textContent=m;toast.classList.add("show");clearTimeout(tt);tt=setTimeout(()=>toast.classList.remove("show"),2200);};
addEventListener("keydown",e=>{
  const k=e.key.toLowerCase();
  ki=(k===K[ki])?ki+1:(k===K[0]?1:0);
  if(ki===K.length){ki=0;const on=document.body.classList.toggle("party");say(on?"Konami code accepted: party mode on":"Party mode off");}
});
