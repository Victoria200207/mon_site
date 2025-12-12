/* app.js - StudyBuddy+ frontend demo (FR comments)
   Démo front-end autonome : pas de backend réel, stockage local via localStorage.
*/

// raccourcis DOM
const $ = sel => document.querySelector(sel);

// utilitaire pour formater temps (hh:mm:ss)
const fmtTime = s => new Date(s*1000).toISOString().substr(11,8);

// simulation de capteurs (demo)
function randomEnv(){
  return {
    lux: Math.round(100 + Math.random()*700),
    air: ['Bonne','Moyenne','Mauvaise'][Math.floor(Math.random()*3)],
    noise: Math.round(30 + Math.random()*60)
  };
}

// gestion d'état local (démo)
const STATE_KEY = 'studybuddy_demo_userstate';
function loadState(){ try { return JSON.parse(localStorage.getItem(STATE_KEY)) || {}; } catch(e){ return {}; } }
function saveState(s){ localStorage.setItem(STATE_KEY, JSON.stringify(s)); }

let state = loadState();
let timer = null;
let elapsed = 0;
let running = false;

// éléments
const loginSection = $('#loginSection');
const dashboard = $('#dashboard');
const loginForm = $('#loginForm');
const emailInput = $('#email');
const pwdInput = $('#password');
const togglePwd = $('#togglePwd');
const welcome = $('#welcome');
const sessionStatus = $('#sessionStatus');
const sessionTimer = $('#sessionTimer');
const startBtn = $('#startBtn');
const pauseBtn = $('#pauseBtn');
const stopBtn = $('#stopBtn');
const luxEl = $('#lux');
const airEl = $('#air');
const noiseEl = $('#noise');
const stat1 = $('#stat1'), stat2 = $('#stat2'), stat3 = $('#stat3'), stat4 = $('#stat4');
const userInitials = $('#userInitials');
const userPreview = $('#userPreview');

// toast simple
function toast(msg, time=2200){
  const tpl = $('#toastTpl');
  const node = tpl.content.cloneNode(true).querySelector('.toast');
  node.textContent = msg;
  document.body.appendChild(node);
  setTimeout(()=> node.classList.add('visible'), 10);
  setTimeout(()=> node.classList.add('hide'), time-300);
  setTimeout(()=> node.remove(), time);
}

// Auth (simulée)
function onLogin(e){
  e.preventDefault();
  const email = emailInput.value.trim();
  const pwd = pwdInput.value;
  if(!email || !pwd){ toast('Remplis les champs'); return; }
  state.user = {email, initials: email.split('@')[0].slice(0,2).toUpperCase()};
  saveState(state);
  showDashboard();
}

// affichage dashboard
function showDashboard(){
  loginSection.classList.add('hidden');
  dashboard.classList.remove('hidden');
  const u = state.user || {email:'Invité', initials:'SB'};
  welcome.textContent = `Bienvenue ${u.email.split('@')[0] || 'Étudiant'}`;
  userInitials.textContent = u.initials;
  userPreview.classList.remove('hidden');
  tickEnv(); updateStats(); drawDemoChart();
}

// toggle mot de passe
togglePwd.addEventListener('click', ()=>{
  const t = pwdInput.type === 'password' ? 'text' : 'password';
  pwdInput.type = t;
});

// handlers
loginForm.addEventListener('submit', onLogin);
$('#createAccount').addEventListener('click', ()=> toast('Création de compte simulée — entre un email et mot de passe', 2500));

// contrôles de session
startBtn.addEventListener('click', ()=>{
  if(!running){
    running = true;
    state.lastStart = Date.now();
    saveState(state);
    sessionStatus.textContent = 'En cours';
    timer = setInterval(()=>{
      elapsed += 1;
      sessionTimer.textContent = fmtTime(elapsed);
    }, 1000);
    toast('Session démarrée');
  } else { toast('Session déjà démarrée'); }
});

