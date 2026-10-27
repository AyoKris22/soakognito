import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const status=document.querySelector('#status');
const scene=new THREE.Scene();scene.background=new THREE.Color('#c8e5e9');scene.fog=new THREE.Fog('#c8e5e9',115,230);
const camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.1,350);camera.position.set(78,77,95);
let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true});}catch(error){status.textContent='3D preview unavailable in this browser';const notice=document.querySelector('#error');notice.hidden=false;notice.textContent='This map needs WebGL. Open it in a browser with hardware acceleration enabled to explore the 3D arena.';throw error;}renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor('#c8e5e9');document.querySelector('#scene').appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=Math.PI/2.08;controls.minDistance=12;controls.maxDistance=175;controls.target.set(0,0,0);
scene.add(new THREE.HemisphereLight(0xe6fbff,0x667b42,2.5));const sun=new THREE.DirectionalLight(0xffefcc,3);sun.position.set(-45,70,35);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-60,right:60,top:60,bottom:-60,near:1,far:180});sun.shadow.normalBias=.06;scene.add(sun);
const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.86});
function mesh(g,m,x=0,y=0,z=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.receiveShadow=true;o.castShadow=true;scene.add(o);return o;}
function disk(r,h,c,x=0,y=0,z=0){return mesh(new THREE.CylinderGeometry(r,r,h,96),mat(c),x,y,z)}
disk(45,3.5,'#a87348',0,-2);disk(45,.55,'#89bb5a',0,-.02);
const pathMat=mat('#eed29c');const ring=mesh(new THREE.RingGeometry(28,32,128),pathMat,0,.28,0);ring.rotation.x=-Math.PI/2;
for(let i=0;i<4;i++){const a=i*Math.PI/2;const p=mesh(new THREE.BoxGeometry(6,.07,30),pathMat,Math.sin(a)*16,.3,Math.cos(a)*16);p.rotation.y=a;}
disk(10,.12,'#f2dcb2',0,.35);disk(4.6,.6,'#faf0d3',0,.7);disk(3.9,.63,'#4ccbd7',0,.77);disk(.65,2.2,'#fff0cf',0,1.8);disk(1.9,.3,'#f7e5ba',0,2.8);disk(1.6,.12,'#54d4df',0,3.0);
const water=new THREE.Group();scene.add(water);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const b=new THREE.Mesh(new THREE.SphereGeometry(.12,6,6),mat('#b3f9fa'));b.position.set(Math.sin(a)*2,2.2,Math.cos(a)*2);water.add(b);}
const routes=new THREE.Group();scene.add(routes);for(let i=0;i<16;i++){const a=i*Math.PI/8;const o=new THREE.Mesh(new THREE.ConeGeometry(.35,.8,3),mat('#fc7451'));o.rotation.x=Math.PI/2;o.rotation.z=-a;o.position.set(Math.sin(a)*30,.42,Math.cos(a)*30);routes.add(o);}
document.querySelector('#paths').addEventListener('change',e=>routes.visible=e.target.checked);
const loader=new GLTFLoader(),cache=new Map();
async function asset(pack,name){const k=pack+'/'+name;if(!cache.has(k))cache.set(k,loader.loadAsync('./assets/'+k+'.glb').then(g=>g.scene));return cache.get(k);}
async function place(pack,name,x,z,height,rot=0,y=.32){const base=await asset(pack,name);const o=base.clone(true);const box=new THREE.Box3().setFromObject(o);const size=box.getSize(new THREE.Vector3());const center=box.getCenter(new THREE.Vector3());const scale=height/size.y;o.position.sub(new THREE.Vector3(center.x,box.min.y,center.z));const wrapper=new THREE.Group();wrapper.add(o);wrapper.scale.setScalar(scale);wrapper.rotation.y=rot;wrapper.position.set(x,y,z);wrapper.traverse(n=>{if(n.isMesh){n.castShadow=true;n.receiveShadow=true;}});scene.add(wrapper);return wrapper;}
const jobs=[];function add(...args){jobs.push(place(...args));}
// Open gaps on the cardinal routes; a dense circular tree border defines the arena.
for(let i=0;i<44;i++){const a=i/44*Math.PI*2;const r=41+(i%3)*.7;add('forest',i%3?'tree':'tree-high',Math.sin(a)*r,Math.cos(a)*r,6+(i%4)*.6,a);}
for(let i=0;i<20;i++){const a=i/20*Math.PI*2+.16;const r=21+(i%3)*2;if(Math.abs(Math.sin(a))<.22||Math.abs(Math.cos(a))<.22)continue;add('forest',i%2?'tree':'rocks-low',Math.sin(a)*r,Math.cos(a)*r,i%2?5.5:2.4,a);}
// Four landmarks make the map readable from every approach.
for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2;const x=Math.sin(a)*17,z=Math.cos(a)*17;add('platformer','block-grass-large',x,z,2.2,a);add('platformer','block-grass-large-slope',x-4,z,2.2,Math.PI/2);add('forest','building-structure',x,z,4,a,2.52);add('forest','building-platform',x,z,1,a,5.3);add('forest','building-roof',x,z,2.1,a,6.3);add('forest','ladder',x+2,z,5.1,a);add('forest','flag',x,z,2,a,8.4);}
// Forest kit bridges and platformer stepping islands combine the two asset styles.
for(const sign of [-1,1]){add('forest','bridge',sign*12,0,2,Math.PI/2);add('platformer','block-grass-low-large',sign*16,0,1.1);add('forest','tent',sign*25,sign*23,3.4,sign*.8);add('forest','tent',sign*21,sign*27,2.8,sign*.7);add('forest','rocks-ramp',sign*33,-sign*13,3,sign);add('forest','platform',sign*31,-sign*18,3.2,sign);}
for(let i=0;i<12;i++){const a=i/12*Math.PI*2+.3;add('forest','plant',Math.sin(a)*35,Math.cos(a)*35,1.4,a);}
for(let i=0;i<8;i++){const a=i/8*Math.PI*2+.2;add('platformer','barrel',Math.sin(a)*12,Math.cos(a)*12,1.4,a);}
// Refill station placeholders: functional behavior belongs to the later game build.
for(let i=0;i<4;i++){const a=i*Math.PI/2+.4;const x=Math.sin(a)*34,z=Math.cos(a)*34;disk(1,.2,'#fff3c9',x,.4,z);mesh(new THREE.BoxGeometry(.9,1.8,.9),mat('#30c3d0'),x,1.4,z);}
Promise.allSettled(jobs).then(results=>{const failed=results.filter(r=>r.status==='rejected');status.textContent=failed.length?`${failed.length} assets could not load — refresh to retry.`:'Park ready · 90 m across';if(failed.length)console.error(failed);});
const views={overview:{p:[78,77,95],t:[0,0,0]},plaza:{p:[22,24,27],t:[0,1,0]},camp:{p:[48,23,45],t:[23,1,24]},lookout:{p:[32,23,-30],t:[12,3,-12]}};let transition=null;
function view(name){const v=views[name];transition={p:new THREE.Vector3(...v.p),t:new THREE.Vector3(...v.t)};document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('selected',b.dataset.view===name));}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>view(b.dataset.view));document.querySelector('#reset').onclick=()=>view('overview');controls.addEventListener('start',()=>transition=null);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
renderer.setAnimationLoop(t=>{if(transition){camera.position.lerp(transition.p,.065);controls.target.lerp(transition.t,.065);if(camera.position.distanceTo(transition.p)<.03)transition=null;}water.children.forEach((b,i)=>{b.position.y=2.1+Math.sin(t*.002+i)*.45;});controls.update();renderer.render(scene,camera);});
