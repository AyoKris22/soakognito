import assert from 'node:assert/strict';
import {traceWater,WaterTank} from '../dist/water-physics.js';
const from={x:0,y:1.8,z:10},to={x:0,y:1.8,z:-10},target=[{x:0,y:1.8,z:0,r:.58}];
assert.equal(traceWater(from,to,[],target).type,'target');
assert.equal(traceWater(from,to,[{x:0,z:4,w:3,d:.2,bottom:0,top:3}],target).type,'cover','thin fence intercepts fast water');
assert.equal(traceWater({x:4,y:1.8,z:10},{x:4,y:1.8,z:-10},[],target),null,'off-target spray misses');
assert.equal(traceWater({x:0,y:2,z:3},{x:0,y:0,z:3},[]).type,'ground');
assert.equal(traceWater({x:0,y:4,z:0},{x:0,y:2,z:0},[],[],[{x:0,z:0,w:5,d:5,h:3}]).type,'cover','raised floor intercepts water');
const ramp=[{x:0,z:0,w:4,d:10,h:3,ramp:true}];assert.equal(traceWater({x:0,y:4,z:0},{x:0,y:.5,z:0},[],[],ramp).type,'cover');
const tank=new WaterTank();assert.equal(tank.fire(),true);assert.equal(tank.fire(),false,'fire rate is limited');tank.update(.08);assert.equal(tank.fire(),true);for(let i=0;i<98;i++){tank.update(.08);assert.equal(tank.fire(),true);}tank.update(.08);assert.equal(tank.fire(),false,'empty tank does not shoot');tank.refill();assert.equal(tank.fire(),false);tank.update(1.2);assert.equal(tank.water,100);assert.equal(tank.fire(),true);
console.log('Passed: water target hits, misses, cover and terrain interception, fire rate, empty tank, and refill.');
// Off-centre muzzle positions must converge on the camera's aimed point at every range.
const {straightWaterVelocity}=await import('../dist/water-physics.js');
for(const range of [4,12,30,55])for(const muzzle of [{x:-.4,y:1.1,z:0},{x:.2,y:1.8,z:.5}]){
 const aim={x:.65,y:2.1,z:-range},v=straightWaterVelocity(muzzle,aim),time=Math.hypot(aim.x-muzzle.x,aim.y-muzzle.y,aim.z-muzzle.z)/30;
 const endpoint={x:muzzle.x+v.x*time,y:muzzle.y+v.y*time,z:muzzle.z+v.z*time};
 assert.ok(Math.hypot(endpoint.x-aim.x,endpoint.y-aim.y,endpoint.z-aim.z)<1e-7,'straight spray reaches aimed point');
 assert.equal(traceWater(muzzle,endpoint,[],[{...aim,r:.2}]).type,'target','crosshair target is hit');
}
console.log('Passed: crosshair convergence from offset muzzles at close and long ranges.');
