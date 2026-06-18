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
 rush:['assets/sprites/hero/rush/00.png','assets/sprites/hero/rush/01.png','assets/sprites/hero/rush/02.png','assets/sprites/hero/rush/03.png','assets/sprites/hero/rush/04.png','assets/sprites/hero/rush/05.png','assets/sprites/hero/rush/06.png','assets/sprites/hero/rush/07.png','assets/sprites/hero/rush/08.png','assets/sprites/hero/rush/09.png','assets/sprites/hero/rush/10.png']
};
const bonusBackgrounds = {
  SBB_RED:'assets/lcd/bonus-sbb-bg.png',
  SBB_BLUE:'assets/lcd/bonus-sbb-bg.png',
  BB_RED:'assets/lcd/bonus-big-bg.png',
  BB_BLUE:'assets/lcd/bonus-big-bg.png',
  REG:'assets/lcd/bonus-reg-bg.png'
};
const enemyNames = ['highschool_girl','boy_student','cabaret_girl','clerk','college_girl','courier','female_teacher','gal','girl_gym','girl_uniform','security_guard','housewife','influencer','model','office_lady','passenger','receptionist','salaryman','secretary','zombie_default','shopper','station_staff','yankee_boy','yankee_girl'];
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
  presentation:'crate', challenge:null, bonusActive:null, reelBases:[0,0,0], stopIndices:[0,0,0], spinStartedAt:0, longFreeze:false
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
function playFrames(img, frames, fps=8, name='anim', loop=true){
 clearAnim(name); if(!frames?.length) return; let i=0; img.src=frames[0];
 if(frames.length <= 1) return;
 const interval = Math.max(60, Math.round(1000/fps));
 timers[name]=setInterval(()=>{ i++; if(i>=frames.length){ if(!loop){ i=frames.length-1; clearAnim(name); }else i=0; } img.src=frames[i]; }, interval);
}
function heroFrames(action){
 const b = hero.school;
 if(action==='idle') return [b[0]];
 if(action==='rush') return hero.rush;
 if(action==='run') return [b[1],b[2],b[3],b[4],b[3],b[2]].filter(Boolean);
 if(action==='melee') return [b[5],b[6],b[5],b[0]].filter(Boolean);
 if(action==='shoot') return [b[7],b[8],b[9],b[8]].filter(Boolean);
 if(action==='special') return [b[1],b[2],b[3],b[5],b[6],b[7],b[8],b[9]].filter(Boolean);
 if(action==='down') return [b[10]].filter(Boolean);
 return [b[0]];
}
function enemySeq(name, action){
 const f = enemyFrames[name] || enemyFrames.highschool_girl;
 if(action==='walk') return [f[0],f[1],f[2],f[3],f[4]].filter(Boolean);
 if(action==='attack') return [f[3],f[4],f[5],f[4]].filter(Boolean);
 if(action==='hit') return [f[5],f[6],f[5]].filter(Boolean);
 if(action==='down') return [f[5],f[6],f[7]].filter(Boolean);
 return [f[0]];
}

