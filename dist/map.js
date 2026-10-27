import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {groundAt,stepPlayer,surfaces,cameraDistance} from './arena-physics.js';
import {CHARACTER_ROSTER,createCharacter,createPreviewRoster} from './characters.js';
import {traceWater,WaterTank} from './water-physics.js';
import {loadCharacterBody} from './character-body.js';
const status=document.querySelector('#status');
const scene=new THREE.Scene();scene.background=new THREE.Color('#c8e5e9');scene.fog=new THREE.Fog('#c8e5e9',90,195);
const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.08,260);camera.position.set(70,83,100);
let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true});}catch(error){status.textContent='3D unavailable in this browser';document.querySelector('#error').hidden=false;document.querySelector('#error').textContent='This map needs WebGL. Open it in a browser with hardware acceleration enabled.';throw error;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;document.querySelector('#scene').appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=Math.PI/2.08;controls.minDistance=12;controls.maxDistance=165;controls.target.set(0,0,0);
scene.add(new THREE.HemisphereLight(0xe6fbff,0x667b42,2.5));const sun=new THREE.DirectionalLight(0xffefcc,3);sun.position.set(-45,70,35);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-54,right:54,top:54,bottom:-54,near:1,far:180});sun.shadow.normalBias=.05;scene.add(sun);
const solids=[],jobs=[],markers=new THREE.Group();scene.add(markers);let loaded=false,walk=false,transition=null;
const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.85});
function mesh(g,m,x=0,y=0,z=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.receiveShadow=true;o.castShadow=true;scene.add(o);return o;}
function box(w,h,d,c,x,y,z){return mesh(new THREE.BoxGeometry(w,h,d),mat(c),x,y,z);}
function disk(r,h,c,x=0,y=0,z=0){return mesh(new THREE.CylinderGeometry(r,r,h,64),mat(c),x,y,z);}
function solid(x,z,w,d,top,rot=0,bottom=0){solids.push({type:'box',x,z,w,d,top,rot,bottom});}
function circle(x,z,r,top){solids.push({type:'circle',x,z,r,top,bottom:0});}
const ground=.28;
disk(45,3.5,'#a87348',0,-1.8);disk(45,.5,'#89bb5a',0,.02);
const sand=mat('#eed29c');const ring=mesh(new THREE.RingGeometry(28,32,96),sand,0,.29,0);ring.rotation.x=-Math.PI/2;
for(let i=0;i<4;i++){const a=i*Math.PI/2,p=box(6,.06,34,'#eed29c',Math.sin(a)*17,.3,Math.cos(a)*17);p.rotation.y=a;}
for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2,p=box(3,.04,18,'#d8ca91',Math.sin(a)*22,.31,Math.cos(a)*22);p.rotation.y=a;}
disk(10,.1,'#f2dcb2',0,.32);disk(3.7,.6,'#faf0d3',0,.55);disk(3.15,.65,'#4ccbd7',0,.61);disk(.55,2.2,'#fff0cf',0,1.6);disk(1.5,.25,'#f7e5ba',0,2.6);disk(1.25,.1,'#54d4df',0,2.77);circle(0,0,3.7,3);
const water=new THREE.Group();scene.add(water);for(let i=0;i<12;i++){const a=i*Math.PI/6,b=new THREE.Mesh(new THREE.SphereGeometry(.1,5,5),mat('#b3f9fa'));b.position.set(Math.sin(a)*1.7,2,Math.cos(a)*1.7);water.add(b);}
for(let i=0;i<16;i++){const a=i*Math.PI/8,o=new THREE.Mesh(new THREE.ConeGeometry(.3,.65,3),mat('#fc7451'));o.rotation.x=Math.PI/2;o.rotation.z=-a;o.position.set(Math.sin(a)*30,.4,Math.cos(a)*30);markers.add(o);}
document.querySelector('#paths').onchange=e=>markers.visible=e.target.checked;
const loader=new GLTFLoader(),cache=new Map();
async function place(pack,name,x,z,height,rot=0,y=ground,collision='box'){
 const key=pack+'/'+name;if(!cache.has(key))cache.set(key,loader.loadAsync('./assets/'+key+'.glb').then(g=>g.scene));const o=(await cache.get(key)).clone(true);
 const bounds=new THREE.Box3().setFromObject(o),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());o.position.sub(new THREE.Vector3(center.x,bounds.min.y,center.z));const group=new THREE.Group();group.add(o);group.scale.setScalar(height/size.y);group.rotation.y=rot;group.position.set(x,y,z);group.traverse(n=>{if(n.isMesh){n.castShadow=true;n.receiveShadow=true;}});scene.add(group);
 if(collision==='tree')circle(x,z,.52,y+height);else if(collision==='rock')circle(x,z,Math.min(size.x,size.z)*height/size.y*.43,y+height);else if(collision==='box')solid(x,z,size.x*height/size.y*.94,size.z*height/size.y*.94,y+height,rot,y);
 return group;
}
function add(...args){jobs.push(place(...args));}
function label(text,x,z,color='#fc7451'){
 const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#fff8e7';ctx.fillRect(0,0,512,128);ctx.fillStyle=color;ctx.font='bold 48px sans-serif';ctx.textAlign='center';ctx.fillText(text,256,82);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:true}));s.position.set(x,8,z);s.scale.set(9,2.25,1);scene.add(s);
}
// Border ring and trunk-sized collision keep the perimeter readable and closed.
for(let i=0;i<42;i++){const a=i/42*Math.PI*2,r=42+(i%2);add('forest',i%3?'tree':'tree-high',Math.sin(a)*r,Math.cos(a)*r,6+(i%4)*.5,a,ground,'tree');}
// North: two walkable lookout decks, a traversable bridge, and broad access ramps.
for(const s of surfaces){
 if(s.ramp){const geo=new THREE.BufferGeometry();const w=s.w/2,d=s.d/2,h=s.h;const vertices=new Float32Array([-w,0,d,w,0,d,w,h,-d,-w,0,d,w,h,-d,-w,h,-d]);geo.setAttribute('position',new THREE.BufferAttribute(vertices,3));geo.computeVertexNormals();const ramp=mesh(geo,mat('#ba8652'),s.x,ground,s.z);ramp.material.side=THREE.DoubleSide;for(let j=1;j<10;j++)box(s.w,.04,.12,'#e7b67b',s.x,ground+h*j/10+.025,s.z+d-s.d*j/10);}
 else{box(s.w,.38,s.d,'#bc8653',s.x,ground+s.h-.19,s.z);for(let j=0;j<s.w;j+=1)box(.045,.025,s.d,'#e9b77a',s.x-s.w/2+j,ground+s.h+.02,s.z);}
}
for(const sign of [-1,1]){const x=sign*17;for(const dx of [-3.9,3.9])for(const dz of [-3.4,3.4]){box(.3,3.1,.3,'#805634',x+dx,1.8,-15+dz);solid(x+dx,-15+dz,.3,.3,3.4);}
 for(const dx of [-3.9,3.9])for(const dz of [-3.4,3.4]){box(.22,2.1,.22,'#a87749',x+dx,4.33,-15+dz);solid(x+dx,-15+dz,.22,.22,5.4,0,3.28);}
 // Back rails leave both deck fronts and bridge connections open.
 box(9,.18,.18,'#e8b675',x,4.3,-19);solid(x,-19,9,.18,4.5);box(9,.18,.18,'#e8b675',x,3.8,-19);
 add('forest','building-roof',x,-16,1.8,0,5.1,'none');add('forest','flag',x,-16,1.6,0,7,'none');
 add('survival','box',x+2,-14,1.1,0,3.28);}