pauseBtn.addEventListener('click', ()=>{
  if(running){
    clearInterval(timer); running = false; toast('Session mise en pause'); sessionStatus.textContent = 'En pause';
  } else { toast('Aucune session en cours'); }
});

stopBtn.addEventListener('click', ()=>{
  if(elapsed>0){
    state.sessions = state.sessions || [];
    state.sessions.push({duration: elapsed, when: Date.now()});
    saveState(state);
    elapsed = 0;
    clearInterval(timer); running = false;
    sessionTimer.textContent = '00:00:00';
    sessionStatus.textContent = 'Terminée';
    updateStats();
    toast('Session enregistrée');
  } else { toast('Aucune session à arrêter'); }
});

// mise à jour des valeurs environnementales (simulées)
function tickEnv(){
  const env = randomEnv();
  $('#lux').textContent = env.lux + ' lx';
  $('#air').textContent = env.air;
  $('#noise').textContent = env.noise + ' dB';
  state.lastEnv = {time: Date.now(), ...env};
  saveState(state);
  setTimeout(tickEnv, 4000 + Math.random()*3000);
}

// statistiques (basique)
function updateStats(){
  const sess = state.sessions || [];
  const today = new Date().toDateString();
  const todaySessions = sess.filter(s=> new Date(s.when).toDateString() === today);
  const totalMinutes = sess.reduce((a,b)=>a + Math.round(b.duration/60), 0);
  const streak = computeStreak(sess);
  stat1.textContent = todaySessions.length;
  stat2.textContent = totalMinutes + ' min';
  stat3.textContent = streak;
  stat4.textContent = Math.min(100, Math.round(Math.random()*100)) + '%';
}

// calcul streak simple
function computeStreak(sessions){
  if(!sessions.length) return 0;
  const days = Array.from(new Set(sessions.map(s=> new Date(s.when).toDateString()))).sort().reverse();
  let streak = 0, cur = new Date();
  for(let i=0;i<days.length;i++){
    const d = new Date(days[i]);
    if(d.toDateString() === cur.toDateString()){ streak++; cur.setDate(cur.getDate()-1); }
    else break;
  }
  return streak;
}

// dessin du graphique demo
function drawDemoChart(){
  const canvas = $('#historyChart');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const data = Array.from({length:7}, ()=> Math.round(Math.random()*120));
  const w = canvas.width, h = canvas.height;
  const max = Math.max(...data, 10);
  const pad = 30;
  const barW = (w - pad*2) / data.length * 0.7;
  ctx.fillStyle = '#333';
  ctx.font = '12px Inter';
  for(let i=0;i<data.length;i++){
    const x = pad + i*((w-pad*2)/data.length) + ((w-pad*2)/data.length - barW)/2;
    const barH = (data[i]/max) * (h - pad*2);
    ctx.fillStyle = '#c15454';
    ctx.fillRect(x, h - pad - barH, barW, barH);
    ctx.fillStyle = '#111';
    ctx.fillText(data[i] + ' min', x, h - pad - barH - 6);
    ctx.fillText(['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'][i], x, h - 6);
  }
}

// actions supplémentaires (simulations)
$('#playLofi').addEventListener('click', ()=> toast('LOFI: lecture simulée'));
$('#stopLofi').addEventListener('click', ()=> toast('LOFI: arrêt simulé'));
$('#addHomework').addEventListener('click', ()=> toast('Ajouter devoir (simulé)'));
$('#addExam').addEventListener('click', ()=> toast('Ajouter examen (simulé)'));

// auto-login si already stored (demo)
if(state.user && state.user.email){
  window.addEventListener('load', ()=> showDashboard());
}

// header transition au scroll
let ticking=false;
function updateHeader(){
  const header = document.getElementById('mainHeader');
  if(window.scrollY > 40) header.classList.add('scrolled'); else header.classList.remove('scrolled');
  ticking=false;
}
window.addEventListener('scroll', ()=>{ if(!ticking){ requestAnimationFrame(updateHeader); ticking=true; } }, {passive:true});
