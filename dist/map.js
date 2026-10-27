import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {groundAt,stepPlayer,surfaces} from './arena-physics.js';
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
Promise.allSettled(jobs).then(results=>{const errors=results.filter(r=>r.status==='rejected');loaded=errors.length===0;status.textContent=errors.length?'Some scenery failed to load. Refresh to retry.':'Arena ready · Explore on foot';document.querySelector('#explore').disabled=!loaded;document.querySelector('#explore').textContent=loaded?'Explore on foot ↗':'Refresh to retry';if(errors.length)console.error(errors);});
const player={x:0,z:25,y:groundAt(0,25),vy:0,grounded:true};let yaw=0,pitch=0,previous=0,sprinting=false;const keys=new Set(),stick={x:0,y:0};
function setWalk(value){if(value&&!loaded)return;walk=value;transition=null;controls.enabled=!walk;keys.clear();stick.x=stick.y=0;document.body.classList.toggle('walking',walk);document.querySelector('#explore').textContent=walk?'Map overview ↗':'Explore on foot ↗';document.querySelector('#crosshair').hidden=!walk;if(!walk){camera.rotation.order='XYZ';camera.position.set(70,83,100);controls.target.set(0,0,0);controls.update();}else{yaw=0;pitch=0;camera.rotation.order='YXZ';document.querySelector('#zone').textContent='CAMP APPROACH';}}
document.querySelector('#explore').onclick=()=>setWalk(!walk);
const views={overview:{p:[70,83,100],t:[0,0,0]},plaza:{p:[22,24,27],t:[0,1,0]},camp:{p:[-47,24,45],t:[-22,1,20]},lookout:{p:[35,25,-38],t:[0,3,-15]}};
function view(name){if(walk)setWalk(false);const v=views[name];transition={p:new THREE.Vector3(...v.p),t:new THREE.Vector3(...v.t)};document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('selected',b.dataset.view===name));}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>view(b.dataset.view));document.querySelector('#reset').onclick=()=>view('overview');controls.addEventListener('start',()=>transition=null);
function jump(){if(walk&&player.grounded){player.vy=7;player.grounded=false;}}
addEventListener('keydown',e=>{if(['KeyW','KeyA','KeyS','KeyD','Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'].includes(e.code)&&walk)e.preventDefault();keys.add(e.code);if(e.code==='Space'&&!e.repeat)jump();if(e.code==='Escape'&&walk)setWalk(false);});addEventListener('keyup',e=>keys.delete(e.code));
addEventListener('blur',()=>{keys.clear();stick.x=stick.y=0;sprinting=false;});document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();stick.x=stick.y=0;}});
let look=null;renderer.domElement.addEventListener('pointerdown',e=>{if(!walk)return;look={id:e.pointerId,x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId);});renderer.domElement.addEventListener('pointermove',e=>{if(!walk||!look||look.id!==e.pointerId)return;yaw-=(e.clientX-look.x)*.004;pitch=THREE.MathUtils.clamp(pitch-(e.clientY-look.y)*.003,-1.2,1.2);look.x=e.clientX;look.y=e.clientY;});for(const type of ['pointerup','pointercancel','lostpointercapture'])renderer.domElement.addEventListener(type,()=>look=null);
const joystick=document.querySelector('#joystick'),nub=document.querySelector('#nub');let stickId=null;
function moveStick(e){const b=joystick.getBoundingClientRect(),dx=(e.clientX-b.left-b.width/2)/38,dy=(e.clientY-b.top-b.height/2)/38,l=Math.max(1,Math.hypot(dx,dy));stick.x=dx/l;stick.y=dy/l;nub.style.transform=`translate(${stick.x*30}px,${stick.y*30}px)`;}
joystick.onpointerdown=e=>{if(stickId!==null)return;stickId=e.pointerId;joystick.setPointerCapture(e.pointerId);moveStick(e);};joystick.onpointermove=e=>{if(e.pointerId===stickId)moveStick(e);};function clearStick(e){if(e.pointerId!==stickId)return;stickId=null;stick.x=stick.y=0;nub.style.transform='';}joystick.onpointerup=clearStick;joystick.onpointercancel=clearStick;joystick.onlostpointercapture=clearStick;
document.querySelector('#jump').onclick=jump;document.querySelector('#sprint').onclick=e=>{sprinting=!sprinting;e.currentTarget.classList.toggle('active',sprinting);e.currentTarget.setAttribute('aria-pressed',String(sprinting));};document.querySelector('#unstuck').onclick=()=>{Object.assign(player,{x:0,z:25,y:groundAt(0,25),vy:0,grounded:true});yaw=0;pitch=0;};
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
renderer.setAnimationLoop(t=>{const dt=Math.min((t-previous)/1000,.04);previous=t;
 if(walk){const k=c=>keys.has(c)?1:0;const strafe=k('KeyD')-k('KeyA')+stick.x,forward=k('KeyW')+k('ArrowUp')-k('KeyS')-k('ArrowDown')-stick.y,l=Math.max(1,Math.hypot(strafe,forward));yaw+=(k('ArrowLeft')-k('ArrowRight'))*dt*1.8;const speed=(sprinting||keys.has('ShiftLeft')||keys.has('ShiftRight'))?8:4.8;stepPlayer(player,((strafe/l)*Math.cos(yaw)-(forward/l)*Math.sin(yaw))*speed*dt,(-(strafe/l)*Math.sin(yaw)-(forward/l)*Math.cos(yaw))*speed*dt,dt,solids);camera.position.set(player.x,player.y+1.65,player.z);camera.rotation.set(pitch,yaw,0,'YXZ');document.querySelector('#zone').textContent=player.z<-10?'THE LOOKOUTS':player.x>14?(player.z>20?'ROCKY RUN':'CRATE YARD'):player.x<-14?(player.z>8?'CAMP SPLASH':'AUTUMN GROVE'):'SPLASH PLAZA';}
 else{if(transition){camera.position.lerp(transition.p,.065);controls.target.lerp(transition.t,.065);if(camera.position.distanceTo(transition.p)<.03)transition=null;}controls.update();}
 water.children.forEach((b,i)=>b.position.y=2+Math.sin(t*.002+i)*.35);renderer.render(scene,camera);
});