for(const z of [-16.6,-13.4]){box(25,.14,.14,'#e8b675',0,4.2,z);solid(0,z,25,.14,4.3,0,3.28);}
label('THE LOOKOUTS',0,-22,'#4c8f9d');
// East: crates, workbenches and short fence runs form several entrances, never a sealed maze.
label('CRATE YARD',23,9,'#b68134');
for(const [x,z,h,r] of [[21,3,1.5,0],[23,3,1.1,.15],[26,8,1.7,.1],[21,13,1.4,.2],[27,15,1.2,-.1],[17,8,1.4,.1]])add('survival','box-large',x,z,h,r);
for(const [x,z,a] of [[18,3,0],[28,3,0],[29,10,Math.PI/2],[18,15,0]])add('survival','fence-fortified',x,z,1.6,a);
add('survival','workbench',24,18,1.4);add('survival','barrel',26,18,1.3);add('survival','signpost',32,5,2.5,0,ground,'none');
// South-west: campsite clusters give usable cover without blocking the ring road.
label('CAMP SPLASH',-21,20,'#e47746');
for(const [x,z,a] of [[-21,18,.6],[-27,22,1.3],[-17,26,-.5]])add('survival','tent',x,z,2.6,a);
add('survival','structure',-26,14,3.4,0,ground,'none');add('survival','structure-roof',-26,14,1.3,0,3.7,'none');
for(const dx of [-2,2]){box(.25,3.2,.25,'#a87749',-26+dx,1.88,14);solid(-26+dx,14,.25,.25,3.5);}
add('survival','workbench',-25,15,1.35);add('survival','box',-24,12,1.1);add('survival','bedroll',-21,21,.25,0,ground,'none');add('survival','campfire-pit',-20,23,.45,0,ground,'none');add('survival','bucket',-18,22,.65,0,ground,'none');
// North-west and south-east: woodland cover clusters break up the longest shots.
label('AUTUMN GROVE',-26,-8,'#c96c30');
for(const [x,z] of [[-27,-6],[-33,-10],[-28,-17],[-22,-23]])add('survival','tree-autumn',x,z,6,0,ground,'tree');
for(const [x,z,a] of [[-26,-3,.3],[-29,-16,.8],[-20,-25,.3],[13,22,-.4],[23,24,.5]])add('survival','tree-log',x,z,1.25,a);
for(const [x,z,h] of [[-20,-7,2.2],[-32,-1,2.4],[18,22,2.5],[25,23,2],[16,28,2.2],[9,18,1.8]])add('survival','rock-a',x,z,h,0,ground,'rock');
label('ROCKY RUN',20,26,'#637db0');
for(let i=0;i<10;i++){const a=i*Math.PI/5+.2;const x=Math.sin(a)*35,z=Math.cos(a)*35;add('forest','plant',x,z,1.15,a,ground,'none');}
// Platformer pieces keep the original bright playground language around the plaza.
for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2,x=Math.sin(a)*9,z=Math.cos(a)*9;add('platformer','block-grass-low-large',x,z,1,a);add('survival','barrel',Math.sin(a+.2)*12,Math.cos(a+.2)*12,1.25);}
// Four blue water kiosks: visible landmarks for the future refill mechanic.
for(const [x,z] of [[0,34],[34,0],[-34,0],[0,-29]]){disk(1.15,.18,'#fff3c9',x,.36,z);box(1,1.6,1,'#30c3d0',x,1.15,z);box(1.3,.2,1.3,'#fff3c9',x,2,z);circle(x,z,.7,2.2);}
Promise.allSettled(jobs).then(results=>{const errors=results.filter(r=>r.status==='rejected');loaded=errors.length===0;status.textContent=errors.length?'Some scenery failed to load. Refresh to retry.':'Arena ready · Explore on foot';document.querySelector('#explore').disabled=!loaded;document.querySelector('#crew-enter').disabled=!loaded;document.querySelector('#explore').textContent=loaded?'Explore on foot ↗':'Refresh to retry';if(errors.length)console.error(errors);});
// Original chibi heads and accessories on the supplied skinned body.
await loadCharacterBody().catch(error=>console.warn('Character base unavailable; using the built-in body.',error));
let selectedId='bucket';try{const saved=localStorage.getItem('soakognito-character');if(CHARACTER_ROSTER.some(c=>c.id===saved))selectedId=saved;}catch{}
let actor=createCharacter(selectedId);scene.add(actor.root);actor.root.visible=false;
const characterScene=new THREE.Scene();characterScene.background=new THREE.Color('#fff2d7');
characterScene.add(new THREE.HemisphereLight(0xffffff,0x90ac8b,3));const characterLight=new THREE.DirectionalLight(0xfff4df,3.4);characterLight.position.set(-3,5,5);characterScene.add(characterLight);
const characterCamera=new THREE.PerspectiveCamera(34,innerWidth/innerHeight,.1,30);characterCamera.position.set(0,1.6,5.3);function stageCamera(){const portrait=innerWidth<701&&innerHeight>innerWidth;characterCamera.aspect=innerWidth/innerHeight;characterCamera.position.set(0,portrait?1.8:1.6,portrait?8:5.3);characterCamera.lookAt(innerWidth<701&&!portrait?-.65:0,portrait?.4:1,0);characterCamera.updateProjectionMatrix();}stageCamera();
const stage=new THREE.Mesh(new THREE.CylinderGeometry(1.12,1.18,.12,64),mat('#a6e4df'));stage.position.y=-.08;characterScene.add(stage);
const stageRing=new THREE.Mesh(new THREE.TorusGeometry(1.12,.035,8,64),mat('#fca65c'));stageRing.rotation.x=Math.PI/2;stageRing.position.y=-.015;characterScene.add(stageRing);
const previewRoster=createPreviewRoster(characterScene);let previewActor=previewRoster.select(selectedId);let picking=false,wasWalking=false;
const roster=document.querySelector('#roster');
CHARACTER_ROSTER.forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.dataset.character=c.id;b.setAttribute('role','radio');b.setAttribute('aria-checked',String(c.id===selectedId));b.style.setProperty('--crew-color',c.shirt);b.innerHTML=`<span class="crew-number">0${i+1}</span><span><strong>${c.name}</strong><small>${c.tag}</small></span><span class="crew-check">✓</span>`;b.onclick=()=>selectCharacter(c.id);b.onkeydown=e=>{if(['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].includes(e.key)){e.preventDefault();const next=(i+(['ArrowRight','ArrowDown'].includes(e.key)?1:5))%6;selectCharacter(CHARACTER_ROSTER[next].id);roster.children[next].focus();}};roster.appendChild(b);});
function selectCharacter(id){selectedId=id;const c=CHARACTER_ROSTER.find(c=>c.id===id);previewActor=previewRoster.select(id);previewActor.root.visible=true;document.querySelector('#crew-name').textContent=c.name;document.querySelector('#crew-description').textContent=c.description;document.querySelector('#crew-enter').textContent='Explore as '+c.name;roster.querySelectorAll('button').forEach(b=>{b.setAttribute('aria-checked',String(b.dataset.character===id));b.classList.toggle('selected',b.dataset.character===id);});}
function openCharacters(){wasWalking=walk;if(walk)setWalk(false);picking=true;controls.enabled=false;document.body.classList.add('choosing');document.querySelector('#character-picker').hidden=false;keys.clear();stick.x=stick.y=0;selectCharacter(selectedId);document.querySelector('#crew-enter').disabled=!loaded;document.querySelector('#crew-close').focus();}
function closeCharacters(resume=false){picking=false;document.body.classList.remove('choosing');document.querySelector('#character-picker').hidden=true;controls.enabled=true;if(resume)setWalk(true);else document.querySelector('#characters').focus();}
document.querySelector('#characters').onclick=openCharacters;document.querySelector('#crew-switch').onclick=openCharacters;document.querySelector('#crew-close').onclick=()=>closeCharacters(wasWalking);
document.querySelector('#crew-enter').onclick=()=>{if(!loaded)return;actor.dispose();actor=createCharacter(selectedId);scene.add(actor.root);try{localStorage.setItem('soakognito-character',selectedId);}catch{}document.querySelector('#crew-current').textContent=actor.spec.name;closeCharacters(true);};
document.querySelector('#character-picker').addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeCharacters(wasWalking);}if(e.key==='Tab'){const list=[...document.querySelectorAll('#character-picker button:not(:disabled)')];if(e.shiftKey&&document.activeElement===list[0]){e.preventDefault();list.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===list.at(-1)){e.preventDefault();list[0].focus();}}});
selectCharacter(selectedId);document.querySelector('#crew-current').textContent=actor.spec.name;
const player={x:0,z:25,y:groundAt(0,25),vy:0,grounded:true};let yaw=0,pitch=.05,previous=0,sprinting=false,firing=false,mouseLocked=false;const touchDevice=matchMedia('(pointer: coarse)').matches;const keys=new Set(),stick={x:0,y:0};
function setWalk(value){if(value&&!loaded)return;walk=value;transition=null;controls.enabled=!walk;actor.root.visible=walk;look=null;firing=false;keys.clear();stick.x=stick.y=0;document.body.classList.toggle('walking',walk);document.querySelector('#explore').textContent=walk?'Map overview ↗':'Explore on foot ↗';document.querySelector('#crosshair').hidden=!walk;if(!walk){if(document.pointerLockElement===renderer.domElement)document.exitPointerLock();camera.rotation.order='XYZ';camera.position.set(70,83,100);controls.target.set(0,0,0);controls.update();}else{yaw=0;pitch=.05;camera.rotation.order='YXZ';if(!touchDevice)captureMouse();document.querySelector('#zone').textContent='CAMP APPROACH';}}
document.querySelector('#explore').onclick=()=>setWalk(!walk);
const views={overview:{p:[70,83,100],t:[0,0,0]},plaza:{p:[22,24,27],t:[0,1,0]},camp:{p:[-47,24,45],t:[-22,1,20]},lookout:{p:[35,25,-38],t:[0,3,-15]}};
function view(name){if(walk)setWalk(false);const v=views[name];transition={p:new THREE.Vector3(...v.p),t:new THREE.Vector3(...v.t)};document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('selected',b.dataset.view===name));}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>view(b.dataset.view));document.querySelector('#reset').onclick=()=>view('overview');controls.addEventListener('start',()=>transition=null);
function jump(){if(walk&&player.grounded){player.vy=7;player.grounded=false;}}
addEventListener('keydown',e=>{if(['KeyW','KeyA','KeyS','KeyD','Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'].includes(e.code)&&walk)e.preventDefault();keys.add(e.code);if(e.code==='Space'&&!e.repeat)jump();if(e.code==='KeyR'&&walk&&!picking)tank.refill();if(e.code==='Escape'&&walk&&!picking)setWalk(false);});addEventListener('keyup',e=>keys.delete(e.code));
addEventListener('blur',()=>{keys.clear();stick.x=stick.y=0;sprinting=false;firing=false;});document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();stick.x=stick.y=0;firing=false;}});
let look=null,firePointer=null;
function captureMouse(){if(!walk||touchDevice||!renderer.domElement.requestPointerLock)return;try{const result=renderer.domElement.requestPointerLock();result?.catch(()=>{});}catch{}}
function aimMouse(dx,dy){yaw-=dx*.003;pitch=THREE.MathUtils.clamp(pitch+dy*.0025,-.65,.8);}
document.addEventListener('pointerlockchange',()=>{const previousLock=mouseLocked;mouseLocked=document.pointerLockElement===renderer.domElement;firing=false;if(previousLock&&!mouseLocked&&walk&&!picking)setWalk(false);});
document.addEventListener('mousemove',e=>{if(walk&&mouseLocked)aimMouse(e.movementX,e.movementY);});
renderer.domElement.addEventListener('pointerdown',e=>{if(!walk||picking)return;if(e.pointerType==='touch'){look={id:e.pointerId,x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId);}else if(e.button===0){if(!mouseLocked)captureMouse();firing=true;}});
renderer.domElement.addEventListener('pointermove',e=>{if(!walk||picking||mouseLocked)return;if(e.pointerType!=='touch'){if(look?.id==='mouse')aimMouse(e.clientX-look.x,e.clientY-look.y);look={id:'mouse',x:e.clientX,y:e.clientY};return;}if(!look||look.id!==e.pointerId)return;aimMouse(e.clientX-look.x,e.clientY-look.y);look.x=e.clientX;look.y=e.clientY;});
renderer.domElement.addEventListener('pointerleave',()=>{if(!mouseLocked)look=null;});
for(const type of ['pointerup','pointercancel'])document.addEventListener(type,e=>{if(e.pointerType!=='touch'||e.pointerId===firePointer)firing=false;if(look?.id!=='mouse'&&look?.id===e.pointerId)look=null;});
renderer.domElement.addEventListener('lostpointercapture',()=>{if(look?.id!=='mouse')look=null;});
const joystick=document.querySelector('#joystick'),nub=document.querySelector('#nub');let stickId=null;
function moveStick(e){const b=joystick.getBoundingClientRect(),dx=(e.clientX-b.left-b.width/2)/38,dy=(e.clientY-b.top-b.height/2)/38,l=Math.max(1,Math.hypot(dx,dy));stick.x=dx/l;stick.y=dy/l;nub.style.transform=`translate(${stick.x*30}px,${stick.y*30}px)`;}
joystick.onpointerdown=e=>{if(stickId!==null)return;stickId=e.pointerId;joystick.setPointerCapture(e.pointerId);moveStick(e);};joystick.onpointermove=e=>{if(e.pointerId===stickId)moveStick(e);};function clearStick(e){if(e.pointerId!==stickId)return;stickId=null;stick.x=stick.y=0;nub.style.transform='';}joystick.onpointerup=clearStick;joystick.onpointercancel=clearStick;joystick.onlostpointercapture=clearStick;
document.querySelector('#jump').onclick=jump;document.querySelector('#sprint').onclick=e=>{sprinting=!sprinting;e.currentTarget.classList.toggle('active',sprinting);e.currentTarget.setAttribute('aria-pressed',String(sprinting));};document.querySelector('#unstuck').onclick=()=>{Object.assign(player,{x:0,z:25,y:groundAt(0,25),vy:0,grounded:true});yaw=0;pitch=.05;};
// Water spray practice: actual muzzle origin, cover collision and reusable splash particles.
const tank=new WaterTank(),practiceTargets=[],shots=[],splashes=[];let practiceHits=0;
const waterGeometry=new THREE.SphereGeometry(1,8,6),sprayMaterial=new THREE.MeshStandardMaterial({color:'#62dcf2',roughness:.2,emissive:'#1785a0',emissiveIntensity:.2});
for(const [x,z] of [[-7,17],[0,12],[7,17]]){const group=new THREE.Group();group.position.set(x,1.8,z);const rim=new THREE.Mesh(new THREE.TorusGeometry(.55,.08,10,32),mat('#ffb54f'));group.add(rim);const face=new THREE.Mesh(new THREE.CircleGeometry(.48,32),mat('#eefdf4'));group.add(face);const bull=new THREE.Mesh(new THREE.CircleGeometry(.18,24),mat('#f77551'));bull.position.z=.012;group.add(bull);scene.add(group);box(.13,1.4,.13,'#96744b',x,.98,z);practiceTargets.push({x,y:1.8,z,r:.58,group,pulse:0});}
label('SPLASH PRACTICE',0,12,'#3987a1');
for(let i=0;i<70;i++){const mesh=new THREE.Mesh(waterGeometry,sprayMaterial);mesh.visible=false;scene.add(mesh);shots.push({mesh,active:false,p:new THREE.Vector3(),v:new THREE.Vector3(),age:0});}
for(let i=0;i<160;i++){const mesh=new THREE.Mesh(waterGeometry,sprayMaterial);mesh.visible=false;scene.add(mesh);splashes.push({mesh,active:false,p:new THREE.Vector3(),v:new THREE.Vector3(),life:0});}
function splash(point){let count=0;for(const particle of splashes){if(particle.active)continue;particle.active=true;particle.life=.28+Math.random()*.25;particle.p.set(point.x,point.y,point.z);particle.v.set((Math.random()-.5)*3.8,1+Math.random()*2.5,(Math.random()-.5)*3.8);particle.mesh.visible=true;particle.mesh.scale.setScalar(.035+Math.random()*.025);if(++count===9)break;}}
const muzzlePoint=new THREE.Vector3(),aimDirection=new THREE.Vector3(),aimEnd=new THREE.Vector3();
function fireWater(){if(!tank.fire())return;const shot=shots.find(s=>!s.active);if(!shot)return;camera.getWorldDirection(aimDirection);aimEnd.copy(camera.position).addScaledVector(aimDirection,90);const aimHit=traceWater(camera.position,aimEnd,solids,practiceTargets,surfaces);if(aimHit)aimEnd.set(aimHit.x,aimHit.y,aimHit.z);actor.root.updateMatrixWorld(true);actor.muzzle.getWorldPosition(muzzlePoint);shot.p.copy(muzzlePoint);shot.v.copy(aimEnd).sub(muzzlePoint).normalize().multiplyScalar(30);shot.age=0;shot.active=true;shot.mesh.visible=true;shot.mesh.position.copy(shot.p);shot.mesh.scale.set(.055,.055,.24);actor.fire();}
function updateWater(dt){tank.update(dt);if(walk&&firing&&!picking)fireWater();const atStation=[[0,34],[34,0],[-34,0],[0,-29]].some(([x,z])=>Math.hypot(player.x-x,player.z-z)<2.5);if(walk&&atStation)tank.refill();
 for(const shot of shots){if(!shot.active)continue;const next=shot.p.clone().addScaledVector(shot.v,dt);const hit=traceWater(shot.p,next,solids,practiceTargets,surfaces);shot.age+=dt;if(hit||shot.age>2.3){shot.active=false;shot.mesh.visible=false;if(hit){splash(hit);if(hit.type==='target'){practiceHits++;practiceTargets[hit.index].pulse=.3;document.querySelector('#hit-count').textContent=practiceHits;document.querySelector('#hit-flash').classList.remove('flash');void document.querySelector('#hit-flash').offsetWidth;document.querySelector('#hit-flash').classList.add('flash');}}}else{shot.p.copy(next);shot.v.y-=1.4*dt;shot.mesh.position.copy(shot.p);shot.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),shot.v.clone().normalize());}}
 for(const particle of splashes){if(!particle.active)continue;particle.life-=dt;if(particle.life<=0){particle.active=false;particle.mesh.visible=false;continue;}particle.v.y-=8*dt;particle.p.addScaledVector(particle.v,dt);particle.mesh.position.copy(particle.p);}
 for(const target of practiceTargets){target.pulse=Math.max(0,target.pulse-dt);target.group.scale.setScalar(1+target.pulse*.6);target.group.rotation.z=Math.sin(target.pulse*30)*target.pulse*.3;}
 document.querySelector('#tank-fill').style.width=tank.water+'%';document.querySelector('#tank-label').textContent=tank.reload>0?'Refilling…':tank.water===0?'Empty — press R / Refill':Math.round(tank.water)+'% water';
}
const fireButton=document.querySelector('#fire');fireButton.onpointerdown=e=>{e.preventDefault();firePointer=e.pointerId;fireButton.setPointerCapture(e.pointerId);firing=true;};for(const type of ['pointerup','pointercancel','lostpointercapture'])fireButton.addEventListener(type,()=>{firing=false;firePointer=null;});document.querySelector('#refill').onclick=()=>tank.refill();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);stageCamera();});
renderer.setAnimationLoop(t=>{const dt=Math.min((t-previous)/1000,.04);previous=t;
 if(picking){previewActor.update(dt,{time:t/1000,preview:true});renderer.render(characterScene,characterCamera);return;}
 if(walk){const k=c=>keys.has(c)?1:0;const strafe=k('KeyD')-k('KeyA')+stick.x,forward=k('KeyW')+k('ArrowUp')-k('KeyS')-k('ArrowDown')-stick.y,l=Math.max(1,Math.hypot(strafe,forward));yaw+=(k('ArrowLeft')-k('ArrowRight'))*dt*1.8;const speed=(sprinting||keys.has('ShiftLeft')||keys.has('ShiftRight'))?8:4.8;const oldX=player.x,oldZ=player.z;stepPlayer(player,((strafe/l)*Math.cos(yaw)-(forward/l)*Math.sin(yaw))*speed*dt,(-(strafe/l)*Math.sin(yaw)-(forward/l)*Math.cos(yaw))*speed*dt,dt,solids);const dx=player.x-oldX,dz=player.z-oldZ,actualSpeed=Math.hypot(dx,dz)/Math.max(dt,.001);actor.root.position.set(player.x,player.y,player.z);if(actualSpeed>.1||firing){const facing=firing?yaw+Math.PI:Math.atan2(dx,dz),delta=THREE.MathUtils.euclideanModulo(facing-actor.root.rotation.y+Math.PI,Math.PI*2)-Math.PI;actor.root.rotation.y+=delta*Math.min(1,dt*13);}actor.update(dt,{speed:actualSpeed,grounded:player.grounded,time:t/1000,aiming:firing,aimPitch:-pitch});
 const target={x:player.x,y:player.y+1.55,z:player.z},offset=new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch)*5.4+Math.cos(yaw)*.65,Math.sin(pitch)*5.4,Math.cos(yaw)*Math.cos(pitch)*5.4-Math.sin(yaw)*.65),length=offset.length();offset.normalize();const distance=cameraDistance(target,offset,length,solids);camera.position.set(target.x+offset.x*distance,target.y+offset.y*distance,target.z+offset.z*distance);const aimForward=new THREE.Vector3(-Math.sin(yaw)*Math.cos(pitch),-Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch));camera.lookAt(camera.position.clone().addScaledVector(aimForward,20));actor.root.visible=distance>1.05;
 document.querySelector('#zone').textContent=player.z<-10?'THE LOOKOUTS':player.x>14?(player.z>20?'ROCKY RUN':'CRATE YARD'):player.x<-14?(player.z>8?'CAMP SPLASH':'AUTUMN GROVE'):'SPLASH PLAZA';}
 else{if(transition){camera.position.lerp(transition.p,.065);controls.target.lerp(transition.t,.065);if(camera.position.distanceTo(transition.p)<.03)transition=null;}controls.update();}
 updateWater(dt);water.children.forEach((b,i)=>b.position.y=2+Math.sin(t*.002+i)*.35);renderer.render(scene,camera);
});
