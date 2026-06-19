const symbolDefs = {
  red7:{label:'RED 7', src:'assets/reel-symbols/red7.png'},
  blue7:{label:'BLUE 7', src:'assets/reel-symbols/blue7.png'},
  bar:{label:'BAR', src:'assets/reel-symbols/bar.png'},
  bell:{label:'BAT', src:'assets/reel-symbols/bat.png'},
  suika:{label:'AMMO', src:'assets/reel-symbols/ammo.png'},
  cherry:{label:'CHERRY', src:'assets/reel-symbols/cherry.png'},
  replay:{label:'REPLAY', src:'assets/reel-symbols/replay.png'},
  hero:{label:'HERO', src:'assets/reel-symbols/hero.png'}
};

const reelMap = [
 ['replay','bell','red7','replay','blue7','bell','cherry','suika','replay','bell','bar','hero','replay','bell','blue7','cherry','suika','bell','replay','red7','bar'],
 ['bell','replay','blue7','bell','suika','bar','replay','bell','red7','cherry','hero','replay','bell','suika','blue7','bell','bar','replay','cherry','red7','bell'],
 ['replay','bell','bar','blue7','bell','suika','cherry','replay','red7','bell','hero','replay','bell','blue7','suika','bar','replay','cherry','bell','red7','replay']
];

const payLines = [
 {key:'top', label:'上段', rows:[0,0,0], weight:2},
 {key:'middle', label:'中段', rows:[1,1,1], weight:5},
 {key:'bottom', label:'下段', rows:[2,2,2], weight:2},
 {key:'down', label:'右下がり', rows:[0,1,2], weight:3},
 {key:'up', label:'右上がり', rows:[2,1,0], weight:3}
];

const chancePatterns = [
 {label:'CHANCE目A', symbols:['cherry','suika','bell'], rows:[0,1,2]},
 {label:'CHANCE目B', symbols:['bell','cherry','suika'], rows:[2,1,0]},
 {label:'CHANCE目C', symbols:['suika','bell','cherry'], rows:[1,0,1]},
 {label:'HERO目', symbols:['hero','cherry','hero'], rows:[0,1,2]}
];
const REEL_STEP_MS = 70;
const MAX_SLIP = 4;
const LONG_FREEZE_BLACKOUT_MS = 3000;
const LONG_FREEZE_MOVIE_MS = 14000;
const performanceExpect = {
  idle:.01,
  enemy_walk:.03,
  hero_run:.06,
  item_get:.04,
  ammo_event:.12,
  cherry_notice:.15,
  shadow:.25,
  warning:.40,
  survive:.75,
  silent:.02,
  silentContradiction:.90
};
const bonusNoticeWeights = [
  {type:'instant', weight:30},
  {type:'push', weight:25},
  {type:'delayed', weight:20},
  {type:'next', weight:15},
  {type:'weird', weight:10}
];

const bonusTable = {
  1:{solo:1/430, bell:1/8.45, regBias:.27, sbb:.16, blueBias:.43},
  2:{solo:1/405, bell:1/8.30, regBias:.29, sbb:.18, blueBias:.57},
  3:{solo:1/378, bell:1/8.15, regBias:.31, sbb:.17, blueBias:.44},
  4:{solo:1/342, bell:1/7.95, regBias:.34, sbb:.19, blueBias:.58},
  5:{solo:1/312, bell:1/7.78, regBias:.36, sbb:.18, blueBias:.45},
  6:{solo:1/278, bell:1/7.55, regBias:.39, sbb:.20, blueBias:.58}
};

// エヴァ系Aタイプ風。完全コピーではなく、ゾンビ版向けに調整した小役重複テーブル。
const baseRoles = [
  {role:'REPLAY', chance:1/7.3, center:['replay','replay','replay'], pay:0, badge:'REPLAY', effect:'avoid', overlap:1/95},
  // BELL uses the bat artwork as the bell-equivalent payout symbol.
  {role:'BELL', chance:null, center:['bell','bell','bell'], pay:8, badge:'BAT', effect:'item', overlap:1/360},
  {role:'CHERRY', chance:1/34, center:['cherry','cherry','cherry'], pay:2, badge:'CHERRY', effect:'punch', overlap:1/8.5},
  // SUIKA uses the AMMO artwork as the suika-equivalent payout symbol.
  {role:'SUIKA', chance:1/58, center:['suika','suika','suika'], pay:5, badge:'AMMO', effect:'shoot', overlap:1/6.8},
  {role:'HERO', chance:1/92, center:['hero','hero','hero'], pay:3, badge:'HERO', effect:'punch', overlap:1/3.8},
  {role:'MISS', chance:1, center:null, pay:0, badge:'MISS', effect:'miss', overlap:0}
];

const bonusInfo = {
  SBB_RED:{label:'赤SBB', badge:'SBB', center:['red7','red7','red7'], pay:402, counter:'sbb'},
  SBB_BLUE:{label:'青SBB', badge:'SBB', center:['blue7','blue7','blue7'], pay:402, counter:'sbb'},
  BB_RED:{label:'赤BIG', badge:'BIG', center:['red7','red7','red7'], pay:280, counter:'big'},
  BB_BLUE:{label:'青BIG', badge:'BIG', center:['blue7','blue7','blue7'], pay:280, counter:'big'},
  REG:{label:'REG', badge:'REG', center:['bar','bar','bar'], pay:104, counter:'reg'}
};

const backgrounds = [
 {key:'corridor', label:'廃ビル通路', src:'assets/backgrounds/corridor.png', expect:1.00, boost:0},
 {key:'downtown', label:'ダウンタウン', src:'assets/backgrounds/city_downtown.png', expect:1.16, boost:1/1150},
 {key:'office', label:'オフィス街', src:'assets/backgrounds/city_office_street.png', expect:1.48, boost:1/560},
 {key:'station', label:'地下鉄ホーム', src:'assets/backgrounds/station_platform.png', expect:1.32, boost:1/760},
 {key:'residential', label:'住宅街', src:'assets/backgrounds/residential.png', expect:.86, boost:0}
];

const hero = {
 school:['assets/sprites/hero/school/00.png','assets/sprites/hero/school/01.png','assets/sprites/hero/school/02.png','assets/sprites/hero/school/03.png','assets/sprites/hero/school/04.png','assets/sprites/hero/school/05.png','assets/sprites/hero/school/06.png','assets/sprites/hero/school/07.png','assets/sprites/hero/school/08.png','assets/sprites/hero/school/09.png','assets/sprites/hero/school/10.png'],
 nurse:['assets/sprites/hero/nurse/00.png','assets/sprites/hero/nurse/01.png','assets/sprites/hero/nurse/02.png','assets/sprites/hero/nurse/03.png','assets/sprites/hero/nurse/04.png','assets/sprites/hero/nurse/05.png','assets/sprites/hero/nurse/06.png','assets/sprites/hero/nurse/07.png','assets/sprites/hero/nurse/08.png','assets/sprites/hero/nurse/09.png','assets/sprites/hero/nurse/10.png'],
 kimono:['assets/sprites/hero/kimono/00.png','assets/sprites/hero/kimono/01.png','assets/sprites/hero/kimono/02.png','assets/sprites/hero/kimono/03.png','assets/sprites/hero/kimono/04.png','assets/sprites/hero/kimono/05.png','assets/sprites/hero/kimono/06.png','assets/sprites/hero/kimono/07.png','assets/sprites/hero/kimono/08.png','assets/sprites/hero/kimono/09.png','assets/sprites/hero/kimono/10.png'],
 rush:['assets/sprites/hero/rush/00.png','assets/sprites/hero/rush/01.png','assets/sprites/hero/rush/02.png','assets/sprites/hero/rush/03.png','assets/sprites/hero/rush/04.png','assets/sprites/hero/rush/05.png','assets/sprites/hero/rush/06.png','assets/sprites/hero/rush/07.png','assets/sprites/hero/rush/08.png','assets/sprites/hero/rush/09.png','assets/sprites/hero/rush/10.png']
};
const bonusBackgrounds = {
  SBB_RED:'assets/lcd/bonus-sbb-bg.png',
  SBB_BLUE:'assets/lcd/bonus-sbb-bg.png',
  BB_RED:'assets/lcd/bonus-big-bg.png',
  BB_BLUE:'assets/lcd/bonus-big-bg.png',
  REG:'assets/lcd/bonus-reg-bg.png'
};
const enemyNames = ['highschool_girl','boy_student','cabaret_girl','clerk','college_girl','courier','female_teacher','gal','girl_gym','girl_uniform','security_guard','housewife','influencer','model','office_lady','passenger','receptionist','salaryman','secretary','shopper','station_staff','yankee_boy','yankee_girl'];
const enemyFrames = Object.fromEntries(enemyNames.map(n => [n, Array.from({length:8},(_,i)=>`assets/sprites/enemies/${n}/${String(i).padStart(2,'0')}.png`)]));
const bossDefs = [
 {key:'security', label:'SECURITY CAPTAIN', src:'assets/sprites/bosses/security_captain_boss.png', expect:25},
 {key:'police', label:'POLICE OFFICER', src:'assets/sprites/bosses/police_officer_boss.png', expect:45},
 {key:'gym', label:'GYM TEACHER', src:'assets/sprites/bosses/gym_teacher_boss.png', expect:60},
 {key:'announcer', label:'ANNOUNCER', src:'assets/sprites/bosses/announcer_boss.png', expect:75},
 {key:'queen', label:'ZOMBIE QUEEN', src:'assets/sprites/bosses/zombie_queen_boss.png', expect:90}
];

const $ = q => document.querySelector(q);
const state = {
  credit:50, bet:0, pay:0, diff:0, games:0, big:0, reg:0, sbb:0, bell:0, spinning:false,
  stopped:[true,true,true], result:null, center:['blue7','bell','cherry'], history:[], stage:0,
  enemyA:'highschool_girl', enemyB:'salaryman', pendingBonus:null, bonusReady:false, setting:1, door:0, doorHits:0,
  presentation:'idle', currentSceneCategory:'idle', currentDropSymbol:'-', currentEnemyAction:'idle', currentBossPhase:'-', currentBossAction:'-', heroCostume:'school', heroAction:'idle', heroFrameIndex:0, heroFrameTotal:1, heroFramePath:'assets/sprites/hero/school/00.png', heroLoadStatus:'OK',
  quietGames:0, contradiction:false, settling:false, performancePhase:0, awaitingPushNotice:null, nextGameNotice:null,
  challenge:null, bonusActive:null, reelBases:[0,0,0], stopIndices:[0,0,0], spinStartedAt:0, longFreeze:false, forceLongFreeze:false
};

const heroDebugState = {
  costume:'school',
  action:'idle',
  frame:0,
  fps:4,
  playing:false,
  status:'READY',
  timer:null
};

const els = {
 reels:[...document.querySelectorAll('.reel')], credit:$('#credit'), bet:$('#bet'), pay:$('#pay'), diff:$('#diff'), games:$('#games'), big:$('#bigCount'), reg:$('#regCount'), sbb:$('#sbbCount'), door:$('#doorCount'),
 bonusRate:$('#bonusRate'), bellRate:$('#bellRate'), modeText:$('#modeText'), history:$('#history'), lcdWindow:$('.lcd-window'), stageBg:$('#stageBg'), hero:$('#hero'), enemyA:$('#enemyA'), enemyB:$('#enemyB'),
 lcdStatus:$('#lcdStatus'), flash:$('#screenFlash'), pushBtn:$('#pushBtn'), settingSelect:$('#settingSelect'),
 prizeScene:$('#prizeScene'), prizeBox:$('#prizeBox'), prizeBurst:$('#prizeBurst'), prizeSymbol:$('#prizeSymbol'),
 bossBattle:$('#bossBattle'), bossSprite:$('#bossSprite'), bossRate:$('#bossRate'),
 longFreeze:$('#longFreeze'), longFreezeVideo:$('#longFreezeVideo')
};