function init(){
  els.reels.forEach((reel,i)=>reel.innerHTML=`<div class="strip">${buildStrip(reelMap[i])}</div>`);
  renderLegend(); renderStageButtons(); bind(); randomizeActors(); setStage(0); playEffect('miss','READY'); update(); requestAnimationFrame(()=>setCenter(state.center));
}
function symbolImgHtml(k, alt=symbolDefs[k].label){
 const s = symbolDefs[k];
 return `<img src="${s.src}" alt="${alt}">`;
}
function buildStrip(arr){ return [...arr,...arr,...arr].map(k=>`<div class="symbol">${symbolImgHtml(k)}</div>`).join(''); }
function bind(){
 $('#maxBetBtn').addEventListener('click', maxBet);
 $('#leverBtn').addEventListener('click', leverOn);
 $('#pushBtn').addEventListener('click', pushAction);
 document.querySelectorAll('.stop-hit').forEach(btn=>btn.addEventListener('click',()=>stopReel(Number(btn.dataset.stop))));
 $('#resetBtn').addEventListener('click', reset);
 if(els.settingSelect){
   els.settingSelect.value = String(state.setting);
   els.settingSelect.addEventListener('change', e => { state.setting = Number(e.target.value); update(); });
 }
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
function setHero(action){ const fps = action==='rush'?11:action==='special'?9:action==='shoot'?7:action==='melee'?8:action==='run'?8:3; playFrames(els.hero, heroFrames(action), fps, 'hero', true); }
function setEnemies(action){ const loop=action!=='down'; playFrames(els.enemyA, enemySeq(state.enemyA,action), action==='walk'?5:7, 'enemyA', loop); playFrames(els.enemyB, enemySeq(state.enemyB,action), action==='walk'?4:6, 'enemyB', loop); }
function clearBossBattle(){
 if(!els.bossBattle) return;
 els.bossBattle.className = 'boss-battle';
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
function setBonusLcd(type){
 if(!els.lcdWindow || !els.stageBg) return;
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
   playEffect('special', bonusInfo[bonus]?.badge || 'BONUS');
   update();
 };
 if(video){
   video.currentTime = 0;
   video.onended = null;
   video.play().catch(()=>{});
 }
 setTimeout(()=>els.longFreeze?.classList.remove('blackout'), 900);
 setTimeout(finish, 14000);
 update();
 return true;
}
function clearLongFreeze(){
 state.longFreeze = false;
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
 const pos = Math.max(0, Math.min(7, frame)) * 100 / 7;
 els.bossSprite.style.backgroundPosition = `${pos}% 0`;
}
function showBossBattle(boss, phase='intro'){
 if(!els.bossBattle || !boss) return;
 els.bossBattle.className = `boss-battle on ${phase}`;
 if(els.lcdWindow) els.lcdWindow.classList.add('boss-mode');
 els.bossSprite.style.backgroundImage = `url("${boss.src}")`;
 if(els.bossRate) els.bossRate.textContent = `${boss.label} ${boss.expect}%`;
 const frame = phase === 'attack' ? 5 : phase === 'hit' ? 6 : phase === 'down' ? 7 : 1;
 setBossFrame(frame);
}
function clearPrizeScene(){
 if(!els.prizeScene) return;
 els.prizeScene.className = 'prize-scene';
 if(els.prizeSymbol) els.prizeSymbol.removeAttribute('src');
}
function startPrizeScene(type='crate'){
 if(!els.prizeScene) return;
 els.prizeScene.className = `prize-scene ${type} ready`;
 if(els.prizeSymbol) els.prizeSymbol.removeAttribute('src');
}
function revealPrizeScene(result){
 if(!els.prizeScene || !result) return;
 const type = state.presentation || 'crate';
 const lineSymbol = result.grid && result.line?.rows?.length ? result.grid[1][result.line.rows[1]] : null;
 const key = result.bonus ? bonusInfo[result.bonus].center[0] : (lineSymbol || result.center?.[1] || result.center?.[0]);
 const symbol = symbolDefs[key] || symbolDefs.replay;
 if(els.prizeSymbol){
   els.prizeSymbol.src = symbol.src;
   els.prizeSymbol.alt = symbol.label;
 }
 els.prizeScene.className = `prize-scene ${type} break${result.bonus ? ' bonus' : ''}`;
 const revealDelay = type === 'freeze' ? 620 : type === 'horde' ? 560 : type === 'drop' ? 650 : 280;
 setTimeout(() => {
   if(els.prizeScene) els.prizeScene.className = `prize-scene ${type} reveal${result.bonus ? ' bonus' : ''}`;
 }, revealDelay);
}
function choosePresentation(result){
 if(result?.challenge) return Math.random() < .62 ? 'horde' : 'drop';
 if(result?.bonus && Math.random() < .35) return 'freeze';
 if(result?.bonus) return Math.random() < .55 ? 'horde' : 'drop';
 if(result?.role === 'REPLAY') return Math.random() < .55 ? 'horde' : 'crate';
 if(result?.role === 'BELL') return Math.random() < .55 ? 'crate' : 'drop';
 if(result?.role === 'CHERRY' || result?.role === 'SUIKA' || result?.role === 'HERO') return Math.random() < .7 ? 'drop' : 'horde';
 return Math.random() < .5 ? 'horde' : 'crate';
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
function buildMissStop(){
 const keys = Object.keys(symbolDefs);
 let targetIndices;
 let guard = 0;
 do{
   targetIndices = reelMap.map(arr => rand(arr.length));
   guard++;
 }while(hasWinningLine(getVisibleGrid(targetIndices)) && guard < 80);
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
 else if(effect==='avoid'||effect==='item'||effect==='door'){els.hero.classList.add('anim-run');els.enemyA.classList.add('anim-walk');els.enemyB.classList.add('anim-walk')}
 else{els.hero.classList.add('anim-idle');els.enemyA.classList.add('anim-walk');els.enemyB.classList.add('anim-walk')}
}
function playEffect(effect,badge){
 els.lcdStatus.textContent=badge;
 els.lcdStatus.classList.toggle('empty', !badge);
 els.lcdStatus.classList.toggle('hot',['special','shoot','bonus'].includes(effect));
 els.lcdStatus.classList.toggle('bonus',['special','bonus'].includes(effect));
 els.lcdStatus.classList.toggle('door',effect==='door' || state.door>0);
 actorClasses(effect);
 if(effect==='shoot'){setHero('shoot');setEnemies('hit')}
 else if(effect==='punch'){setHero('melee');setEnemies('attack')}
 else if(effect==='special'||effect==='bonus'){setHero('special');setEnemies('down')}
 else if(effect==='reveal'){setHero('melee');setEnemies('walk')}
 else if(effect==='avoid'||effect==='item'||effect==='door'){setHero('run');setEnemies('walk')}
 else{setHero('idle');setEnemies('walk')}
}
function flash(){ els.flash.classList.remove('on'); void els.flash.offsetWidth; els.flash.classList.add('on'); }

function maxBet(){ if(state.spinning||state.bet===3||state.credit<1||state.challenge||state.bonusActive||state.longFreeze)return; const need=3-state.bet; if(state.credit<need)return; state.credit-=need; state.bet=3; state.diff-=need; state.pay=0; update(); }
function pushAction(){
 if(state.longFreeze)return;
 if(state.challenge && !state.spinning){ advanceChallenge(); return; }
 if(state.pendingBonus && !state.spinning){
   if(state.bonusReady) startBonus();
   else flash();
   return;
 }
 flash(); els.lcdStatus.classList.remove('empty'); els.lcdStatus.textContent = state.spinning ? 'STOP!' : (state.door>0 ? 'SURVIVE' : 'PUSH');
 setTimeout(()=>{ if(!state.spinning && !state.pendingBonus && !state.challenge){ els.lcdStatus.classList.remove('empty'); els.lcdStatus.textContent = state.door>0 ? `SURVIVE ${state.door}` : 'READY'; } }, 300);
}
function leverOn(){
 if(state.spinning||state.challenge||state.longFreeze)return;
 if(!state.bonusActive && state.bet<3)return;
 clearPrizeScene();
 clearBossBattle();
 clearBonusConfirm();
 const doorActive = state.door > 0;
 els.lcdStatus.textContent=state.bonusActive ? 'BONUS' : (state.pendingBonus ? 'BONUS?' : (doorActive ? 'SURVIVE' : '...'));
 state.games++;
 state.reelBases = reelMap.map(arr => rand(arr.length));
 state.stopIndices = [null,null,null];
 state.spinStartedAt = performance.now();
 state.spinning=true; state.stopped=[false,false,false]; state.result=state.bonusActive ? drawBonusGameOutcome() : (state.pendingBonus ? drawPendingBonusOutcome() : drawOutcome()); state.center=state.result.center; state.presentation=choosePresentation(state.result);
 if(state.door>0) state.door--;
 if(!state.bonusActive && !doorActive && state.games%7===0)setStage(chooseRoamingStage(), true); if(state.games%4===0)randomizeActors();
 playEffect(state.presentation === 'freeze' ? 'special' : 'avoid', state.presentation === 'freeze' ? '!!!' : (state.bonusActive ? 'BONUS' : (state.pendingBonus ? 'BONUS?' : (doorActive ? 'SURVIVE' : '...'))));
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
 const readyChance = state.door > 0 ? .42 : .34;
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
function chooseTimedStopIndex(i){
 const arr = reelMap[i];
 const base = currentReelIndex(i);
 const desired = intentSymbolAtReel(i);
 const row = state.result?.line?.rows?.[i] ?? 1;
 if(desired){
   const candidates = [];
   for(let slip=0; slip<=MAX_SLIP; slip++){
     const centerIndex = modIndex(base + slip, arr.length);
     if(getRowsForCenter(i, centerIndex)[row] === desired) candidates.push({centerIndex, slip});
   }
   if(candidates.length) return candidates[0].centerIndex;
 }
 for(let slip=0; slip<=MAX_SLIP; slip++){
   const centerIndex = modIndex(base + slip, arr.length);
   if(!wouldCreateMissWin(i, centerIndex)) return centerIndex;
 }
 return base;
}
function stopReel(i){
 if(!state.spinning||state.stopped[i]||state.longFreeze)return;
 state.stopped[i]=true;
 const index = chooseTimedStopIndex(i);
 state.stopIndices[i] = index;
 alignReelToIndex(i,index, true);
 if(state.stopped.every(Boolean))settle();
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
function alignReelToIndex(i,index){ const strip=els.reels[i].querySelector('.strip'); const arr=reelMap[i]; const safeIndex=modIndex(Number.isFinite(index)?index:0, arr.length); strip.classList.remove('spinning'); const h=getCellHeight(); const targetIndex=arr.length+safeIndex-1; strip.style.transition='transform .42s cubic-bezier(.16,1,.3,1)'; strip.style.transform=`translateY(${-h*targetIndex}px)`; }
function setCenter(keys){keys.forEach((k,i)=>alignReel(i,k))}
function getCellHeight(){ return document.querySelector('.symbol')?.getBoundingClientRect().height || 66; }

function startBonusChallenge(result){
 const clear = !!result.hiddenBonus;
 state.challenge = {
   bonus: result.hiddenBonus,
   role: result.role,
   step:0,
   clear,
   type: result.hiddenBonus ? (Math.random() < .18 ? 'freeze' : (Math.random() < .55 ? 'horde' : 'drop')) : (Math.random() < .55 ? 'crate' : 'horde'),
   boss:chooseBoss(clear)
 };
 clearPrizeScene();
 if(els.prizeScene) els.prizeScene.className = 'prize-scene challenge';
 showBossBattle(state.challenge.boss, 'intro');
 playEffect('avoid','BONUS CHANCE');
 pushHistory(`${result.role} CHANCE`, 0);
 update();
}

function advanceChallenge(){
 const c = state.challenge;
 if(!c) return;
 c.step++;
 if(c.step === 1){
   state.presentation = c.type;
   showBossBattle(c.boss, 'attack');
   playEffect(c.type === 'freeze' ? 'special' : (c.role === 'SUIKA' ? 'shoot' : 'punch'), c.type === 'freeze' ? 'FREEZE' : 'BATTLE');
   return;
 }
 if(c.step === 2){
   if(c.clear){
     const bonus = c.bonus;
     showBossBattle(c.boss, 'down');
     state.challenge = null;
     state.pendingBonus = bonus;
     state.bonusReady = false;
     revealPrizeScene({bonus, center:bonusInfo[bonus].center});
     showBonusConfirm();
     playEffect('special', bonusInfo[bonus].badge);
     pushHistory(`CHANCE CLEAR ${bonusInfo[bonus].label}`, 0);
   }else{
     showBossBattle(c.boss, 'hit');
     state.challenge = null;
     clearPrizeScene();
     playEffect('miss','FAIL');
     pushHistory('CHANCE FAIL', 0);
     setTimeout(clearBossBattle, 900);
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

function settle(){
 const r=applyActualStops(state.result); state.spinning=false; state.pay=r.pay||0;
 if(r.bonusGame){
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
 if(r.role==='REPLAY' && !roleHit) state.bet=0;
 if(r.role==='BELL' && roleHit)state.bell++;
 if(getRoleSymbols(r.role) && !roleHit) state.pay = 0;
 if(shouldRevealPrize(r) && (!getRoleSymbols(r.role) || roleHit)){
   revealPrizeScene(r);
 }else{
   clearPrizeScene();
 }
 playEffect((r.bonus || r.bonusReady) ? 'special' : 'reveal', r.bonusReady ? bonusInfo[r.bonusReady].badge : (r.bonus ? bonusInfo[r.bonus].badge : ''));
 if(r.bonusReady){
   const readyHit = lineMatchesSymbols(r, bonusInfo[r.bonusReady].center);
   state.bonusReady = readyHit;
   showBonusConfirm();
   pushHistory(`${bonusInfo[r.bonusReady].label}${lineText(r)} ${readyHit ? 'READY' : 'MISS'}`, 0);
 }else if(r.bonus){
   state.credit+=state.pay; state.diff+=state.pay;
   state.pendingBonus = r.bonus;
   state.bonusReady = lineMatchesSymbols(r, bonusInfo[r.bonus].center);
   pushHistory(`${r.role}${lineText(r)}+${bonusInfo[r.bonus].label}${state.presentation === 'freeze' ? ' LONG FREEZE' : ''}`, state.pay);
   if(state.presentation === 'freeze'){
     startLongFreeze(r.bonus);
   }else{
     showBonusConfirm();
   }
 }else if(r.challenge){
   state.credit+=state.pay; state.diff+=state.pay;
   pushHistory(`${r.role}${lineText(r)}`, state.pay);
   setTimeout(()=>{ if(!state.spinning && !state.pendingBonus) startBonusChallenge(r); }, 760);
 }else{
   state.credit+=state.pay; state.diff+=state.pay;
   pushHistory(`${r.role}${lineText(r)}`, state.pay);
 }
 update();
}
function startBonus(){
 if(!state.pendingBonus||!state.bonusReady||state.spinning||state.bonusActive)return;
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
 clearBonusLcd();
 if(type !== 'REG'){
   state.door = type.startsWith('SBB') ? 64 : 32;
   state.doorHits++;
   setStageByKey('office');
 }else{
   setStageByKey('station');
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
 document.querySelectorAll('.stop-hit').forEach((b,i)=>b.disabled=!state.spinning||state.stopped[i]);
 $('#leverBtn').disabled=state.spinning||(!state.bonusActive&&state.bet<3)||!!state.challenge||state.longFreeze; $('#maxBetBtn').disabled=state.spinning||state.bet===3||state.credit<1||!!state.challenge||!!state.bonusActive||state.longFreeze; if(els.pushBtn) els.pushBtn.disabled=state.longFreeze;
 if(els.settingSelect) els.settingSelect.disabled = state.spinning || !!state.challenge;
}
function reset(){ Object.assign(state,{credit:50,bet:0,pay:0,diff:0,games:0,big:0,reg:0,sbb:0,bell:0,spinning:false,stopped:[true,true,true],result:null,center:['blue7','bell','cherry'],history:[],stage:0,pendingBonus:null,bonusReady:false,door:0,doorHits:0,presentation:'crate',challenge:null,bonusActive:null,reelBases:[0,0,0],stopIndices:[0,0,0],spinStartedAt:0,longFreeze:false}); clearPrizeScene(); clearBossBattle(); clearBonusConfirm(); clearLongFreeze(); clearBonusLcd(); randomizeActors(); setStage(0); playEffect('miss','READY'); setCenter(state.center); update(); }
function rand(n){return Math.floor(Math.random()*n)}
function renderDebugTools(){
 if(!document.body.classList.contains('debug-position') || $('#reelExportBtn')) return;
 const panel = $('#subPanel');
 if(!panel) return;
 panel.insertAdjacentHTML('beforeend', '<section class="card debug-tools"><h2>DEBUG</h2><button id="reelExportBtn" type="button">EXPORT REEL PNG</button></section>');
 $('#reelExportBtn').addEventListener('click', exportReelStripImages);
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
