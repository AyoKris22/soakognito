import assert from 'node:assert/strict';
import * as THREE from 'three';
import {CHARACTER_ROSTER,createCharacter} from '../dist/characters.js';
import {cameraDistance} from '../dist/arena-physics.js';
assert.equal(new Set(CHARACTER_ROSTER.map(c=>c.id)).size,6);
for(const spec of CHARACTER_ROSTER){
 const c=createCharacter(spec.id);let meshCount=0;c.root.traverse(n=>{if(n.isMesh){meshCount++;assert.ok(n.geometry.attributes.position.count>0);}});assert.ok(meshCount>35);
 const box=new THREE.Box3().setFromObject(c.root);const size=box.getSize(new THREE.Vector3());assert.ok(size.y>1.6&&size.y<2.2,`${spec.id} height ${size.y}`);assert.ok(box.min.y>-.06,`${spec.id} below ground`);
 for(const state of [{speed:0,grounded:true,preview:true},{speed:4.8,grounded:true},{speed:8,grounded:true},{speed:4,grounded:false}]){for(let i=0;i<60;i++)c.update(.016,{...state,time:i*.016});c.root.updateMatrixWorld(true);c.root.traverse(n=>assert.ok(n.matrixWorld.elements.every(Number.isFinite),'finite animated transforms'));}
 c.dispose();assert.equal(c.root.parent,null);
}
assert.equal(cameraDistance({x:0,y:1.4,z:25},{x:0,y:.3,z:.954},5.4,[]),5.4);
const wall=[{type:'box',x:0,z:3,w:4,d:.3,bottom:0,top:4}];
assert.ok(cameraDistance({x:0,y:1.4,z:0},{x:0,y:0,z:1},5.4,wall)<2.8,'chase camera stops before cover');
assert.ok(cameraDistance({x:0,y:1.4,z:-15},{x:0,y:1,z:0},5.4,[])<1.5,'chase camera stops beneath bridge');
console.log('Passed: six distinct character rigs, body bounds, idle/walk/run/jump transforms, disposal, camera cover and bridge clipping.');