const timers = {};
function clearAnim(name){ if(timers[name]){ clearInterval(timers[name]); timers[name] = null; } }
function clearTimer(name){ if(timers[name]){ clearTimeout(timers[name]); timers[name] = null; } }
const soundManager = (() => {
 const bgmPaths = {
   normal:'assets/audio/normal.mp3',
   boss:'assets/audio/boss.mp3',
   rush:'assets/audio/rush.mp3'
 };
 const seTones = {
   bet:[520,.045,'square',.32], lever:[180,.07,'sawtooth',.38], reel_start:[260,.08,'triangle',.34],
   stop1:[360,.04,'square',.34], stop2:[400,.04,'square',.34], stop3:[450,.05,'square',.36],
   payout:[700,.06,'sine',.42], rare:[880,.12,'triangle',.62], warning:[120,.22,'sawtooth',.74],
   survive:[180,.28,'sawtooth',.78], push_notice:[980,.09,'triangle',.7], push:[620,.06,'square',.55],
   bonus_confirm:[1040,.45,'triangle',.86], bonus_start:[760,.22,'sawtooth',.76],
   bonus_chance_start:[160,.28,'sawtooth',.72], bonus_chance_win:[920,.34,'triangle',.82],
   bonus_chance_lose:[110,.25,'sawtooth',.5], revive:[720,.42,'triangle',.86], freeze:[55,.8,'sawtooth',.8],
   hit:[140,.1,'sawtooth',.58], attack:[260,.08,'square',.58], shoot:[1250,.055,'square',.64], bat_attack:[300,.075,'square',.62]
 };
 const seMap = {
   bet:'bet', lever:'lever', stop1:'stop', stop2:'stop', stop3:'stop',
   payout:'item', rare:'stage_change', warning:'stage_change', survive:'stage_change',
   push_notice:'stage_change', push:'lever', bonus_confirm:'bonus_confirm', bonus_confirm2:'bonus_confirm2',
   bonus_start:'stage_change', bonus_chance_start:'stage_change', bonus_chance_win:'bonus_confirm',
   bonus_chance_lose:'moan', revive:'bonus_confirm2', freeze:'freeze', hit:'hit',
   attack:'hit', shoot:'shoot', bat_attack:'hit', run:'run', zombie_walk:'moan',
   zombie_die:'zombie_die', item:'item', stage_change:'stage_change', moan:'moan', stop:'stop'
 };
 const disabledSe = new Set(['reel_start','reel_loop']);
 const data = {
   unlocked:false,
   muted:localStorage.getItem('dieYetSoundMuted') === '1',
   volume:Number(localStorage.getItem('dieYetSoundVolume') || .7),
   bgmVolume:.45,
   seVolume:.7,
   currentBgmName:null,
   desiredBgm:null,
   bgm:{},
   ctx:null,
   reelLoop:null,
   reelLoopDisabled:true,
   fadeTimer:null,
   duckTimer:null,
   seCache:{},
   lastSe:'-',
   lastSeMode:'-',
   bonusConfirmBusy:false
 };
 Object.entries(bgmPaths).forEach(([name, src]) => {
   const audio = new Audio(src);
   audio.loop = true;
   audio.preload = 'auto';
   audio.addEventListener('error', () => console.warn(`[sound] BGM load failed: ${src}`));
   data.bgm[name] = audio;
 });
 function ctx(){
   if(data.ctx) return data.ctx;
   const Ctx = window.AudioContext || window.webkitAudioContext;
   if(!Ctx) return null;
   data.ctx = new Ctx();
   return data.ctx;
 }
 function effectiveVolume(kind='se'){
   if(data.muted) return 0;
   return data.volume * (kind === 'bgm' ? data.bgmVolume : data.seVolume);
 }
 function applyBgmVolume(){
   Object.values(data.bgm).forEach(audio => { audio.volume = effectiveVolume('bgm'); });
 }
 function updateUi(){
   const toggle = $('#soundToggle');
   const slider = $('#soundVolume');
   if(toggle) toggle.textContent = data.muted ? 'SOUND OFF' : (data.unlocked ? 'SOUND ON' : 'SOUND READY');
   if(slider) slider.value = String(Math.round(data.volume * 100));
   updateSoundDebug();
 }
 async function unlockAudio(){
   if(data.unlocked) return true;
   const c = ctx();
   try{
     if(c?.state === 'suspended') await c.resume();
     data.unlocked = true;
     applyBgmVolume();
     if(data.desiredBgm) playBgm(data.desiredBgm);
     else ensureContextualBgm();
     updateUi();
     return true;
   }catch(e){
     console.warn('[sound] unlock failed', e);
     return false;
   }
 }
 function playBgm(name){
   data.desiredBgm = name;
   if(!bgmPaths[name]) return;
   if(!data.unlocked || data.muted) { updateUi(); return; }
   if(data.currentBgmName === name && !data.bgm[name].paused) return;
   stopBgm(false);
   const audio = data.bgm[name];
   data.currentBgmName = name;
   audio.loop = true;
   audio.currentTime = 0;
   audio.volume = effectiveVolume('bgm');
   audio.play().catch(e => console.warn(`[sound] BGM play failed: ${bgmPaths[name]}`, e));
   updateUi();
 }
 function stopBgm(clearDesired=true){
   clearInterval(data.fadeTimer);
   data.fadeTimer = null;
   Object.values(data.bgm).forEach(audio => { audio.pause(); audio.currentTime = 0; });
   data.currentBgmName = null;
   if(clearDesired) data.desiredBgm = null;
   updateUi();
 }
 function fadeOutBgm(ms=600, next=null){
   clearInterval(data.fadeTimer);
   const audio = data.currentBgmName ? data.bgm[data.currentBgmName] : null;
   if(!audio || audio.paused){ if(next) playBgm(next); return; }
   const start = audio.volume;
   const steps = Math.max(1, Math.round(ms / 50));
   let tick = 0;
   data.fadeTimer = setInterval(() => {
     tick++;
     audio.volume = Math.max(0, start * (1 - tick / steps));
     if(tick >= steps){
       clearInterval(data.fadeTimer);
       data.fadeTimer = null;
       stopBgm(false);
       if(next) playBgm(next);
     }
   }, 50);
 }
 function switchBgm(name, fade=true){
   data.desiredBgm = name;
   if(data.currentBgmName === name){
     if(data.bgm[name]?.paused) playBgm(name);
     return;
   }
   if(fade && data.currentBgmName) fadeOutBgm(500, name);
   else playBgm(name);
 }
 function tone(freq, duration, type='sine', vol=.5, delay=0){
   const c = ctx();
   if(!c || !data.unlocked || data.muted) return;
   const osc = c.createOscillator();
   const gain = c.createGain();
   const now = c.currentTime + delay;
   osc.type = type;
   osc.frequency.setValueAtTime(freq, now);
   gain.gain.setValueAtTime(0.0001, now);
   gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, effectiveVolume('se') * vol), now + .01);
   gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
   osc.connect(gain).connect(c.destination);
   osc.start(now);
   osc.stop(now + duration + .03);
 }
 function seAudio(key){
   if(data.seCache[key]) return data.seCache[key];
   const audio = new Audio(`assets/audio/se/${key}.mp3`);
   audio.preload = 'auto';
   audio.addEventListener('error', () => console.warn(`[sound] SE load failed, fallback: assets/audio/se/${key}.mp3`));
   data.seCache[key] = audio;
   return audio;
 }
 function playFileSe(key, onEnded=null){
   const base = seAudio(key);
   const audio = base.cloneNode();
   audio.volume = effectiveVolume('se');
   audio.onended = onEnded;
   audio.play().then(() => {
     data.lastSe = key;
     data.lastSeMode = `file: assets/audio/se/${key}.mp3`;
     updateUi();
   }).catch(e => {
     console.warn(`[sound] SE play failed, fallback: ${key}`, e);
     data.lastSe = key;
     data.lastSeMode = 'fallback';
     const t = seTones[key] || seTones.push;
     tone(t[0], t[1], t[2], t[3]);
     updateUi();
   });
 }
 function playBonusConfirm(){
   if(data.bonusConfirmBusy) return;
   data.bonusConfirmBusy = true;
   playFileSe('bonus_confirm', () => {
     playFileSe('bonus_confirm2', () => { data.bonusConfirmBusy = false; updateUi(); });
   });
   setTimeout(() => { data.bonusConfirmBusy = false; updateUi(); }, 4500);
 }
 function playSe(name){
   const mapped = seMap[name] || name;
   data.lastSe = `${name} -> ${mapped}`;
   if(disabledSe.has(name) || disabledSe.has(mapped)){
     data.lastSeMode = 'disabled';
     updateUi();
     return;
   }
   if(!data.unlocked || data.muted) return;
   if(mapped === 'bonus_confirm'){
     playBonusConfirm();
     return;
   }
   playFileSe(mapped);
 }
 function startReelLoop(){
   data.reelLoop = null;
   data.lastSe = 'reel_loop';
   data.lastSeMode = 'disabled';
   updateUi();
 }
 function stopReelLoop(){
   if(!data.reelLoop) return;
   try{ data.reelLoop.gain.gain.exponentialRampToValueAtTime(.0001, ctx().currentTime + .08); data.reelLoop.osc.stop(ctx().currentTime + .1); }catch(e){}
   data.reelLoop = null;
   updateUi();
 }
 function duck(ms=450, scale=.18){
   clearTimeout(data.duckTimer);
   Object.values(data.bgm).forEach(audio => { audio.volume = effectiveVolume('bgm') * scale; });
   data.duckTimer = setTimeout(applyBgmVolume, ms);
 }
 function setMuted(flag){
   data.muted = !!flag;
   localStorage.setItem('dieYetSoundMuted', data.muted ? '1' : '0');
   applyBgmVolume();
   if(data.muted){ stopReelLoop(); Object.values(data.bgm).forEach(a => a.pause()); }
   else if(data.unlocked) ensureContextualBgm();
   updateUi();
 }
 function setVolume(value){
   data.volume = Math.max(0, Math.min(1, Number(value)));
   localStorage.setItem('dieYetSoundVolume', String(data.volume));
   applyBgmVolume();
   if(data.reelLoop) data.reelLoop.gain.gain.value = effectiveVolume('se') * .25;
   updateUi();
 }
 function ensureContextualBgm(){
   if(!data.unlocked || data.muted) return;
   if(state?.challenge) switchBgm('boss', true);
   else if(state?.bonusActive || state?.door > 0) switchBgm('rush', true);
   else if(state?.pendingBonus || state?.longFreeze) stopBgm(false);
   else switchBgm('normal', true);
 }
 function getState(){
   return {currentBgmName:data.currentBgmName || '-', desiredBgm:data.desiredBgm || '-', muted:data.muted, volume:data.volume, unlocked:data.unlocked, reelLoop:'disabled', lastSe:data.lastSe, lastSeMode:data.lastSeMode};
 }
 return {unlockAudio, playBgm, stopBgm, fadeOutBgm, switchBgm, playSe, setMuted, setVolume, startReelLoop, stopReelLoop, duck, ensureContextualBgm, getState};
})();
function playFrames(img, frames, fps=8, name='anim', loop=true){
 clearAnim(name); if(!frames?.length) return; let i=0;
 if(name === 'hero'){
   img.onload = () => { state.heroLoadStatus = 'OK'; updateHeroRuntimeDebug(); };
   img.onerror = () => { state.heroLoadStatus = 'FAILED'; updateHeroRuntimeDebug(); };
 }
 img.src=frames[0];
 if(name === 'hero') setHeroFrameDebug(frames, i);
 if(frames.length <= 1) return;
 const interval = Math.max(60, Math.round(1000/fps));
 timers[name]=setInterval(()=>{ i++; if(i>=frames.length){ if(!loop){ i=frames.length-1; clearAnim(name); }else i=0; } img.src=frames[i]; if(name === 'hero') setHeroFrameDebug(frames, i); }, interval);
}
function costumeFrames(costume='school'){
 return hero[costume] || hero.school;
}
function normalizeHeroAction(action='idle'){
 const a = String(action || 'idle');
 if(['idle','stand','wait'].includes(a)) return 'idle';
 if(['run','walk','dash'].includes(a)) return 'run';
 if(['bat_attack','attack','bat','swing','melee'].includes(a)) return 'bat_attack';
 if(['shoot','gun','fire'].includes(a)) return 'shoot';
 if(['hit','damage','hurt'].includes(a)) return 'hit';
 if(['down','dead','knockout','lose'].includes(a)) return 'down';
 return a;
}
function resolveHeroCostume(costume='school'){
 return hero[costume] ? costume : 'school';
}
function heroFramePaths(action='idle', costume=state.heroCostume){
 const resolvedCostume = resolveHeroCostume(costume);
 const normalized = normalizeHeroAction(action);
 const b = costumeFrames(resolvedCostume);
 if(action === 'rush') return hero.rush;
 if(action === 'special') return [b[1],b[2],b[3],b[5],b[6],b[7],b[8],b[9]].filter(Boolean);
 if(normalized === 'idle') return [b[0]].filter(Boolean);
 if(normalized === 'run') return [b[1],b[2],b[3],b[4],b[3],b[2]].filter(Boolean);
 if(normalized === 'bat_attack') return [b[5],b[6],b[5],b[0]].filter(Boolean);
 if(normalized === 'shoot') return [b[7],b[8]].filter(Boolean);
 if(normalized === 'hit') return [b[9]].filter(Boolean);
 if(normalized === 'down') return [b[10]].filter(Boolean);
 return [b[0]].filter(Boolean);
}
function heroActionFps(action='idle'){
 const normalized = normalizeHeroAction(action);
 if(action === 'rush') return 11;
 if(action === 'special') return 9;
 if(normalized === 'run') return 8;
 if(normalized === 'bat_attack') return 8;
 if(normalized === 'shoot') return 7;
 if(normalized === 'hit') return 7;
 if(normalized === 'down') return 3;
 return 3;
}
function setHeroFrameDebug(frames, index){
 state.heroFrameIndex = index;
 state.heroFrameTotal = frames.length;
 state.heroFramePath = frames[index] || frames[0] || '';
 state.heroLoadStatus = state.heroFramePath ? 'LOADING/OK' : 'NO FRAME';
 updateHeroRuntimeDebug();
}
function chooseHeroCostume(performanceType, role, flags={}){
 if(flags.sbb) return 'rush';
 if(flags.contradiction) return weightedChoice([{value:'school',weight:25},{value:'nurse',weight:25},{value:'kimono',weight:50}]);
 if(flags.bonusExpectation) return weightedChoice([{value:'school',weight:50},{value:'nurse',weight:25},{value:'kimono',weight:25}]);
 if(flags.challengePrelude) return weightedChoice([{value:'school',weight:45},{value:'nurse',weight:25},{value:'kimono',weight:30}]);
 if(role === 'MISS') return weightedChoice([{value:'school',weight:99},{value:'nurse',weight:1}]);
 if(performanceType === 'item_get' || performanceType === 'ammo_event') return weightedChoice([{value:'nurse',weight:62},{value:'school',weight:34},{value:'kimono',weight:4}]);
 if(performanceType === 'shadow' || performanceType === 'warning' || performanceType === 'survive' || performanceType === 'silentContradiction') return weightedChoice([{value:'kimono',weight:64},{value:'nurse',weight:18},{value:'school',weight:18}]);
 if(performanceType === 'cherry_notice') return role === 'CHERRY' ? weightedChoice([{value:'school',weight:52},{value:'nurse',weight:34},{value:'kimono',weight:14}]) : weightedChoice([{value:'kimono',weight:50},{value:'school',weight:32},{value:'nurse',weight:18}]);
 if(performanceType === 'silent' && flags.roleHit) return weightedChoice([{value:'kimono',weight:42},{value:'nurse',weight:26},{value:'school',weight:32}]);
 if(['CHERRY','SUIKA','HERO'].includes(role)) return weightedChoice([{value:'school',weight:65},{value:'nurse',weight:25},{value:'kimono',weight:10}]);
 if(['REPLAY','BELL'].includes(role)) return weightedChoice([{value:'school',weight:92},{value:'nurse',weight:8}]);
 if(flags.quietBreak) return weightedChoice([{value:'school',weight:94},{value:'nurse',weight:5},{value:'kimono',weight:1}]);
 return 'school';
}
function setHeroCostume(costume){
 if(costume === 'rush' || hero[costume]) state.heroCostume = costume;
 else state.heroCostume = 'school';
}
function heroFrames(action, costume=state.heroCostume){
 return heroFramePaths(action, costume);
}
function enemySeq(name, action){
 const f = enemyFrames[name] || enemyFrames.highschool_girl;
 if(action==='walk' || action==='run') return [f[1],f[2],f[3],f[2]].filter(Boolean);
 if(action==='attack') return [f[4],f[5],f[4]].filter(Boolean);
 if(action==='hit') return [f[6]].filter(Boolean);
 if(action==='down') return [f[7]].filter(Boolean);
 return [f[0]];
}

