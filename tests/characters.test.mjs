import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {loadCharacterBody} from '../dist/character-body.js';
const bodyBytes=await readFile(new URL('../dist/assets/characters/crew-body.glb',import.meta.url));
await loadCharacterBody(bodyBytes.buffer.slice(bodyBytes.byteOffset,bodyBytes.byteOffset+bodyBytes.byteLength));
import * as THREE from 'three';
import {CHARACTER_ROSTER,createCharacter,createPreviewRoster} from '../dist/characters.js';
import {cameraDistance} from '../dist/arena-physics.js';
assert.equal(new Set(CHARACTER_ROSTER.map(c=>c.id)).size,6);
for(const spec of CHARACTER_ROSTER){
 const c=createCharacter(spec.id);assert.ok(c.body,'supplied body is attached');assert.equal(Object.keys(c.body.actions).length,4,'idle/walk/run/jump clips');let meshCount=0;c.root.traverse(n=>{if(n.isMesh){meshCount++;assert.ok(n.geometry.attributes.position.count>0);}});assert.ok(meshCount>35);
 const box=new THREE.Box3().setFromObject(c.root);const size=box.getSize(new THREE.Vector3());assert.ok(size.y>1.6&&size.y<2.2,`${spec.id} height ${size.y}`);assert.ok(box.min.y>-.06,`${spec.id} below ground`);
 for(const state of [{speed:0,grounded:true,preview:true},{speed:4.8,grounded:true},{speed:8,grounded:true},{speed:4,grounded:false}]){for(let i=0;i<60;i++)c.update(.016,{...state,time:i*.016});c.root.updateMatrixWorld(true);c.root.traverse(n=>assert.ok(n.matrixWorld.elements.every(Number.isFinite),'finite animated transforms'));}
 c.dispose();assert.equal(c.root.parent,null);
}
assert.equal(cameraDistance({x:0,y:1.4,z:25},{x:0,y:.3,z:.954},5.4,[]),5.4);
const wall=[{type:'box',x:0,z:3,w:4,d:.3,bottom:0,top:4}];
assert.ok(cameraDistance({x:0,y:1.4,z:0},{x:0,y:0,z:1},5.4,wall)<2.8,'chase camera stops before cover');
assert.ok(cameraDistance({x:0,y:1.4,z:-15},{x:0,y:1,z:0},5.4,[])<1.5,'chase camera stops beneath bridge');
console.log('Passed: six distinct character rigs, body bounds, idle/walk/run/jump transforms, disposal, camera cover and bridge clipping.');

// Changing from a run to a jump or idle should blend rather than snap joints.
const blend=createCharacter('bucket');for(let i=0;i<45;i++)blend.update(.016,{speed:8,grounded:true,time:i*.016});
let before=blend.legs.map(p=>p.rotation.x);blend.update(.016,{speed:0,grounded:false,time:.736});
blend.legs.forEach((p,i)=>assert.ok(Math.abs(p.rotation.x-before[i])<.25,'jump transition blends'));
for(let i=0;i<120;i++)blend.update(.016,{speed:0,grounded:true,time:1+i*.016});
blend.legs.forEach(p=>assert.ok(Math.abs(p.rotation.x)<.01,'legs settle into idle'));blend.dispose();
console.log('Passed: blended run/jump transitions and idle settling.');

// Switching roster names never removes the active preview from its scene.
const stage=new THREE.Scene(),previews=createPreviewRoster(stage);
for(let round=0;round<4;round++)for(const spec of CHARACTER_ROSTER){const active=previews.select(spec.id);assert.equal(active.root.parent,stage);assert.equal(active.root.visible,true);assert.equal(stage.children.filter(c=>c.visible).length,1);active.root.updateMatrixWorld(true);const muzzle=new THREE.Vector3();active.muzzle.getWorldPosition(muzzle);assert.ok([muzzle.x,muzzle.y,muzzle.z].every(Number.isFinite));}
assert.equal(stage.children.length,6);previews.dispose();assert.equal(stage.children.length,0);
console.log('Passed: repeated preview switching and blaster muzzle transforms.');

// Imported locomotion must stay in place; physics owns world movement.
const inPlace=createCharacter('goggles');for(let i=0;i<240;i++){inPlace.update(.016,{speed:8,grounded:true,time:i*.016});inPlace.root.updateMatrixWorld(true);const headPoint=inPlace.body.point('Head',inPlace.rig);assert.ok(Math.abs(headPoint.z)<.55,'root motion is removed');}inPlace.dispose();
console.log('Passed: imported locomotion stays aligned with the physics capsule.');
// Fringe-covered faces have no eyebrows on top of the hair; Bucket clears the entire crown.
const fringe=createCharacter('drip');let brows=0;fringe.root.traverse(o=>{if(o.name==='FaceBrow')brows++;});assert.equal(brows,0);fringe.dispose();
const helmetCharacter=createCharacter('bucket'),helmet=helmetCharacter.root.getObjectByName('BucketHelmet'),shell=helmetCharacter.root.getObjectByName('BucketShell');assert.ok(helmet&&shell);assert.equal(helmet.rotation.z,0);
const opening=shell.geometry.attributes.position;let count=0;for(let i=0;i<opening.count;i++){if(opening.getY(i)<-.19){assert.ok(Math.hypot(opening.getX(i),opening.getZ(i))>.53,'helmet opening clears hair all around');count++;}}assert.ok(count>100);assert.ok([...shell.geometry.attributes.normal.array].every(Number.isFinite));helmetCharacter.dispose();
console.log('Passed: fringe eyebrow clearance and full-circumference bucket opening.');
