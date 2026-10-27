import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {createCharacterBody} from './character-body.js';
export const CHARACTER_ROSTER=[
 {id:'bucket',name:'Bucket',tag:'The cheerful troublemaker',description:'Bucket helmet. Big grin. Absolutely no plan.',skin:'#f2bb8e',hair:'#704222',shirt:'#28b5b4',shorts:'#514a3f',shoes:'#ff8e28',accent:'#ffd43b'},
 {id:'goggles',name:'Goggles',tag:'The splash champion',description:'Goggles down. Confidence up. Dry socks optional.',skin:'#bd8054',hair:'#4f2c20',shirt:'#fc7963',shorts:'#ff9b7d',shoes:'#f77b68',accent:'#4be0df'},
 {id:'noodle',name:'Noodle',tag:'The very serious silly one',description:'Treats every water fight like a top-secret mission.',skin:'#f0c294',hair:'#493025',shirt:'#b0df35',shorts:'#8167c7',shoes:'#7662bc',accent:'#b4ec3e'},
 {id:'squirt',name:'Squirt',tag:'The walking splash hazard',description:'Fast feet. Wild hair. Questionable aim.',skin:'#ffcfaa',hair:'#f57a32',shirt:'#428ed0',shorts:'#ff8c39',shoes:'#428ed0',accent:'#73d9e3'},
 {id:'ducky',name:'Ducky',tag:'The deceptively sweet rival',description:'Cute floatie. Fierce competitive streak.',skin:'#ae744b',hair:'#523422',shirt:'#82d4b6',shorts:'#5fb99c',shoes:'#ffcf38',accent:'#ffdc39'},
 {id:'drip',name:'Drip',tag:'The unbothered menace',description:'Looks half asleep. Somehow always wins.',skin:'#edb587',hair:'#302b38',shirt:'#ab8ce2',shorts:'#49424f',shoes:'#628ed6',accent:'#b49ae9'}
];
// Use more curvature on large visible forms, fewer triangles on tiny details.
const sphereDetail=size=>size>=.3?[32,24]:size>=.09?[24,16]:[16,12];
export function createCharacter(id='bucket'){
 const spec=CHARACTER_ROSTER.find(c=>c.id===id)||CHARACTER_ROSTER[0];
 const root=new THREE.Group(),rig=new THREE.Group();root.add(rig);root.name='character-'+spec.id;
 const materials=new Map();const material=(color,gloss=false)=>{const key=color+gloss;if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:gloss ? .3 : .6,metalness:0,flatShading:false}));return materials.get(key);};
 function piece(parent,geometry,color,x,y,z,scale){const o=new THREE.Mesh(geometry,material(color));o.position.set(x,y,z);if(scale)o.scale.set(...scale);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 const ball=(p,c,x,y,z,s)=>{const [width,height]=sphereDetail(Math.max(...s));return piece(p,new THREE.SphereGeometry(1,width,height),c,x,y,z,s);};
 const block=(p,c,x,y,z,s)=>piece(p,new RoundedBoxGeometry(...s,4,Math.min(...s)*.3),c,x,y,z);
 const tube=(p,c,x,y,z,r,h,rTop=r)=>piece(p,new THREE.CylinderGeometry(rTop,r,h,32),c,x,y,z);
 const torus=(p,c,x,y,z,r,t)=>piece(p,new THREE.TorusGeometry(r,t,14,40),c,x,y,z);
 const torso=new THREE.Group();torso.position.y=.86;rig.add(torso);
 ball(torso,spec.shirt,0,0,0,[.31,.36,.225]);block(torso,spec.shorts,0,-.27,0,[.48,.22,.34]);
 if(['bucket','drip'].includes(spec.id)){const hood=torus(torso,spec.shirt,0,.23,-.02,.22,.07);hood.rotation.x=Math.PI/2;for(const x of [-.08,.08]){tube(torso,'#fff2d9',x,.14,.205,.012,.17);ball(torso,'#fff2d9',x,.05,.21,[.024,.025,.024]);}}
 if(spec.id==='noodle'){for(const sign of [-1,1])block(torso,'#d2ef57',sign*.16,.02,.21,[.24,.43,.1]);block(torso,'#707db5',0,-.04,.28,[.13,.08,.05]);}
 if(spec.id==='squirt'){const logo=ball(torso,'#a7f0ed',0,.015,.216,[.085,.12,.018]);logo.rotation.z=-.35;}
 const legs=[];for(const sign of [-1,1]){const p=new THREE.Group();p.position.set(sign*.145,.52,0);rig.add(p);tube(p,spec.skin,0,-.15,0,.1,.3);const shoeColor=spec.id==='squirt'&&sign===1?'#fb913d':spec.shoes;ball(p,shoeColor,0,-.39,.055,[.145,.13,.235]);if(['bucket','ducky'].includes(spec.id))tube(p,shoeColor,0,-.27,0,.13,.24);else{block(p,'#fff1d8',0,-.48,.06,[.27,.055,.4]);if(spec.id==='drip')for(const x of [-.055,.055])ball(p,'#34577c',x,-.335,.19,[.018,.013,.015]);}legs.push(p);}
 const arms=[];for(const sign of [-1,1]){const p=new THREE.Group();p.position.set(sign*.32,.99,0);p.rotation.z=sign*.12;rig.add(p);ball(p,spec.shirt,0,-.045,0,[.14,.17,.14]);tube(p,spec.skin,0,-.22,0,.092,.27);ball(p,spec.skin,0,-.36,.015,[.11,.105,.105]);arms.push(p);}
 const head=new THREE.Group();head.position.y=1.43;rig.add(head);
 ball(head,spec.skin,0,0,0,[.48,.46,.405]);for(const sign of [-1,1]){ball(head,spec.skin,sign*.47,-.015,.025,[.105,.13,.085]);ball(head,'#e59978',sign*.505,-.012,.065,[.045,.064,.025]);}
 // Large eyes, distinct eyebrows and a curved grin, facing +Z.
 for(const sign of [-1,1]){const x=sign*.175,sleepy=spec.id==='drip'||spec.id==='noodle';ball(head,'#fff9e9',x,0,.356,[.112,sleepy?.095:.12,.037]);ball(head,'#342d36',x,-.005,.391,[.063,sleepy?.062:.085,.022]);ball(head,'#ffffff',x-.02,.035,.413,[.021,.022,.009]);
  if(spec.id!=='drip'){const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.075,-.005,0),new THREE.Vector3(0,.01,.003),new THREE.Vector3(.075,-.005,0)]);const brow=piece(head,new THREE.TubeGeometry(curve,12,.012,6,false),spec.hair,x,.17,.352);brow.name='FaceBrow';brow.rotation.z=spec.id==='noodle'?-sign*.2:sign*.08;}
  ball(head,'#eaa18a',sign*.28,-.125,.34,[.072,.033,.015]);
  if(spec.id==='squirt')for(let j=0;j<3;j++)ball(head,'#bd754d',sign*(.22+j*.035),-.07-(j%2)*.035,.36,[.011,.011,.006]);
 }
 ball(head,spec.skin,0,-.065,.405,[.058,.047,.05]);
 if(spec.id==='drip'||spec.id==='noodle'){const mouth=new THREE.CatmullRomCurve3([new THREE.Vector3(-.08,-.245,.352),new THREE.Vector3(0,-.235,.366),new THREE.Vector3(.08,-.24,.352)]);piece(head,new THREE.TubeGeometry(mouth,10,.013,5,false),'#804a43',0,0,0);}
 else{const smile=new THREE.CatmullRomCurve3([new THREE.Vector3(-.105,-.19,.362),new THREE.Vector3(0,-.218,.38),new THREE.Vector3(.11,-.18,.362)]);piece(head,new THREE.TubeGeometry(smile,18,.012,8,false),'#824e42',0,0,0);}
 // The hair cap sits behind the face; separate clumps form a readable silhouette.
 ball(head,spec.hair,0,.19,-.095,[.49,.34,.36]);
 if(['goggles','ducky'].includes(spec.id)){
  for(const sign of [-1,1]){if(spec.id==='goggles'){ball(head,spec.hair,sign*.4,.35,-.07,[.22,.23,.22]);for(let i=0;i<5;i++)ball(head,spec.hair,sign*.4+Math.cos(i*1.26)*.14,.35+Math.sin(i*1.26)*.14,-.02,[.105,.1,.1]);}
  else for(let i=0;i<4;i++)ball(head,spec.hair,sign*(.41+.055*i),-.10-.13*i,-.04,[.11-i*.009,.105,.105]);}
 }else if(spec.id==='drip'){for(let i=0;i<6;i++){const bang=ball(head,spec.hair,-.32+i*.125,.31,.30,[.09,.14+(i%2)*.012,.075]);bang.rotation.z=(i-2)*.07;}}
 else{for(let i=0;i<8;i++){const a=i/8*Math.PI*2,spike=piece(head,new THREE.LatheGeometry([new THREE.Vector2(0,-.15),new THREE.Vector2(.08,-.14),new THREE.Vector2(.12,-.08),new THREE.Vector2(.105,.01),new THREE.Vector2(.065,.10),new THREE.Vector2(.025,.16),new THREE.Vector2(0,.18)],20),spec.hair,Math.cos(a)*.31,.31+Math.sin(a)*.1,Math.sin(a)*.22);spike.rotation.z=-Math.cos(a)*.7;}}
 if(spec.id==='bucket'){
  const helmet=new THREE.Group();helmet.name='BucketHelmet';helmet.position.set(0,.43,0);head.add(helmet);
  // A full hollow shell and continuous circular lip clear the hair on every side.
  const profile=[[.55,-.23],[.59,-.23],[.60,-.19],[.51,.22],[.48,.27],[0,.27],[0,.23],[.46,.23],[.55,-.19],[.55,-.23]].map(([r,y])=>new THREE.Vector2(r,y));
  const shell=piece(helmet,new THREE.LatheGeometry(profile,64),'#ffd43b',0,0,0);shell.name='BucketShell';
  const brim=torus(helmet,'#ffba25',0,-.205,0,.575,.035);brim.rotation.x=Math.PI/2;ball(helmet,'#fff0a7',-.13,.02,.557,[.075,.09,.016]);
 }else if(spec.id==='goggles'){
  for(const sign of [-1,1]){const rim=torus(head,'#31c7c7',sign*.19,.31,.32,.16,.035);rim.scale.y=.7;ball(head,'#95e9ed',sign*.19,.31,.31,[.14,.10,.06]);ball(head,'#e3ffff',sign*.19-.035,.34,.37,[.03,.045,.008]);}block(head,'#31c7c7',0,.31,.35,[.12,.06,.06]);
 }else if(spec.id==='noodle'){
  const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.4,.65,-.16),new THREE.Vector3(-.61,1.13,-.16),new THREE.Vector3(-.61,1.9,-.2),new THREE.Vector3(-.45,2.0,-.25),new THREE.Vector3(-.34,1.75,-.25)]);piece(rig,new THREE.TubeGeometry(curve,20,.105,10,false),'#b3e83c',0,0,0);
 }else if(spec.id==='ducky'){
  const ring=torus(rig,'#ffdb38',0,.68,0,.37,.115);ring.rotation.x=Math.PI/2;ball(rig,'#ffdc39',.2,.87,.34,[.15,.18,.14]);ball(rig,'#ff9239',.2,.84,.48,[.12,.055,.08]);ball(rig,'#342d36',.25,.93,.44,[.018,.022,.012]);
 }else if(spec.id==='drip'){
  ball(head,'#ad91dc',0,.32,-.04,[.51,.21,.4]);const brim=ball(head,'#9b7ad0',.15,.25,-.38,[.37,.035,.26]);brim.rotation.z=-.1;block(head,'#79629e',0,.30,.367,[.15,.09,.018]);
 }
 // Chunky retro pump-action toy: oversized tank, long barrel, stock and sliding grip.
 const gun=new THREE.Group();gun.position.set(.10,-.24,.10);arms[0].add(gun);
 block(gun,'#b8e23e',0,.06,.23,[.24,.23,.55]);block(gun,'#7459b5',0,-.07,.10,[.13,.26,.14]);
 block(gun,'#ffa342',0,-.19,.11,[.16,.05,.20]);const guard=torus(gun,'#7459b5',0,-.07,.24,.08,.018);guard.rotation.y=Math.PI/2;
 block(gun,'#b8e23e',0,.06,-.13,[.21,.18,.20]);block(gun,'#7459b5',0,.045,-.25,[.25,.25,.08]);
 const tank=ball(gun,'#48bedb',0,.285,.09,[.18,.15,.30]);ball(gun,'#a4edf3',-.06,.34,.16,[.035,.035,.15]);tube(gun,'#7459b5',0,.43,-.02,.055,.045);
 const barrel=tube(gun,'#f6a13d',0,.08,.61,.07,.37);barrel.rotation.x=Math.PI/2;
 const pump=block(gun,'#7459b5',0,-.035,.49,[.19,.13,.22]);for(let i=0;i<4;i++)block(gun,'#a18ad4',0,-.035,.41+i*.045,[.2,.14,.018]);
 const nozzle=tube(gun,'#ff8b35',0,.08,.82,.10,.08);nozzle.rotation.x=Math.PI/2;const hole=tube(gun,'#306a9a',0,.08,.865,.049,.012);hole.rotation.x=Math.PI/2;
 const muzzle=new THREE.Object3D();muzzle.position.set(0,.08,.88);gun.add(muzzle);let kick=0;
 const body=createCharacterBody(spec);
 if(body){rig.add(body.root);torso.children.slice(0,2).forEach(o=>o.visible=false);legs.forEach(o=>o.visible=false);arms.forEach(o=>o.visible=false);rig.add(gun);gun.position.set(-.18,.65,.10);}
 root.scale.setScalar(.9);
 let stride=0,smoothSpeed=0,airBlend=0;
 return {root,spec,rig,head,arms,legs,muzzle,body,aimAt(point){gun.lookAt(point);},fire(){kick=.055;},update(dt,{speed=0,grounded=true,time=0,preview=false,aiming=false,aimPitch=0}={}){
 const frame=Math.min(Math.max(dt,0),.05),damp=(current,target,rate=14)=>THREE.MathUtils.damp(current,target,rate,frame);
 smoothSpeed=damp(smoothSpeed,speed,10);airBlend=damp(airBlend,grounded?0:1,16);
 const moving=Math.min(1,smoothSpeed/3);stride+=frame*THREE.MathUtils.lerp(9,13,Math.min(1,smoothSpeed/8))*Math.min(1,smoothSpeed/2);
 const swing=Math.sin(stride)*.7*moving,groundBlend=1-airBlend;
 legs[0].rotation.x=damp(legs[0].rotation.x,swing*groundBlend-.45*airBlend);legs[1].rotation.x=damp(legs[1].rotation.x,-swing*groundBlend+.3*airBlend);
 arms[0].rotation.x=damp(arms[0].rotation.x,aiming?-aimPitch:-.08-swing*.16);arms[1].rotation.x=damp(arms[1].rotation.x,aiming?-1:swing*.5-.15*airBlend);kick=damp(kick,0,20);gun.position.z=.10-kick;pump.position.z=.49+kick*1.4;
 rig.position.y=damp(rig.position.y,(Math.abs(Math.sin(stride))*moving*.045+Math.sin(time*2)*.01)*groundBlend+.02*airBlend);
 rig.rotation.z=damp(rig.rotation.z,Math.sin(stride)*moving*.022*groundBlend);head.rotation.z=damp(head.rotation.z,Math.sin(time*1.4)*.02);head.rotation.y=damp(head.rotation.y,preview?Math.sin(time*.7)*.12:0);
 arms[1].rotation.z=damp(arms[1].rotation.z,aiming?-.9:preview?-.18+Math.sin(time*2)*.08:.12);
 if(preview)root.rotation.y=Math.sin(time*.4)*.2-.2;
 if(body){body.update(frame,smoothSpeed,grounded);root.updateMatrixWorld(true);const neck=body.point('Head',rig),hand=body.point('RightHand',rig);if(neck){head.position.copy(neck);head.position.y+=.34;}if(hand){gun.position.copy(hand);gun.position.y+=.04;gun.position.z+=.08-kick;}gun.rotation.x=aiming?-aimPitch:-.05;}
 },dispose(){body?.dispose();root.traverse(n=>{if(n.isMesh)n.geometry.dispose();});materials.forEach(m=>m.dispose());root.removeFromParent();}};
}

// Keep selector models alive while switching; disposing active GPU resources can blank a preview.
export function createPreviewRoster(scene){
 const models=new Map();let active=null;
 return {select(id){let next=models.get(id);if(!next){next=createCharacter(id);models.set(id,next);scene.add(next.root);}for(const model of models.values())model.root.visible=model===next;active=next;return next;},get active(){return active;},dispose(){for(const model of models.values())model.dispose();models.clear();active=null;}};
}