function init(){
  els.reels.forEach((reel,i)=>reel.innerHTML=`<div class="strip">${buildStrip(reelMap[i])}</div>`);
  renderLegend(); renderStageButtons(); bind(); randomizeActors(); setStage(0); playEffect('idle',''); update(); requestAnimationFrame(()=>setCenter(state.center));
}
function symbolImgHtml(k, alt=symbolDefs[k].label){
 const s = symbolDefs[k];
 return `<img src="${s.src}" alt="${alt}">`;
}
function buildStrip(arr){ return [...arr,...arr,...arr].map(k=>`<div class="symbol">${symbolImgHtml(k)}</div>`).join(''); }
function bind(){
 const unlock = () => soundManager.unlockAudio();
 document.addEventListener('pointerdown', unlock, {once:true});
 document.addEventListener('keydown', unlock, {once:true});
 $('#maxBetBtn').addEventListener('click', () => { soundManager.unlockAudio(); maxBet(); });
 $('#leverBtn').addEventListener('click', () => { soundManager.unlockAudio(); leverOn(); });
 $('#pushBtn').addEventListener('click', () => { soundManager.unlockAudio(); pushAction(); });
 document.querySelectorAll('.stop-hit').forEach(btn=>btn.addEventListener('click',()=>{ soundManager.unlockAudio(); stopReel(Number(btn.dataset.stop)); }));
 $('#resetBtn').addEventListener('click', () => { soundManager.unlockAudio(); reset(); });
 $('#forceFreezeUiBtn')?.addEventListener('click', () => { soundManager.unlockAudio(); reserveLongFreeze(); });
 $('#soundToggle')?.addEventListener('click', () => { soundManager.unlockAudio(); soundManager.setMuted(!soundManager.getState().muted); });
 $('#soundVolume')?.addEventListener('input', e => { soundManager.setVolume(Number(e.target.value) / 100); });
 if(els.settingSelect){
   els.settingSelect.value = String(state.setting);
   els.settingSelect.addEventListener('change', e => { state.setting = Number(e.target.value); update(); });
 }
 soundManager.setVolume(soundManager.getState().volume);
}
function reserveLongFreeze(){
 if(state.spinning || state.challenge || state.bonusActive || state.longFreeze) return;
 state.forceLongFreeze = true;
 clearBonusConfirm();
 soundManager.playSe('warning');
 playEffect('special', 'NEXT FREEZE');
 pushHistory('DEBUG NEXT LONG FREEZE', 0);
 update();
}
function renderLegend(){
 const list=[['red7','RED 7'],['blue7','BLUE 7'],['bar','BAR'],['bell','BAT / BELL'],['suika','AMMO / SUIKA'],['cherry','CHERRY'],['replay','REPLAY'],['hero','HERO']];
 $('#symbolLegend').innerHTML=list.map(([k,l])=>`<div class="legend-item">${symbolImgHtml(k, '')}<span>${l}</span></div>`).join('');
 renderDebugTools();
}
function renderStageButtons(){
 $('#stageButtons').innerHTML=backgrounds.map((b,i)=>`<button data-stage="${i}">${b.label} ${Math.round(b.expect * 100)}%</button>`).join('');
 document.querySelectorAll('[data-stage]').forEach(btn=>btn.addEventListener('click',()=>setStage(Number(btn.dataset.stage), true)));
}
function playStageShift(){
 if(!els.lcdWindow) return;
 els.lcdWindow.classList.remove('stage-shift');
 void els.lcdWindow.offsetWidth;
 els.lcdWindow.classList.add('stage-shift');
 setTimeout(()=>els.lcdWindow?.classList.remove('stage-shift'), 520);
}
function setStage(i, animate=false){
 const next = backgrounds[i] ? i : 0;
 const changed = state.stage !== next;
 state.stage=next;
 if(!state.bonusActive) els.stageBg.src=backgrounds[next].src;
 document.querySelectorAll('[data-stage]').forEach(btn=>btn.classList.toggle('active',Number(btn.dataset.stage)===next));
 if(animate && changed) playStageShift();
}
function setStageByKey(key){
 const index = backgrounds.findIndex(b => b.key === key);
 setStage(index >= 0 ? index : 0, true);
}
function getStageBonusBoost(){ return backgrounds[state.stage]?.boost || 0; }
function chooseRoamingStage(){
 const weights = state.door > 0 ? [1, 3, 4, 3, 1] : [3, 3, 2, 2, 3];
 let total = weights.reduce((a,b)=>a+b,0);
 let r = Math.random() * total;
 for(let i=0;i<weights.length;i++){ if(r < weights[i]) return i; r -= weights[i]; }
 return 0;
}
function randomizeActors(){ state.enemyA = enemyNames[rand(enemyNames.length)]; do{state.enemyB = enemyNames[rand(enemyNames.length)]}while(state.enemyB===state.enemyA); els.enemyA.classList.add('face-left'); els.enemyB.classList.add('face-left'); }
function setHero(action, costume=state.heroCostume){
 const resolvedCostume = resolveHeroCostume(costume);
 state.heroCostume = resolvedCostume;
 state.heroAction = action === 'rush' || action === 'special' ? action : normalizeHeroAction(action);
 playFrames(els.hero, heroFrames(action, resolvedCostume), heroActionFps(action), 'hero', true);
 updateHeroRuntimeDebug();
}
function setHeroOnce(action, costume=state.heroCostume, next='idle', delay=520){
 const resolvedCostume = resolveHeroCostume(costume);
 state.heroCostume = resolvedCostume;
 state.heroAction = normalizeHeroAction(action);
 playFrames(els.hero, heroFrames(action, resolvedCostume), heroActionFps(action), 'hero', false);
 clearTimer('heroOnce');
 timers.heroOnce = setTimeout(() => setHero(next, resolvedCostume), delay);
 updateHeroRuntimeDebug();
}
function setEnemies(action){ state.currentEnemyAction = action; const loop=action!=='down'; playFrames(els.enemyA, enemySeq(state.enemyA,action), action==='walk'?5:7, 'enemyA', loop); playFrames(els.enemyB, enemySeq(state.enemyB,action), action==='walk'?4:6, 'enemyB', loop); }
const normalSceneClasses = ['scene-idle','scene-hint','scene-combat','scene-zombie','scene-run','scene-crate'];
function clearNormalScene(){
 if(!els.lcdWindow) return;
 els.lcdWindow.classList.remove(...normalSceneClasses);
}
function setNormalScene(scene='idle'){
 if(!els.lcdWindow) return;
 clearNormalScene();
 els.lcdWindow.classList.add(`scene-${scene}`);
 state.currentSceneCategory = scene;
}
function setActorShown(heroShown=true, enemyAShown=false, enemyBShown=false){
 if(els.hero) els.hero.style.visibility = heroShown ? 'visible' : 'hidden';
 if(els.enemyA) els.enemyA.style.visibility = enemyAShown ? 'visible' : 'hidden';
 if(els.enemyB) els.enemyB.style.visibility = enemyBShown ? 'visible' : 'hidden';
}
function normalSceneFor(effect){
 if(['item','item_get','supply_check','medkit_notice','ammo_event','ammo_support'].includes(effect)) return 'crate';
 if(['enemy_walk'].includes(effect)) return 'zombie';
 if(['hero_run','avoid'].includes(effect)) return 'run';
 if(['cherry_notice','punch','shoot'].includes(effect)) return 'combat';
 if(['shadow','warning','survive','silentContradiction','silent_kimono','kimono_shadow','kimono_cut_in','kimono_turn','kimono_survive'].includes(effect)) return 'hint';
 return 'idle';
}
function prizeTypeFor(effect, result={}){
 if(result.bonus || effect === 'freeze') return 'freeze';
 if(['enemy_walk'].includes(effect)) return 'horde';
 if(['item','item_get','supply_check','medkit_notice','ammo_event','ammo_support'].includes(effect)) return 'crate';
 if(['cherry_notice','punch','shoot','warning','survive'].includes(effect)) return 'drop';
 return result.role === 'REPLAY' ? 'horde' : 'drop';
}
function clearBossBattle(){
 if(!els.bossBattle) return;
 els.bossBattle.className = 'boss-battle';
 state.currentBossPhase = '-';
 state.currentBossAction = '-';
 clearAnim('boss');
 clearTimer('challenge');
 if(els.lcdWindow) els.lcdWindow.classList.remove('boss-mode');
 if(els.bossSprite){
   els.bossSprite.style.backgroundImage = '';
   els.bossSprite.style.backgroundPosition = '0 0';
 }
 if(els.bossRate) els.bossRate.textContent = '';
}
function showBonusConfirm(){
 if(els.lcdWindow) els.lcdWindow.classList.add('bonus-confirm');
}
function clearBonusConfirm(){
 if(els.lcdWindow) els.lcdWindow.classList.remove('bonus-confirm');
}
function clearLcdMood(){
 if(!els.lcdWindow) return;
 els.lcdWindow.classList.remove('notice-shadow','notice-warning','notice-survive','notice-cherry','notice-ammo','notice-silent','notice-weird','notice-push','notice-revive','notice-supply','notice-medkit','notice-kimono','notice-kimono-cut');
}
function setLcdMood(type, hold=900){
 if(!els.lcdWindow) return;
 clearLcdMood();
 const map = {
   shadow:'notice-shadow',
   warning:'notice-warning',
   survive:'notice-survive',
   cherry_notice:'notice-cherry',
   ammo_event:'notice-ammo',
   silent:'notice-silent',
   silentContradiction:'notice-weird',
   push:'notice-push',
   revive:'notice-revive',
   supply_check:'notice-supply',
   medkit_notice:'notice-medkit',
   ammo_support:'notice-ammo',
   comeback_hint:'notice-medkit',
   silent_kimono:'notice-kimono',
   kimono_shadow:'notice-kimono',
   kimono_cut_in:'notice-kimono-cut',
   kimono_turn:'notice-kimono',
   kimono_survive:'notice-survive'
 };
 const cls = map[type];
 if(cls) els.lcdWindow.classList.add(cls);
 if(cls && hold) setTimeout(()=>els.lcdWindow?.classList.remove(cls), hold);
}
function setBonusLcd(type){
 if(!els.lcdWindow || !els.stageBg) return;
 setActorShown(true, true, true);
 clearNormalScene();
 els.lcdWindow.classList.remove('bonus-sbb','bonus-big','bonus-reg');
 els.lcdWindow.classList.add('bonus-play');
 if(type?.startsWith('SBB')) els.lcdWindow.classList.add('bonus-sbb');
 else if(type === 'REG') els.lcdWindow.classList.add('bonus-reg');
 else els.lcdWindow.classList.add('bonus-big');
 els.stageBg.src = bonusBackgrounds[type] || bonusBackgrounds.BB_RED;
 if(type?.startsWith('SBB')){
   setHero('rush');
   setEnemies('walk');
 }else if(type === 'REG'){
   setHero('melee');
   setEnemies('attack');
 }else{
   setHero('shoot');
   setEnemies('hit');
 }
}
function clearBonusLcd(){
 if(els.lcdWindow) els.lcdWindow.classList.remove('bonus-play','bonus-sbb','bonus-big','bonus-reg');
 if(els.stageBg) els.stageBg.src = backgrounds[state.stage]?.src || backgrounds[0].src;
}
function startLongFreeze(bonus){
 if(!els.longFreeze) return false;
 soundManager.stopReelLoop();
 soundManager.fadeOutBgm(180);
 soundManager.playSe('freeze');
 state.longFreeze = true;
 clearPrizeScene();
 clearBossBattle();
 clearBonusConfirm();
 if(els.lcdWindow) els.lcdWindow.classList.add('long-freeze-on');
 els.longFreeze.classList.add('on','blackout');
 const video = els.longFreezeVideo;
 let finished = false;
 const finish = () => {
   if(finished) return;
   finished = true;
   state.longFreeze = false;
   els.longFreeze.classList.remove('on','blackout');
   if(els.lcdWindow) els.lcdWindow.classList.remove('long-freeze-on');
   if(video){
     video.pause();
     video.currentTime = 0;
   }
   showBonusConfirm();
   soundManager.playSe('bonus_confirm');
   playEffect('special', bonusInfo[bonus]?.badge || 'BONUS');
   update();
 };
 if(video){
   video.currentTime = 0;
   video.onended = null;
   video.muted = soundManager.getState().muted;
   video.volume = soundManager.getState().volume;
 }
 setTimeout(()=>{
   els.longFreeze?.classList.remove('blackout');
   video?.play().catch(()=>{});
 }, LONG_FREEZE_BLACKOUT_MS);
 setTimeout(finish, LONG_FREEZE_BLACKOUT_MS + LONG_FREEZE_MOVIE_MS);
 update();
 return true;
}
function clearLongFreeze(){
 state.longFreeze = false;
 soundManager.stopReelLoop();
 if(els.longFreeze) els.longFreeze.classList.remove('on','blackout');
 if(els.lcdWindow) els.lcdWindow.classList.remove('long-freeze-on');
 if(els.longFreezeVideo){
   els.longFreezeVideo.pause();
   els.longFreezeVideo.currentTime = 0;
 }
}
function chooseBoss(clear){
 const roll = Math.random() * 100;
 if(clear){
   if(roll < 12) return bossDefs[0];
   if(roll < 28) return bossDefs[1];
   if(roll < 50) return bossDefs[2];
   if(roll < 78) return bossDefs[3];
   return bossDefs[4];
 }
 if(roll < 44) return bossDefs[0];
 if(roll < 72) return bossDefs[1];
 if(roll < 90) return bossDefs[2];
 if(roll < 98) return bossDefs[3];
 return bossDefs[4];
}
function setBossFrame(frame){
 if(!els.bossSprite) return;
 els.bossSprite.style.backgroundSize = '800% 100%';
 const pos = Math.max(0, Math.min(7, frame)) * 100 / 7;
 els.bossSprite.style.backgroundPosition = `${pos}% 0`;
}
function bossFramePath(boss, frame){
 const dir = boss.dir || boss.key;
 return `assets/sprites/bosses/${dir}/${String(frame).padStart(2,'0')}.png`;
}
function bossFrames(boss, action){
 if(action === 'run') return [1,2,3,2].map(i => bossFramePath(boss, i));
 if(action === 'attack') return [4,5,4].map(i => bossFramePath(boss, i));
 if(action === 'hit') return [6].map(i => bossFramePath(boss, i));
 if(action === 'down') return [7].map(i => bossFramePath(boss, i));
 return [0].map(i => bossFramePath(boss, i));
}
function fallbackBossSheet(boss, phase){
 if(!els.bossSprite) return;
 els.bossSprite.style.backgroundImage = `url("${boss.src}")`;
 els.bossSprite.style.backgroundRepeat = 'no-repeat';
 els.bossSprite.style.backgroundSize = '800% 100%';
 const frame = phase === 'attack' ? 5 : phase === 'hit' ? 6 : phase === 'down' ? 7 : 1;
 setBossFrame(frame);
}
function playBossFrames(boss, action, phase){
 clearAnim('boss');
 const frames = bossFrames(boss, action);
 state.currentBossAction = action;
 let checked = false;
 const test = new Image();
 test.onload = () => {
   checked = true;
   els.bossSprite.style.backgroundRepeat = 'no-repeat';
   els.bossSprite.style.backgroundSize = 'contain';
   els.bossSprite.style.backgroundPosition = 'center bottom';
   let i = 0;
   els.bossSprite.style.backgroundImage = `url("${frames[0]}")`;
   if(frames.length > 1){
     timers.boss = setInterval(() => {
       i = (i + 1) % frames.length;
       els.bossSprite.style.backgroundImage = `url("${frames[i]}")`;
     }, action === 'run' ? 120 : 150);
   }
 };
 test.onerror = () => {
   if(!checked) fallbackBossSheet(boss, phase);
 };
 test.src = frames[0];
}
function showBossBattle(boss, phase='intro'){
 if(!els.bossBattle || !boss) return;
 setActorShown(true, true, true);
 state.currentBossPhase = phase;
 const tier = boss.expect >= 75 ? 'hot' : boss.expect >= 55 ? 'mid' : 'low';
 els.bossBattle.className = `boss-battle on ${phase} ${tier}`;
 if(els.lcdWindow) els.lcdWindow.classList.add('boss-mode');
 if(els.bossRate) els.bossRate.textContent = `${boss.label} ${boss.expect}%`;
 const action = phase === 'attack' ? 'attack' : phase === 'hit' ? 'hit' : phase === 'down' ? 'down' : phase === 'intro' ? 'run' : 'idle';
 if(phase === 'intro'){ soundManager.playSe('moan'); soundManager.playSe('stage_change'); }
 if(phase === 'hit') soundManager.playSe('hit');
 if(phase === 'down') soundManager.playSe('zombie_die');
 playBossFrames(boss, action, phase);
}
function clearPrizeScene(){
 if(!els.prizeScene) return;
 els.prizeScene.className = 'prize-scene';
 state.currentDropSymbol = '-';
 if(els.prizeSymbol) els.prizeSymbol.removeAttribute('src');
}
function startPrizeScene(type='crate'){
 if(!els.prizeScene) return;
 els.prizeScene.className = `prize-scene ${type} ready`;
 if(els.prizeSymbol) els.prizeSymbol.removeAttribute('src');
}
function revealPrizeScene(result){
 if(!els.prizeScene || !result) return;
 const type = prizeTypeFor(state.presentation, result);
 const lineSymbol = result.grid && result.line?.rows?.length ? result.grid[1][result.line.rows[1]] : null;
 const key = result.bonus ? bonusInfo[result.bonus].center[0] : (lineSymbol || result.center?.[1] || result.center?.[0]);
 const symbol = symbolDefs[key] || symbolDefs.replay;
 state.currentDropSymbol = key || '-';
 if(els.prizeSymbol){
   els.prizeSymbol.src = symbol.src;
   els.prizeSymbol.alt = symbol.label;
 }
 if(!state.bonusActive && !state.challenge){
   if(type === 'crate'){
     setActorShown(true, false, false);
     soundManager.playSe(result.role === 'SUIKA' ? 'shoot' : 'hit');
     setHeroOnce(result.role === 'SUIKA' ? 'shoot' : 'melee', state.heroCostume, 'idle', 520);
     setTimeout(()=>soundManager.playSe('item'), 260);
   }else if(type === 'drop'){
     setActorShown(true, true, ['HERO'].includes(result.role));
     soundManager.playSe(result.role === 'SUIKA' ? 'shoot' : 'hit');
     setHeroOnce(result.role === 'SUIKA' ? 'shoot' : 'melee', state.heroCostume, 'idle', 520);
     setEnemies('hit');
     setTimeout(()=>{ setEnemies('down'); soundManager.playSe('zombie_die'); }, 340);
     setTimeout(()=>soundManager.playSe('item'), 560);
   }else if(type === 'horde'){
     setActorShown(false, false, false);
     soundManager.playSe('zombie_walk');
     setTimeout(()=>soundManager.playSe('item'), 520);
   }
 }
 els.prizeScene.className = `prize-scene ${type} break${result.bonus ? ' bonus' : ''}`;
 const revealDelay = type === 'freeze' ? 620 : type === 'horde' ? 560 : type === 'drop' ? 650 : 280;
 setTimeout(() => {
   if(els.prizeScene) els.prizeScene.className = `prize-scene ${type} reveal${result.bonus ? ' bonus' : ''}`;
 }, revealDelay);
}
function weightedChoice(items){
 const total = items.reduce((sum, item) => sum + item.weight, 0);
 let r = Math.random() * total;
 for(const item of items){
   r -= item.weight;
   if(r <= 0) return item.value;
 }
 return items.at(-1).value;
}
function choosePresentation(result){
 if(result?.forceLongFreeze) return 'freeze';
 if(result?.challenge) return weightedChoice([{value:'warning',weight:45},{value:'shadow',weight:25},{value:'ammo_event',weight:15},{value:'cherry_notice',weight:15}]);
 if(result?.bonus) return weightedChoice([{value:'survive',weight:22},{value:'warning',weight:28},{value:'shadow',weight:20},{value:'hero_run',weight:15},{value:'silent',weight:15}]);
 const role = result?.role;
 if(role === 'REPLAY') return weightedChoice([{value:'hero_run',weight:32},{value:'enemy_walk',weight:30},{value:'silent',weight:18},{value:'ammo_event',weight:8},{value:'item_get',weight:12}]);
 if(role === 'BELL') return weightedChoice([{value:'item_get',weight:38},{value:'hero_run',weight:22},{value:'enemy_walk',weight:18},{value:'silent',weight:12},{value:'cherry_notice',weight:10}]);
 if(role === 'CHERRY') return weightedChoice([{value:'cherry_notice',weight:45},{value:'warning',weight:22},{value:'shadow',weight:18},{value:'item_get',weight:8},{value:'silent',weight:7}]);
 if(role === 'SUIKA') return weightedChoice([{value:'ammo_event',weight:42},{value:'warning',weight:26},{value:'shadow',weight:18},{value:'enemy_walk',weight:8},{value:'silent',weight:6}]);
 if(role === 'HERO') return weightedChoice([{value:'shadow',weight:30},{value:'warning',weight:24},{value:'survive',weight:12},{value:'hero_run',weight:24},{value:'silent',weight:10}]);
 if(state.quietGames >= 10) return weightedChoice([{value:'shadow',weight:34},{value:'enemy_walk',weight:28},{value:'warning',weight:12},{value:'hero_run',weight:16},{value:'silent',weight:10}]);
 return weightedChoice([{value:'idle',weight:34},{value:'silent',weight:24},{value:'enemy_walk',weight:24},{value:'hero_run',weight:10},{value:'shadow',weight:5},{value:'warning',weight:3}]);
}

function shouldFakeChallenge(role){
 const chances = {REPLAY:.025, BELL:.01, CHERRY:.16, SUIKA:.26, HERO:.42};
 return Math.random() < (chances[role] || 0);
}

function weightedPick(items){
 const total = items.reduce((sum, item) => sum + (item.weight || 1), 0);
 let r = Math.random() * total;
 for(const item of items){
   r -= item.weight || 1;
   if(r <= 0) return item;
 }
 return items.at(-1);
}

function modIndex(index, length){ return (index % length + length) % length; }
function getRowsForCenter(reelIndex, centerIndex){
 const arr = reelMap[reelIndex];
 return [
   arr[modIndex(centerIndex - 1, arr.length)],
   arr[modIndex(centerIndex, arr.length)],
   arr[modIndex(centerIndex + 1, arr.length)]
 ];
}
function getVisibleGrid(indices){
 return indices.map((centerIndex, reelIndex) => getRowsForCenter(reelIndex, centerIndex));
}
function centerIndexForSymbolAtRow(reelIndex, symbol, row, controlled=true){
 const arr = reelMap[reelIndex];
 const base = state.reelBases[reelIndex] ?? 0;
 const candidates = arr
   .map((key, symbolIndex) => {
     if(key !== symbol) return null;
     const centerIndex = modIndex(symbolIndex + 1 - row, arr.length);
     return {centerIndex, slip:(centerIndex - base + arr.length) % arr.length};
   })
   .filter(Boolean);
 const reachable = candidates.filter(c => c.slip <= 4);
 if(reachable.length) return reachable.sort((a,b)=>a.slip-b.slip)[0].centerIndex;
 if(controlled) return candidates.sort((a,b)=>a.slip-b.slip)[0]?.centerIndex ?? base;
 return candidates[rand(candidates.length)]?.centerIndex ?? base;
}
function buildLineStop(symbols, line=weightedPick(payLines), controlled=true){
 const targetIndices = symbols.map((symbol, reelIndex) => centerIndexForSymbolAtRow(reelIndex, symbol, line.rows[reelIndex], controlled));
 return {line, targetIndices, center:targetIndices.map((idx, reelIndex) => reelMap[reelIndex][idx]), grid:getVisibleGrid(targetIndices)};
}
function buildChanceStop(){
 const pattern = chancePatterns[rand(chancePatterns.length)];
 const targetIndices = pattern.symbols.map((symbol, reelIndex) => centerIndexForSymbolAtRow(reelIndex, symbol, pattern.rows[reelIndex], true));
 return {line:{key:'chance', label:pattern.label, rows:pattern.rows}, targetIndices, center:targetIndices.map((idx, reelIndex) => reelMap[reelIndex][idx]), grid:getVisibleGrid(targetIndices)};
}
function getRoleSymbols(role){
 const symbols = {
   REPLAY:['replay','replay','replay'],
   BELL:['bell','bell','bell'],
   CHERRY:['cherry','cherry','cherry'],
   SUIKA:['suika','suika','suika'],
   HERO:['hero','hero','hero']
 };
 return symbols[role] || null;
}
function buildOutcomeStop(roleResult){
 const symbols = getRoleSymbols(roleResult.role);
 if(symbols) return buildLineStop(symbols, weightedPick(payLines), true);
 return buildMissStop();
}
function leftVisibleHasRare(targetIndices){
 if(!Number.isFinite(targetIndices?.[0])) return false;
 return getRowsForCenter(0, targetIndices[0]).some(symbol => ['cherry','suika'].includes(symbol));
}
function buildMissStop(options={}){
 const keys = Object.keys(symbolDefs);
 const avoidLeftRare = options.avoidLeftRare !== false;
 let targetIndices;
 let guard = 0;
 do{
   targetIndices = reelMap.map(arr => rand(arr.length));
   guard++;
 }while((hasWinningLine(getVisibleGrid(targetIndices)) || (avoidLeftRare && leftVisibleHasRare(targetIndices))) && guard < 200);
 return {line:{key:'miss', label:'ハズレ', rows:[]}, targetIndices, center:targetIndices.map((idx, reelIndex)=>reelMap[reelIndex][idx]), grid:getVisibleGrid(targetIndices)};
}
function hasWinningLine(grid){
 return payLines.some(line => {
   const symbols = line.rows.map((row, reelIndex) => grid[reelIndex][row]);
   return symbols[0] && symbols[0] === symbols[1] && symbols[1] === symbols[2];
 });
}
function lineText(result){ return result?.line?.label ? ` ${result.line.label}` : ''; }
function shouldRevealPrize(result){
 if(!result || result.bonusGame) return false;
 if(result.bonus || result.bonusReady) return true;
 return ['REPLAY','BELL','SUIKA','CHERRY','HERO'].includes(result.role);
}

function actorClasses(effect){
 [els.hero,els.enemyA,els.enemyB].forEach(el=>el.classList.remove('anim-idle','anim-run','anim-attack','anim-shoot','anim-special','anim-reveal','anim-walk','anim-hit','anim-down'));
 els.enemyA.classList.add('face-left'); els.enemyB.classList.add('face-left');
 if(effect==='shoot'){els.hero.classList.add('anim-shoot');els.enemyA.classList.add('anim-hit');els.enemyB.classList.add('anim-walk')}
 else if(effect==='punch'){els.hero.classList.add('anim-attack');els.enemyA.classList.add('anim-attack');els.enemyB.classList.add('anim-walk')}
 else if(effect==='special'||effect==='bonus'){els.hero.classList.add('anim-special');els.enemyA.classList.add('anim-down');els.enemyB.classList.add('anim-down');flash()}
 else if(effect==='reveal'){els.hero.classList.add('anim-reveal');els.enemyA.classList.add('anim-walk');els.enemyB.classList.add('anim-walk')}
 else if(effect==='hero_run'||effect==='avoid'||effect==='item'||effect==='door'){els.hero.classList.add('anim-run');els.enemyA.classList.add('anim-walk');els.enemyB.classList.add('anim-walk')}
 else if(effect==='enemy_walk'){els.hero.classList.add('anim-idle');els.enemyA.classList.add('anim-walk');els.enemyB.classList.add('anim-walk')}
 else if(effect==='shadow'||effect==='warning'||effect==='survive'){els.hero.classList.add('anim-reveal');els.enemyA.classList.add('anim-walk');els.enemyB.classList.add('anim-walk')}
 else if(effect==='cherry_notice'){els.hero.classList.add('anim-reveal');els.enemyA.classList.add('anim-hit');els.enemyB.classList.add('anim-walk')}
 else if(effect==='ammo_event'){els.hero.classList.add('anim-shoot');els.enemyA.classList.add('anim-walk');els.enemyB.classList.add('anim-walk')}
 else if(effect==='supply_check'||effect==='medkit_notice'||effect==='ammo_support'||effect==='comeback_hint'){els.hero.classList.add('anim-reveal');els.enemyA.classList.add('anim-walk');els.enemyB.classList.add('anim-walk')}
 else if(effect==='silent_kimono'||effect==='kimono_shadow'||effect==='kimono_cut_in'||effect==='kimono_turn'||effect==='kimono_survive'){els.hero.classList.add('anim-reveal');els.enemyA.classList.add('anim-walk');els.enemyB.classList.add('anim-walk')}
 else{els.hero.classList.add('anim-idle');els.enemyA.classList.add('anim-walk');els.enemyB.classList.add('anim-walk')}
}
function playNormalEffect(effect,badge){
 if(state.heroCostume === 'nurse' && effect === 'item') effect = 'supply_check';
 if(state.heroCostume === 'nurse' && effect === 'item_get') effect = 'supply_check';
 if(state.heroCostume === 'nurse' && effect === 'ammo_event') effect = 'ammo_support';
 if(state.heroCostume === 'kimono' && effect === 'shadow') effect = 'kimono_shadow';
 if(state.heroCostume === 'kimono' && effect === 'warning') effect = 'kimono_shadow';
 if(state.heroCostume === 'kimono' && effect === 'survive') effect = 'kimono_survive';
 const scene = normalSceneFor(effect);
 setNormalScene(scene);
 const showBadge = ['warning','survive'].includes(effect) ? badge : '';
 els.lcdStatus.textContent = showBadge;
 els.lcdStatus.classList.toggle('empty', !showBadge);
 els.lcdStatus.classList.toggle('hot', ['warning','survive'].includes(effect));
 els.lcdStatus.classList.toggle('bonus', false);
 els.lcdStatus.classList.toggle('door', false);
 setLcdMood(effect, ['warning','survive','shadow','silentContradiction','kimono_shadow','kimono_survive'].includes(effect) ? 1400 : 850);
 actorClasses(effect);
 if(scene === 'idle'){
   clearPrizeScene();
   setActorShown(true, false, false);
   setHero('idle');
   setEnemies('idle');
 }else if(scene === 'hint'){
   clearPrizeScene();
   setActorShown(true, false, false);
   if(['warning','survive','kimono_shadow','kimono_survive','silentContradiction'].includes(effect)) soundManager.playSe('stage_change');
   setHero(effect.includes('kimono') ? (effect === 'kimono_survive' ? 'special' : 'idle') : 'idle', state.heroCostume);
   setEnemies('idle');
 }else if(scene === 'run'){
   clearPrizeScene();
   setActorShown(true, false, false);
   soundManager.playSe('run');
   setHero('run', state.heroCostume);
   setEnemies('idle');
   clearTimer('normalRun');
   timers.normalRun = setTimeout(() => {
     if(state.currentSceneCategory === 'run' && !state.spinning && !state.settling) playEffect('idle','');
     else if(state.currentSceneCategory === 'run') setHero('idle', state.heroCostume);
   }, 820);
 }else if(scene === 'zombie'){
   startPrizeScene('horde');
   setActorShown(false, true, ['SUIKA','CHERRY','HERO'].includes(state.result?.role) || isBonusExpectation(state.result));
   setHero('idle');
   soundManager.playSe('zombie_walk');
   setEnemies('walk');
 }else if(scene === 'crate'){
   startPrizeScene('crate');
   setActorShown(true, false, false);
   setHero('idle', state.heroCostume);
   setEnemies('idle');
 }else if(scene === 'combat'){
   clearPrizeScene();
   setActorShown(true, true, ['warning','survive'].includes(effect));
   soundManager.playSe('moan');
   setHero('idle', state.heroCostume);
   setEnemies('walk');
 }
}
function playEffect(effect,badge){
 if(!state.bonusActive && !state.challenge && !['special','bonus','door'].includes(effect)){
   playNormalEffect(effect, badge);
   return;
 }
 clearNormalScene();
 setActorShown(true, true, true);
 if(!state.bonusActive && state.heroCostume === 'nurse' && effect === 'item') effect = 'supply_check';
 if(!state.bonusActive && state.heroCostume === 'nurse' && effect === 'item_get') effect = 'supply_check';
 if(!state.bonusActive && state.heroCostume === 'nurse' && effect === 'ammo_event') effect = 'ammo_support';
 if(!state.bonusActive && state.heroCostume === 'kimono' && effect === 'shadow') effect = 'kimono_shadow';
 if(!state.bonusActive && state.heroCostume === 'kimono' && effect === 'warning') effect = 'kimono_shadow';
 if(!state.bonusActive && state.heroCostume === 'kimono' && effect === 'survive') effect = 'kimono_survive';
 const showBadge = ['warning','survive'].includes(effect) ? badge : '';
 els.lcdStatus.textContent=showBadge;
 els.lcdStatus.classList.toggle('empty', !showBadge);
 els.lcdStatus.classList.toggle('hot',['special','shoot','bonus'].includes(effect));
 els.lcdStatus.classList.toggle('bonus',['special','bonus'].includes(effect));
 els.lcdStatus.classList.toggle('door',effect==='door' || state.door>0);
 setLcdMood(effect, ['warning','survive','shadow','silentContradiction'].includes(effect) ? 1400 : 850);
 actorClasses(effect);
 if(effect==='shoot'){setHero('shoot');setEnemies('hit')}
 else if(effect==='punch'){setHero('melee');setEnemies('attack')}
 else if(effect==='special'||effect==='bonus'){setHero('special');setEnemies('down')}
 else if(effect==='reveal'){setHero('melee');setEnemies('walk')}
 else if(effect==='hero_run'||effect==='avoid'||effect==='item'||effect==='door'){setHero('run');setEnemies('walk')}
 else if(effect==='ammo_event'){setHero('shoot');setEnemies('walk')}
 else if(effect==='cherry_notice'){setHero('melee');setEnemies('hit')}
 else if(effect==='supply_check'){setHero('idle','nurse');setEnemies('walk')}
 else if(effect==='medkit_notice'||effect==='comeback_hint'){setHero('shoot','nurse');setEnemies('walk')}
 else if(effect==='ammo_support'){setHero('shoot','nurse');setEnemies('walk')}
 else if(effect==='silent_kimono'||effect==='kimono_shadow'){setHero('idle','kimono');setEnemies('walk')}
 else if(effect==='kimono_cut_in'||effect==='kimono_turn'){setHero('melee','kimono');setEnemies('idle')}
 else if(effect==='kimono_survive'){setHero('special','kimono');setEnemies('hit')}
 else if(effect==='enemy_walk'||effect==='shadow'||effect==='warning'||effect==='survive'){setHero(effect==='survive'?'special':'idle');setEnemies('walk')}
 else{setHero('idle');setEnemies('walk')}
}
function flash(){ els.flash.classList.remove('on'); void els.flash.offsetWidth; els.flash.classList.add('on'); }

function isRareRole(role){ return ['CHERRY','SUIKA','HERO'].includes(role); }
function isBonusExpectation(result){ return !!(result?.bonus || result?.bonusReady || result?.hiddenBonus || result?.challenge); }
function playStopPerformance(stopCount){
 const result = state.result;
 const perf = state.presentation;
 if(!result || state.bonusActive || state.pendingBonus) return;
 const costume = state.heroCostume;
 if(stopCount === 1){
   if(costume === 'nurse' && (perf === 'item_get' || perf === 'ammo_event' || ['REPLAY','BELL','SUIKA'].includes(result.role))){
     setLcdMood(perf === 'ammo_event' ? 'ammo_support' : 'supply_check', 640);
     setHero('idle','nurse');
     return;
   }
   if(costume === 'kimono' && (perf === 'shadow' || perf === 'warning' || perf === 'survive')){
     setLcdMood('kimono_shadow', 760);
     setHero('idle','kimono');
     setEnemies('walk');
     return;
   }
   if(perf === 'silent' && (isRareRole(result.role) || isBonusExpectation(result))){
     setLcdMood('silent', 520);
     setHero('idle');
     setEnemies('walk');
   }else if(perf === 'enemy_walk'){
     startPrizeScene('horde');
     setActorShown(false, false, false);
     setEnemies('walk');
   }else if(perf === 'shadow' || perf === 'warning' || perf === 'survive'){
     setLcdMood('shadow', 760);
     setHero('idle');
     setEnemies('walk');
   }else if(perf === 'cherry_notice'){
     setLcdMood('cherry_notice', 520);
   }else if(perf === 'ammo_event'){
     setLcdMood('ammo_event', 520);
   }
   return;
 }
 if(stopCount === 2){
   if(costume === 'nurse' && ['REPLAY','BELL'].includes(result.role)){
     setLcdMood('medkit_notice', 720);
     setHero('shoot','nurse');
     return;
   }
   if(costume === 'kimono' && (hasContradiction(perf, result.role, isBonusExpectation(result)) || isBonusExpectation(result))){
     setLcdMood('kimono_turn', 820);
     setHero('melee','kimono');
     setEnemies('idle');
     return;
   }
   if(hasContradiction(perf, result.role, isBonusExpectation(result))){
     setLcdMood('silentContradiction', 760);
     setHero('idle');
     setEnemies('idle');
   }else if(isBonusExpectation(result)){
     setLcdMood(perf === 'survive' ? 'survive' : 'warning', 900);
   }else if(isRareRole(result.role)){
     setLcdMood(result.role === 'SUIKA' ? 'ammo_event' : 'cherry_notice', 720);
   }else if(perf === 'hero_run'){
     setHero('run');
     setEnemies('walk');
   }
 }
}

function maxBet(){
 if(state.spinning||state.settling||state.bet===3||state.credit<1||state.challenge||state.bonusActive||state.longFreeze)return;
 const need=3-state.bet;
 if(state.credit<need)return;
 soundManager.playSe('bet');
 state.credit-=need; state.bet=3; state.diff-=need; state.pay=0; update();
}
function pushAction(){
 if(state.longFreeze || state.settling)return;
 if(state.awaitingPushNotice){
   soundManager.playSe('push');
   soundManager.duck(420, .05);
   revealBonusNotice(state.awaitingPushNotice, 'push');
   state.awaitingPushNotice = null;
   return;
 }
 if(state.challenge && !state.spinning){
   if(state.challenge.awaitingPush){
     soundManager.playSe('push');
     state.challenge.pushed = true;
     state.challenge.awaitingPush = false;
     clearTimer('challenge');
     setLcdMood('silentContradiction', 520);
     timers.challenge = setTimeout(()=>advanceChallenge('push'), 520);
   }else{
     flash();
   }
   return;
 }
 if(state.pendingBonus && !state.spinning){
   if(state.bonusReady) startBonus();
   else flash();
   return;
 }
 flash();
 if(state.door>0) setLcdMood('survive', 650);
}
function leverOn(){
 if(state.spinning||state.settling||state.challenge||state.longFreeze)return;
 if(state.nextGameNotice){
   soundManager.playSe('lever');
   const bonus = state.nextGameNotice;
   state.nextGameNotice = null;
   revealBonusNotice(bonus, 'next');
   return;
 }
 if(!state.bonusActive && state.bet<3)return;
 soundManager.ensureContextualBgm();
 soundManager.playSe('lever');
 clearPrizeScene();
 clearBossBattle();
 if(!state.pendingBonus) clearBonusConfirm();
 const doorActive = state.door > 0;
 els.lcdStatus.textContent='';
 state.games++;
 state.reelBases = reelMap.map(arr => rand(arr.length));
 state.stopIndices = [null,null,null];
 state.spinStartedAt = performance.now();
 state.performancePhase = 0;
 state.spinning=true; state.stopped=[false,false,false]; state.result=state.bonusActive ? drawBonusGameOutcome() : (state.pendingBonus ? drawPendingBonusOutcome() : drawOutcome()); state.center=state.result.center; state.presentation=choosePresentation(state.result);
 if(!state.bonusActive){
   const expectedBonus = isBonusExpectation(state.result);
   const wouldContradict = hasContradiction(state.presentation, state.result?.role, expectedBonus);
   setHeroCostume(chooseHeroCostume(state.presentation, state.result?.role, {
     contradiction:wouldContradict,
     bonusExpectation:expectedBonus,
     challengePrelude:!!state.result?.challenge,
     quietBreak:state.quietGames >= 10,
     roleHit:['REPLAY','BELL','CHERRY','SUIKA','HERO'].includes(state.result?.role)
   }));
 }else if(state.bonusActive.type?.startsWith('SBB')){
   setHeroCostume('rush');
 }else{
   setHeroCostume('school');
 }
 if(state.door>0) state.door--;
 if(!state.bonusActive && !doorActive && state.games%7===0)setStage(chooseRoamingStage(), true);
 if(!state.bonusActive && state.quietGames >= 10){
   setStage(chooseRoamingStage(), true);
   randomizeActors();
   setLcdMood('shadow', 1200);
 }
 if(state.games%4===0)randomizeActors();
 if(!state.bonusActive && !state.pendingBonus && state.presentation === 'freeze' && state.result?.bonus){
   soundManager.stopReelLoop();
   state.spinning = false;
   state.stopped = [true,true,true];
   state.bet = 0;
   state.pay = 0;
   state.pendingBonus = state.result.bonus;
   state.bonusReady = false;
   pushHistory(`${bonusInfo[state.result.bonus].label} LONG FREEZE`, 0);
   startLongFreeze(state.result.bonus);
   update();
   return;
 }
 playEffect(state.presentation === 'freeze' ? 'special' : state.presentation, state.presentation === 'warning' ? 'WARNING' : (state.presentation === 'survive' ? 'SURVIVE' : ''));
 if(state.bonusActive) setBonusLcd(state.bonusActive.type);
 els.reels.forEach((_,i)=>spinVisual(i)); update();
}

function drawBaseRole(){
 const table = bonusTable[state.setting];
 const roles = baseRoles.map(r => ({...r}));
 roles.find(r=>r.role==='BELL').chance = table.bell;
 let r = Math.random();
 for(const item of roles){
   if(item.role === 'MISS') return item;
   if(r < item.chance) return item;
   r -= item.chance;
 }
 return roles.at(-1);
}
function drawOutcome(){
 if(state.forceLongFreeze){
   state.forceLongFreeze = false;
   const bonusType = chooseBonusType();
   const stop = buildLineStop(bonusInfo[bonusType].center, weightedPick(payLines), true);
   return {role:'FREEZE', chance:1, bonus:bonusType, hiddenBonus:null, challenge:false, forceLongFreeze:true, ...stop, badge:bonusInfo[bonusType].badge, effect:'special'};
 }
 const base = drawBaseRole();
 const table = bonusTable[state.setting];
 const doorBoost = state.door > 0 ? 1/115 : 0;
 const stageBoost = getStageBonusBoost();
 const overlap = base.overlap || 0;
 const soloHit = Math.random() < (table.solo + doorBoost + stageBoost);
 const overlapHit = !soloHit && base.role !== 'MISS' && overlap > 0 && Math.random() < overlap;
 const bonusHit = soloHit || overlapHit;
 if(!bonusHit){
   const fakeChallenge = base.role !== 'MISS' && shouldFakeChallenge(base.role);
   const stop = fakeChallenge ? buildChanceStop() : buildOutcomeStop(base);
   return {...base, bonus:null, hiddenBonus:null, challenge:fakeChallenge, ...stop};
 }
 const bonusType = chooseBonusType();
 const b = bonusInfo[bonusType];
 if(base.role === 'MISS' || soloHit){
   const stop = buildLineStop(b.center, weightedPick(payLines), true);
   return {...base, bonus:bonusType, hiddenBonus:null, challenge:false, ...stop, badge:b.badge, effect:'special'};
 }
 const stop = Math.random() < .62 ? buildChanceStop() : buildOutcomeStop(base);
 return {...base, bonus:null, hiddenBonus:bonusType, challenge:true, ...stop, badge:'CHANCE', effect:base.effect};
}
function drawPendingBonusOutcome(){
 const bonus = state.pendingBonus;
 const info = bonusInfo[bonus];
 const base = drawBaseRole();
 const readyChance = 1;
 if(Math.random() < readyChance){
   const stop = buildLineStop(info.center, weightedPick(payLines), true);
   return {role:'BONUS_READY', chance:1, ...stop, pay:0, badge:info.badge, effect:'special', bonusReady:bonus};
 }
 if(base.role === 'MISS'){
   return {...base, ...buildMissStop(), bonus:null, hiddenBonus:null, challenge:false};
 }
 return {...base, ...buildOutcomeStop(base), bonus:null, hiddenBonus:null, challenge:false};
}
function drawBonusGameOutcome(){
 const active = state.bonusActive;
 const pay = Math.min(active?.chunk || 15, active?.remaining || 0);
 const stop = buildLineStop(['bell','bell','bell'], weightedPick(payLines), true);
 return {role:'BONUS_GAME', chance:1, ...stop, pay, badge:'BONUS', effect:'item', bonusGame:true};
}
function chooseBonusType(){
 const t = bonusTable[state.setting];
 const r = Math.random();
 if(r < t.sbb){
   return Math.random() < t.blueBias ? 'SBB_BLUE' : 'SBB_RED';
 }
 if(r < t.sbb + t.regBias){
   return 'REG';
 }
 return Math.random() < t.blueBias ? 'BB_BLUE' : 'BB_RED';
}
function isKnownCenter(keys){
 const centers = [
   ...baseRoles.map(r => r.center).filter(Boolean),
   ...Object.values(bonusInfo).map(b => b.center)
 ];
 return centers.some(c => c.every((k,i) => k === keys[i]));
}
function drawMissCenter(){ const keys=Object.keys(symbolDefs); let a; do{a=[keys[rand(keys.length)],keys[rand(keys.length)],keys[rand(keys.length)]]}while((a[0]===a[1]&&a[1]===a[2]) || isKnownCenter(a)); return a; }
function spinVisual(i){ const strip=els.reels[i].querySelector('.strip'); strip.style.transition='none'; strip.style.transform='translateY(0)'; strip.offsetHeight; strip.classList.add('spinning'); }
function currentReelIndex(i){
 const arr = reelMap[i];
 const elapsed = Math.max(0, performance.now() - (state.spinStartedAt || performance.now()) - i * 70);
 return modIndex((state.reelBases[i] ?? 0) + Math.floor(elapsed / REEL_STEP_MS), arr.length);
}
function intentSymbolAtReel(i){
 const result = state.result;
 const row = result?.line?.rows?.[i];
 const index = result?.targetIndices?.[i];
 if(!Number.isFinite(row) || !Number.isFinite(index)) return null;
 return getRowsForCenter(i, index)[row];
}
function wouldCreateMissWin(reelIndex, candidateIndex){
 if(state.result?.line?.key !== 'miss' || reelIndex < 2) return false;
 const indices = state.stopIndices.map((idx, i) => i === reelIndex ? candidateIndex : idx);
 if(indices.some(idx => !Number.isFinite(idx))) return false;
 return hasWinningLine(getVisibleGrid(indices));
}
function shouldSuppressLeftRare(result){
 return result?.line?.key === 'miss' && result?.role === 'MISS' && !isBonusExpectation(result) && !state.pendingBonus;
}
function leftCandidateHasRare(centerIndex){
 return getRowsForCenter(0, centerIndex).some(symbol => ['cherry','suika'].includes(symbol));
}
function chooseTimedStopIndex(i){
 const arr = reelMap[i];
 const base = currentReelIndex(i);
 const desired = intentSymbolAtReel(i);
 const row = state.result?.line?.rows?.[i] ?? 1;
 if(desired){
   const assistRoles = ['BONUS_READY','REPLAY','BELL','BONUS_GAME'];
   const maxSlip = assistRoles.includes(state.result?.role) ? arr.length - 1 : MAX_SLIP;
   const candidates = [];
   for(let slip=0; slip<=maxSlip; slip++){
     const centerIndex = modIndex(base + slip, arr.length);
     if(getRowsForCenter(i, centerIndex)[row] === desired) candidates.push({centerIndex, slip});
   }
   if(candidates.length) return candidates[0].centerIndex;
 }
 for(let slip=0; slip<=MAX_SLIP; slip++){
   const centerIndex = modIndex(base + slip, arr.length);
   const centerSymbol = getRowsForCenter(i, centerIndex)[1];
   if(i === 0 && shouldSuppressLeftRare(state.result) && (['cherry','suika'].includes(centerSymbol) || leftCandidateHasRare(centerIndex))) continue;
   if(!wouldCreateMissWin(i, centerIndex)) return centerIndex;
 }
 if(i === 0 && shouldSuppressLeftRare(state.result)){
   for(let slip=MAX_SLIP + 1; slip<arr.length; slip++){
     const centerIndex = modIndex(base + slip, arr.length);
     if(!leftCandidateHasRare(centerIndex) && !wouldCreateMissWin(i, centerIndex)) return centerIndex;
   }
 }
 return base;
}
function stopReel(i){
 if(!state.spinning||state.stopped[i]||state.longFreeze||state.settling)return;
 soundManager.playSe(`stop${i + 1}`);
 state.stopped[i]=true;
 const stopCount = state.stopped.filter(Boolean).length;
 const index = chooseTimedStopIndex(i);
 state.stopIndices[i] = index;
 alignReelToIndex(i,index, true);
 if(!state.stopped.every(Boolean)){
   state.performancePhase = stopCount;
   playStopPerformance(stopCount);
 }
 if(state.stopped.every(Boolean)){
   soundManager.stopReelLoop();
   state.settling = true;
   const delay = settleDelay(state.result);
   const thirdContradiction = hasContradiction(state.presentation, state.result?.role, isBonusExpectation(state.result));
   if(thirdContradiction && state.heroCostume === 'kimono') setLcdMood('kimono_cut_in', delay + 360);
   else if(thirdContradiction) setLcdMood('silentContradiction', delay + 260);
   else if(state.heroCostume === 'nurse' && ['REPLAY','BELL','SUIKA'].includes(state.result?.role)) setLcdMood('medkit_notice', delay + 180);
   else if(delay >= 550) setLcdMood('shadow', delay + 120);
   setTimeout(settle, delay);
   update();
 }
}
function chooseStopIndex(i,key,controlled=false){
 const arr = reelMap[i];
 const base = state.reelBases[i] ?? 0;
 const matches = arr.map((k,idx)=>k===key?idx:-1).filter(idx=>idx>=0);
 if(!matches.length) return base;
 const reachable = matches.map(idx=>({idx, slip:(idx - base + arr.length) % arr.length})).filter(x=>x.slip<=4);
 if(reachable.length) return reachable.sort((a,b)=>a.slip-b.slip)[0].idx;
 if(controlled && (state.result?.bonusReady || state.result?.bonus || state.result?.challenge)) return matches.sort((a,b)=>((a-base+arr.length)%arr.length)-((b-base+arr.length)%arr.length))[0];
 return matches[rand(matches.length)];
}
function alignReel(i,key,controlled=false){ const strip=els.reels[i].querySelector('.strip'); const arr=reelMap[i]; let index=chooseStopIndex(i,key,controlled); strip.classList.remove('spinning'); const h=getCellHeight(); const targetIndex=arr.length+index-1; strip.style.transition='transform .42s cubic-bezier(.16,1,.3,1)'; strip.style.transform=`translateY(${-h*targetIndex}px)`; }
function alignReelToIndex(i,index,slideDown=false){
 const strip=els.reels[i].querySelector('.strip');
 const arr=reelMap[i];
 const safeIndex=modIndex(Number.isFinite(index)?index:0, arr.length);
 strip.classList.remove('spinning');
 const h=getCellHeight();
 const targetIndex=arr.length+safeIndex-1;
 if(slideDown){
   const startIndex=Math.min(targetIndex+6, arr.length*3-3);
   strip.style.transition='none';
   strip.style.transform=`translateY(${-h*startIndex}px)`;
   strip.offsetHeight;
 }
 strip.style.transition='transform .42s cubic-bezier(.16,1,.3,1)';
 strip.style.transform=`translateY(${-h*targetIndex}px)`;
}
function setCenter(keys){keys.forEach((k,i)=>alignReel(i,k))}
function getCellHeight(){ return document.querySelector('.symbol')?.getBoundingClientRect().height || 66; }

function startBonusChallenge(result){
 soundManager.stopReelLoop();
 soundManager.fadeOutBgm(360, 'boss');
 soundManager.playSe('bonus_chance_start');
 setActorShown(true, true, true);
 clearNormalScene();
 const clear = !!result.hiddenBonus;
 const boss = chooseBoss(clear);
 const pushChance = Math.min(.82, .16 + boss.expect / 120 + (clear ? .16 : 0));
 const reviveChance = clear ? 0 : Math.min(.28, (boss.expect - 35) / 260 + (['CHERRY','SUIKA','HERO'].includes(result.role) ? .06 : 0) + (state.contradiction ? .08 : 0));
 const revive = Math.random() < Math.max(0, reviveChance);
 state.challenge = {
   bonus: result.hiddenBonus || (revive ? chooseBonusType() : null),
   role: result.role,
   step:0,
   clear,
   revive,
   awaitingPush:false,
   pushed:false,
   pushPrompt:Math.random() < pushChance,
   type: result.hiddenBonus ? (Math.random() < .18 ? 'freeze' : (Math.random() < .55 ? 'horde' : 'drop')) : (Math.random() < .55 ? 'crate' : 'horde'),
   boss
 };
 setHeroCostume(chooseHeroCostume('warning', result.role, {
   challengePrelude:true,
   contradiction:state.contradiction,
   bonusExpectation:clear || boss.expect >= 75
 }));
 clearPrizeScene();
 if(els.prizeScene) els.prizeScene.className = 'prize-scene challenge';
 setLcdMood('silentContradiction', 360);
 timers.challenge = setTimeout(()=>advanceChallenge('auto'), 360);
 pushHistory(`${result.role} CHANCE`, 0);
 update();
}

function challengeDelay(c, base){
 return Math.round(base + c.boss.expect * 4);
}
function finishChallengeSuccess(c, label='CHANCE CLEAR'){
 const bonus = c.bonus || chooseBonusType();
 soundManager.playSe('bonus_chance_win');
 soundManager.fadeOutBgm(420);
 showBossBattle(c.boss, 'down');
 state.challenge = null;
 state.pendingBonus = bonus;
 state.bonusReady = false;
 revealPrizeScene({bonus, center:bonusInfo[bonus].center});
 showBonusConfirm();
 soundManager.playSe('bonus_confirm');
 playEffect('special', bonusInfo[bonus].badge);
 pushHistory(`${label} ${bonusInfo[bonus].label}`, 0);
 update();
}
function finishChallengeFail(c){
 soundManager.playSe('bonus_chance_lose');
 soundManager.fadeOutBgm(420, 'normal');
 showBossBattle(c.boss, 'hit');
 state.challenge = null;
 clearPrizeScene();
 setLcdMood('silent', 480);
 setHero('down');
 setEnemies('walk');
 pushHistory('CHANCE FAIL', 0);
 timers.challenge = setTimeout(()=>{ clearBossBattle(); randomizeActors(); playEffect('idle',''); update(); }, c.boss.expect >= 60 ? 900 : 420);
 update();
}
function startChallengeRevive(c){
 soundManager.duck(380, 0);
 soundManager.playSe('revive');
 setHeroCostume(c.boss.expect >= 75 || state.contradiction ? 'kimono' : 'nurse');
 setLcdMood(state.heroCostume === 'kimono' ? 'kimono_cut_in' : 'comeback_hint', 880);
 setHero(state.heroCostume === 'kimono' ? 'special' : 'shoot', state.heroCostume);
 setEnemies('down');
 timers.challenge = setTimeout(()=>finishChallengeSuccess(c, 'REVIVAL'), 880);
}
function advanceChallenge(source='auto'){
 const c = state.challenge;
 if(!c) return;
 clearTimer('challenge');
 c.step++;
 if(c.step === 1){
   soundManager.playSe(c.boss.expect >= 75 ? 'survive' : 'warning');
   if(c.boss.expect >= 75 && state.heroCostume !== 'nurse') setHeroCostume('kimono');
   showBossBattle(c.boss, 'intro');
   setLcdMood('warning', challengeDelay(c, 520));
   setHero('idle');
   setEnemies('walk');
   timers.challenge = setTimeout(()=>advanceChallenge('auto'), challengeDelay(c, 520));
   return;
 }
 if(c.step === 2){
   showBossBattle(c.boss, 'attack');
   soundManager.playSe(c.role === 'SUIKA' ? 'shoot' : c.role === 'CHERRY' ? 'bat_attack' : 'attack');
   playEffect(c.role === 'SUIKA' ? 'ammo_event' : c.role === 'CHERRY' ? 'cherry_notice' : 'enemy_walk', '');
   if(c.boss.expect >= 60 || c.clear) flash();
   timers.challenge = setTimeout(()=>advanceChallenge('auto'), challengeDelay(c, 620));
   return;
 }
 if(c.step === 3){
   if(c.pushPrompt){
     c.awaitingPush = true;
     showBossBattle(c.boss, c.boss.expect >= 75 ? 'attack' : 'intro');
     soundManager.playSe('push_notice');
     soundManager.duck(480, .12);
     setLcdMood(c.boss.expect >= 75 ? 'survive' : 'push', 1600);
     timers.challenge = setTimeout(()=>{ if(state.challenge?.awaitingPush){ state.challenge.awaitingPush = false; advanceChallenge('auto'); } }, 1600);
   }else{
     if(c.boss.expect >= 75) setHeroCostume('kimono');
     setLcdMood(c.boss.expect >= 75 ? 'survive' : 'shadow', challengeDelay(c, 560));
     timers.challenge = setTimeout(()=>advanceChallenge('auto'), challengeDelay(c, 560));
   }
   update();
   return;
 }
 if(c.step === 4){
   const hold = source === 'push' ? 650 : (c.boss.expect >= 75 ? 780 : 420);
   if(c.clear){
     setLcdMood(c.pushed || c.boss.expect >= 75 ? 'survive' : 'warning', hold);
     timers.challenge = setTimeout(()=>finishChallengeSuccess(c), hold);
   }else if(c.revive){
     showBossBattle(c.boss, 'hit');
     setLcdMood('silent', c.boss.expect >= 60 ? 720 : 420);
     timers.challenge = setTimeout(()=>startChallengeRevive(c), c.boss.expect >= 60 ? 720 : 420);
   }else{
     timers.challenge = setTimeout(()=>finishChallengeFail(c), hold);
   }
   update();
   return;
 }
}

function applyActualStops(result){
 if(!result || state.stopIndices.some(idx => !Number.isFinite(idx))) return result;
 result.targetIndices = [...state.stopIndices];
 result.center = result.targetIndices.map((idx, reelIndex)=>reelMap[reelIndex][idx]);
 result.grid = getVisibleGrid(result.targetIndices);
 state.center = result.center;
 return result;
}
function lineMatchesSymbols(result, symbols){
 if(!result?.grid || !result?.line?.rows?.length || !symbols) return false;
 return result.line.rows.every((row, reelIndex) => result.grid[reelIndex]?.[row] === symbols[reelIndex]);
}
function settleDelay(result){
 if(result?.bonus || result?.bonusReady || result?.hiddenBonus || result?.challenge) return .6 * 1000;
 if(['CHERRY','SUIKA','HERO'].includes(result?.role)) return 350;
 if(['REPLAY','BELL'].includes(result?.role)) return 250;
 return 150;
}
function hasContradiction(performance, role, bonus){
 if(bonus) return ['hero_run','silent','enemy_walk'].includes(performance);
 if(performance === 'item_get' && ['CHERRY','SUIKA','HERO'].includes(role)) return true;
 if(performance === 'ammo_event' && role === 'REPLAY') return true;
 if(performance === 'cherry_notice' && role === 'BELL') return true;
 if(performance === 'silent' && ['REPLAY','BELL','CHERRY','SUIKA','HERO'].includes(role)) return true;
 if(performance === 'enemy_walk' && role === 'SUIKA') return true;
 return false;
}
function chooseBonusNotice(){
 return weightedChoice(bonusNoticeWeights.map(item => ({value:item.type, weight:item.weight})));
}
function revealBonusNotice(bonus, type='instant'){
 if(!bonus) return;
 soundManager.stopReelLoop();
 soundManager.fadeOutBgm(260);
 if(type === 'delayed' || type === 'next') setLcdMood('warning', 600);
 if(type === 'weird') setLcdMood('silentContradiction', 900);
 setTimeout(() => {
   showBonusConfirm();
   soundManager.playSe('bonus_confirm');
   playEffect('special', bonusInfo[bonus]?.badge || 'BONUS');
   pushHistory(`BONUS NOTICE ${type.toUpperCase()}`, 0);
   update();
 }, type === 'next' ? 620 : 0);
}
function scheduleBonusNotice(bonus, preferredType=null){
 const type = preferredType || chooseBonusNotice();
 if(type === 'instant'){
   revealBonusNotice(bonus, 'instant');
 }else if(type === 'delayed'){
   setLcdMood('silentContradiction', 650);
   setTimeout(()=>revealBonusNotice(bonus, 'delayed'), 620);
 }else if(type === 'push'){
   state.awaitingPushNotice = bonus;
   soundManager.playSe('push_notice');
   soundManager.duck(600, .08);
   setLcdMood('warning', 900);
   pushHistory('PUSH NOTICE READY', 0);
 }else if(type === 'next'){
   state.nextGameNotice = bonus;
   setLcdMood('shadow', 1000);
   pushHistory('NEXT GAME NOTICE', 0);
 }else{
   setLcdMood('silentContradiction', 1400);
   setTimeout(()=>revealBonusNotice(bonus, 'weird'), 900);
 }
}

function settle(){
 const r=applyActualStops(state.result); state.spinning=false; state.settling=false; state.pay=r.pay||0;
 if(r.bonusGame){
   soundManager.playSe('payout');
   state.bet=0;
   state.credit+=state.pay;
   state.diff+=state.pay;
   state.bonusActive.remaining = Math.max(0, state.bonusActive.remaining - state.pay);
   state.bonusActive.games++;
   clearPrizeScene();
   pushHistory(`${state.bonusActive.label} ${state.bonusActive.games}G`, state.pay);
   if(state.bonusActive.remaining <= 0) finishBonus();
   update();
   return;
 }
 if(r.role==='REPLAY')state.bet=3; else state.bet=0;
 const roleHit = lineMatchesSymbols(r, getRoleSymbols(r.role));
 const contradiction = hasContradiction(state.presentation, r.role, r.bonus || r.bonusReady || r.hiddenBonus);
 state.contradiction = contradiction;
 if(contradiction || isBonusExpectation(r)) soundManager.duck(520, .04);
 if(r.role==='REPLAY' && !roleHit) state.bet=0;
 if(r.role==='BELL' && roleHit)state.bell++;
 if(getRoleSymbols(r.role) && !roleHit) state.pay = 0;
 if(!r.bonus && !r.bonusReady && !r.challenge){
   if(['CHERRY','SUIKA','HERO'].includes(r.role) && roleHit) soundManager.playSe('rare');
   else if(state.pay > 0) soundManager.playSe('payout');
 }
 if(state.presentation === 'warning') soundManager.playSe('warning');
 if(state.presentation === 'survive') soundManager.playSe('survive');
 if(contradiction) setLcdMood('silentContradiction', 1200);
 const prizeShown = shouldRevealPrize(r) && (!getRoleSymbols(r.role) || roleHit) && !contradiction;
 if(prizeShown){
   revealPrizeScene(r);
 }else{
   clearPrizeScene();
 }
 if(!r.bonus && !r.bonusReady){
   if(contradiction){
     actorClasses('shadow');
     setHero('idle');
     setEnemies('idle');
   }else if(!prizeShown){
     playEffect('idle', '');
   }
 }
 if(r.bonusReady){
   const readyHit = lineMatchesSymbols(r, bonusInfo[r.bonusReady].center);
   state.bonusReady = readyHit;
   if(readyHit) showBonusConfirm();
   else showBonusConfirm();
   if(readyHit) soundManager.playSe('bonus_confirm');
   pushHistory(`${bonusInfo[r.bonusReady].label}${lineText(r)} ${readyHit ? 'READY' : 'MISS'}`, 0);
 }else if(r.bonus){
   state.credit+=state.pay; state.diff+=state.pay;
   state.pendingBonus = r.bonus;
   state.bonusReady = lineMatchesSymbols(r, bonusInfo[r.bonus].center);
   pushHistory(`${r.role}${lineText(r)}+${bonusInfo[r.bonus].label}${state.presentation === 'freeze' ? ' LONG FREEZE' : ''}`, state.pay);
   if(state.presentation === 'freeze'){
     startLongFreeze(r.bonus);
   }else{
     scheduleBonusNotice(r.bonus, contradiction ? 'weird' : null);
   }
 }else if(r.challenge){
   state.credit+=state.pay; state.diff+=state.pay;
   pushHistory(`${r.role}${lineText(r)}`, state.pay);
   setTimeout(()=>{ if(!state.spinning && !state.pendingBonus) startBonusChallenge(r); }, 760);
 }else{
   state.credit+=state.pay; state.diff+=state.pay;
   if(state.pendingBonus) showBonusConfirm();
   pushHistory(`${r.role}${lineText(r)}`, state.pay);
 }
 if(r.bonus || r.bonusReady || r.challenge || ['CHERRY','SUIKA','HERO'].includes(r.role) || ['warning','survive','shadow','cherry_notice','ammo_event'].includes(state.presentation)){
   state.quietGames = 0;
 }else{
   state.quietGames++;
 }
 update();
}
function startBonus(){
 if(!state.pendingBonus||!state.bonusReady||state.spinning||state.bonusActive)return;
 soundManager.playSe('bonus_start');
 soundManager.switchBgm('rush', true);
 clearBossBattle();
 clearPrizeScene();
 clearBonusConfirm();
 const type = state.pendingBonus;
 const info = bonusInfo[type];
 state.pay = 0;
 if(info.counter === 'sbb') state.sbb++;
 if(info.counter === 'big') state.big++;
 if(info.counter === 'reg') state.reg++;
 state.bonusActive = {type, label:info.label, remaining:info.pay, total:info.pay, games:0, chunk:type === 'REG' ? 13 : 15};
 state.pendingBonus = null;
 state.bonusReady = false;
 randomizeActors();
 playEffect('bonus', 'BONUS START');
 setBonusLcd(type);
 pushHistory(`${info.label} START`, 0);
 update();
}
function finishBonus(){
 const type = state.bonusActive?.type;
 state.bonusActive = null;
 setHeroCostume('school');
 clearBonusLcd();
 if(type !== 'REG'){
   state.door = type.startsWith('SBB') ? 64 : 32;
   state.doorHits++;
   setStageByKey('office');
   soundManager.switchBgm('rush', true);
 }else{
   setStageByKey('station');
   soundManager.fadeOutBgm(500, 'normal');
 }
 randomizeActors();
 playEffect(type === 'REG' ? 'bonus' : 'door', type !== 'REG' ? `SURVIVE ${state.door}` : 'REG END');
 pushHistory(type !== 'REG' ? `SURVIVE ${state.door}` : 'REG END', 0);
}
function pushHistory(role,pay){ state.history.unshift(`${state.games}G ${role}${pay?` +${pay}`:''}`); state.history=state.history.slice(0,10); }
function update(){
 els.credit.textContent=state.credit; els.bet.textContent=state.bet; els.pay.textContent=state.pay; els.diff.textContent=state.diff; els.games.textContent=state.games; els.big.textContent=state.big; els.reg.textContent=state.reg;
 if(els.sbb) els.sbb.textContent=state.sbb; if(els.door) els.door.textContent=state.door>0?state.door:'-';
 const bt=state.big+state.reg+state.sbb; els.bonusRate.textContent=bt?`1/${Math.max(1,Math.round(state.games/bt))}`:'-'; els.bellRate.textContent=state.bell?`1/${(state.games/state.bell).toFixed(1)}`:'-';
 els.modeText.textContent=state.bonusActive?`${state.bonusActive.label} ${state.bonusActive.remaining}`:state.challenge?'BONUS CHANCE':state.pendingBonus?`${bonusInfo[state.pendingBonus].label}成立`:state.spinning?'回転中':state.door>0?`SURVIVE ${state.door}`:'通常';
 els.history.innerHTML=state.history.map(x=>`<li>${x}</li>`).join('');
 document.querySelectorAll('.stop-hit').forEach((b,i)=>b.disabled=!state.spinning||state.stopped[i]||state.settling);
 $('#leverBtn').disabled=state.spinning||state.settling||(!state.bonusActive&&state.bet<3)||!!state.challenge||state.longFreeze; $('#maxBetBtn').disabled=state.spinning||state.settling||state.bet===3||state.credit<1||!!state.challenge||!!state.bonusActive||state.longFreeze; if(els.pushBtn) els.pushBtn.disabled=state.longFreeze||state.settling||((!!state.challenge && !state.challenge.awaitingPush) && !state.awaitingPushNotice);
 if(els.settingSelect) els.settingSelect.disabled = state.spinning || !!state.challenge;
 soundManager.ensureContextualBgm();
 updateHeroRuntimeDebug();
 updateSoundDebug();
}
function reset(){ soundManager.stopReelLoop(); soundManager.fadeOutBgm(240, 'normal'); Object.assign(state,{credit:50,bet:0,pay:0,diff:0,games:0,big:0,reg:0,sbb:0,bell:0,spinning:false,stopped:[true,true,true],result:null,center:['blue7','bell','cherry'],history:[],stage:0,pendingBonus:null,bonusReady:false,door:0,doorHits:0,presentation:'idle',currentSceneCategory:'idle',currentDropSymbol:'-',currentEnemyAction:'idle',currentBossPhase:'-',currentBossAction:'-',heroCostume:'school',heroAction:'idle',heroFrameIndex:0,heroFrameTotal:1,heroFramePath:'assets/sprites/hero/school/00.png',heroLoadStatus:'OK',quietGames:0,contradiction:false,settling:false,performancePhase:0,awaitingPushNotice:null,nextGameNotice:null,challenge:null,bonusActive:null,reelBases:[0,0,0],stopIndices:[0,0,0],spinStartedAt:0,longFreeze:false,forceLongFreeze:false}); clearPrizeScene(); clearBossBattle(); clearBonusConfirm(); clearLongFreeze(); clearBonusLcd(); clearLcdMood(); randomizeActors(); setStage(0); playEffect('idle',''); setCenter(state.center); update(); }
function rand(n){return Math.floor(Math.random()*n)}
function heroDebugFrames(){
 return heroFramePaths(heroDebugState.action, heroDebugState.costume);
}
function heroDebugFramePath(){
 const frames = heroDebugFrames();
 if(!frames.length) return '';
 heroDebugState.frame = (heroDebugState.frame + frames.length) % frames.length;
 return frames[heroDebugState.frame];
}
function updateHeroDebugInfo(){
 const info = $('#heroDebugInfo');
 if(!info) return;
 const frames = heroDebugFrames();
 const path = frames[heroDebugState.frame] || '';
 info.innerHTML = [
   ['costume', heroDebugState.costume],
   ['action', normalizeHeroAction(heroDebugState.action)],
   ['frame', `${frames.length ? heroDebugState.frame + 1 : 0} / ${frames.length}`],
   ['path', path || '-'],
   ['status', heroDebugState.status]
 ].map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
}
function renderHeroDebugFrame(){
 const img = $('#heroDebugPreview');
 if(!img) return;
 const path = heroDebugFramePath();
 if(!path){
   heroDebugState.status = 'NO FRAME';
   updateHeroDebugInfo();
   return;
 }
 heroDebugState.status = 'LOADING';
 img.onload = () => { heroDebugState.status = 'OK'; updateHeroDebugInfo(); };
 img.onerror = () => {
   heroDebugState.status = heroDebugState.costume !== 'school' ? 'FAILED - FALLBACK SCHOOL IDLE' : 'FAILED';
   img.onerror = null;
   if(heroDebugState.costume !== 'school') img.src = hero.school[0];
   updateHeroDebugInfo();
 };
 img.src = path;
 updateHeroDebugInfo();
}
function stopHeroDebug(){
 if(heroDebugState.timer) clearInterval(heroDebugState.timer);
 heroDebugState.timer = null;
 heroDebugState.playing = false;
}
function playHeroDebug(){
 stopHeroDebug();
 heroDebugState.playing = true;
 const interval = Math.max(60, Math.round(1000 / Math.max(1, heroDebugState.fps)));
 heroDebugState.timer = setInterval(()=>{
   heroDebugState.frame++;
   renderHeroDebugFrame();
 }, interval);
}
function restartHeroDebug(){
 heroDebugState.frame = 0;
 renderHeroDebugFrame();
 if(heroDebugState.playing) playHeroDebug();
}
function stepHeroDebug(delta){
 stopHeroDebug();
 heroDebugState.frame += delta;
 renderHeroDebugFrame();
}
function updateHeroRuntimeDebug(){
 const info = $('#heroRuntimeInfo');
 if(!info) return;
 const role = state.result?.role || '-';
 const boss = state.challenge?.boss?.label || '-';
 const bonusHint = !!(state.result?.bonus || state.result?.bonusReady || state.result?.hiddenBonus || state.pendingBonus || state.awaitingPushNotice || state.nextGameNotice);
 info.innerHTML = [
   ['currentSceneCategory', state.currentSceneCategory || '-'],
   ['currentHeroCostume', state.heroCostume],
   ['currentHeroAction', state.heroAction],
   ['currentPerformanceType', state.presentation || '-'],
   ['currentEnemyType', `${state.enemyA || '-'} / ${state.enemyB || '-'}`],
   ['currentEnemyAction', state.currentEnemyAction || '-'],
   ['currentDropSymbol', state.currentDropSymbol || '-'],
   ['isZombieWalkVisible', String(state.currentSceneCategory === 'zombie')],
   ['isCrateVisible', String(state.currentSceneCategory === 'crate')],
   ['currentRole', role],
   ['isContradiction', String(!!state.contradiction)],
   ['isBonusHint', String(bonusHint)],
   ['isBonusChance', String(!!state.challenge)],
   ['currentBossName', boss],
   ['currentBossPhase', state.currentBossPhase || '-'],
   ['currentBossAction', state.currentBossAction || '-'],
   ['isPushActive', String(!!state.challenge?.awaitingPush || !!state.awaitingPushNotice)],
   ['reviveCandidate', String(!!state.challenge?.revive)],
   ['liveFrame', `${(state.heroFrameIndex || 0) + 1} / ${state.heroFrameTotal || 1}`],
   ['livePath', state.heroFramePath || '-'],
   ['liveLoad', state.heroLoadStatus || '-']
 ].map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
}
function initHeroDebugPanel(){
 const costume = $('#heroDebugCostume');
 const action = $('#heroDebugAction');
 const fps = $('#heroDebugFps');
 if(!costume || costume.dataset.ready) return;
 costume.dataset.ready = '1';
 costume.addEventListener('change', e => { heroDebugState.costume = e.target.value; heroDebugState.frame = 0; renderHeroDebugFrame(); });
 action.addEventListener('change', e => { heroDebugState.action = e.target.value; heroDebugState.frame = 0; renderHeroDebugFrame(); });
 fps.addEventListener('input', e => {
   heroDebugState.fps = Number(e.target.value) || 4;
   const out = $('#heroDebugFpsValue');
   if(out) out.textContent = `${heroDebugState.fps} fps`;
   if(heroDebugState.playing) playHeroDebug();
 });
 $('#heroDebugPlay')?.addEventListener('click', playHeroDebug);
 $('#heroDebugPause')?.addEventListener('click', stopHeroDebug);
 $('#heroDebugRestart')?.addEventListener('click', restartHeroDebug);
 $('#heroDebugNext')?.addEventListener('click', () => stepHeroDebug(1));
 $('#heroDebugPrev')?.addEventListener('click', () => stepHeroDebug(-1));
 renderHeroDebugFrame();
 updateHeroRuntimeDebug();
}
function updateSoundDebug(){
 const info = $('#soundDebugInfo');
 if(!info) return;
 const s = soundManager.getState();
 info.innerHTML = [
   ['currentBgmName', s.currentBgmName],
   ['desiredBgm', s.desiredBgm],
   ['muted', String(s.muted)],
   ['volume', s.volume.toFixed(2)],
   ['audioUnlocked', String(s.unlocked)],
   ['reel_loop', 'disabled'],
   ['reel_start', 'disabled'],
   ['stopMapping', 'stop1/stop2/stop3 -> stop.mp3'],
   ['bonusConfirm', 'bonus_confirm.mp3 -> bonus_confirm2.mp3'],
   ['lastSe', s.lastSe || '-'],
   ['lastSeMode', s.lastSeMode || '-']
 ].map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
}
function initSoundDebugPanel(){
 const root = $('#soundDebugPanel');
 if(!root || root.dataset.ready) return;
 root.dataset.ready = '1';
 root.querySelectorAll('[data-bgm-test]').forEach(btn => btn.addEventListener('click', () => {
   soundManager.unlockAudio();
   soundManager.switchBgm(btn.dataset.bgmTest, false);
 }));
 root.querySelectorAll('[data-se-test]').forEach(btn => btn.addEventListener('click', () => {
   soundManager.unlockAudio();
   soundManager.playSe(btn.dataset.seTest);
 }));
 $('#soundDebugStopBgm')?.addEventListener('click', () => soundManager.stopBgm());
 $('#soundDebugFadeBgm')?.addEventListener('click', () => soundManager.fadeOutBgm(700));
 $('#soundDebugToggle')?.addEventListener('click', () => soundManager.setMuted(!soundManager.getState().muted));
 updateSoundDebug();
}
function renderDebugTools(){
 if(!document.body.classList.contains('debug-position') || $('#reelExportBtn')) return;
 const panel = $('#subPanel');
 if(!panel) return;
 panel.insertAdjacentHTML('beforeend', `<section class="card debug-tools"><h2>DEBUG</h2><button id="forceLongFreezeBtn" type="button">NEXT LONG FREEZE</button><button id="reelExportBtn" type="button">EXPORT REEL PNG</button></section>
 <section class="card debug-tools hero-debug">
   <h2>Hero Animation Debug</h2>
   <div class="hero-debug-stage"><img id="heroDebugPreview" alt=""></div>
   <label>Costume<select id="heroDebugCostume"><option>school</option><option>nurse</option><option>kimono</option><option>rush</option></select></label>
   <label>Action<select id="heroDebugAction"><option>idle</option><option>run</option><option>bat_attack</option><option>shoot</option><option>hit</option><option>down</option></select></label>
   <label>Speed <span id="heroDebugFpsValue">4 fps</span><input id="heroDebugFps" type="range" min="1" max="16" value="4"></label>
   <div class="hero-debug-controls"><button id="heroDebugPlay" type="button">Play</button><button id="heroDebugPause" type="button">Pause</button><button id="heroDebugRestart" type="button">Restart</button><button id="heroDebugPrev" type="button">Prev Frame</button><button id="heroDebugNext" type="button">Next Frame</button></div>
   <h3>Selected Animation</h3>
   <dl id="heroDebugInfo" class="hero-debug-info"></dl>
   <h3>Runtime Mapping</h3>
   <dl id="heroRuntimeInfo" class="hero-debug-info"></dl>
 </section>
 <section class="card debug-tools sound-debug" id="soundDebugPanel">
   <h2>Sound Debug</h2>
   <h3>BGM</h3>
   <div class="sound-debug-grid"><button type="button" data-bgm-test="normal">normal.mp3</button><button type="button" data-bgm-test="boss">boss.mp3</button><button type="button" data-bgm-test="rush">rush.mp3</button><button id="soundDebugStopBgm" type="button">STOP BGM</button><button id="soundDebugFadeBgm" type="button">FADE OUT</button><button id="soundDebugToggle" type="button">SOUND ON/OFF</button></div>
   <h3>SE</h3>
   <div class="sound-debug-grid">${['bet','bonus_confirm','bonus_confirm2','freeze','hit','item','lever','moan','run','shoot','stage_change','stop','zombie_die','stop1','stop2','stop3','reel_start','reel_loop'].map(name=>`<button type="button" data-se-test="${name}">${name}</button>`).join('')}</div>
   <h3>Status</h3>
   <dl id="soundDebugInfo" class="hero-debug-info"></dl>
 </section>`);
 $('#forceLongFreezeBtn').addEventListener('click', reserveLongFreeze);
 $('#reelExportBtn').addEventListener('click', exportReelStripImages);
 initHeroDebugPanel();
 initSoundDebugPanel();
}
function loadImage(src){
 return new Promise((resolve, reject) => {
   const img = new Image();
   img.onload = () => resolve(img);
   img.onerror = reject;
   img.src = src;
 });
}
async function loadSymbolImage(key){
 const s = symbolDefs[key];
 return await loadImage(s.src);
}
function drawImageContain(ctx, img, x, y, w, h){
 const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight);
 const iw = img.naturalWidth * scale;
 const ih = img.naturalHeight * scale;
 ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
}
async function exportReelStripImages(){
 const cache = {};
 await Promise.all(Object.keys(symbolDefs).map(async k => { cache[k] = await loadSymbolImage(k); }));
 reelMap.forEach((map, reelIndex) => {
   const cellW = 640;
   const cellH = 320;
   const canvas = document.createElement('canvas');
   canvas.width = cellW;
   canvas.height = cellH * map.length;
   const ctx = canvas.getContext('2d');
   map.forEach((key, i) => {
     const y = i * cellH;
     const grd = ctx.createLinearGradient(0, y, 0, y + cellH);
     grd.addColorStop(0, '#fff5e6');
     grd.addColorStop(1, '#cabda9');
     ctx.fillStyle = grd;
     ctx.fillRect(0, y, cellW, cellH);
     ctx.strokeStyle = 'rgba(0,0,0,.22)';
     ctx.strokeRect(12, y + 12, cellW - 24, cellH - 24);
     drawImageContain(ctx, cache[key], 18, y + 18, cellW - 36, cellH - 36);
   });
   const a = document.createElement('a');
   a.href = canvas.toDataURL('image/png');
   a.download = `reel-${reelIndex + 1}-strip.png`;
   a.click();
 });
}
window.exportReelStripImages = exportReelStripImages;
if(new URLSearchParams(location.search).get('debug') === '1'){ document.body.classList.add('debug-position'); }
init();
