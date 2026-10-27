import assert from 'node:assert/strict';
import {groundAt,stepPlayer,canOccupy,ARENA_RADIUS,PLAYER_RADIUS} from '../dist/arena-physics.js';
const make=(x,z)=>({x,z,y:groundAt(x,z,.3),vy:0,grounded:true});
// Sprinting must not tunnel through a narrow fence.
const fence=[{type:'box',x:0,z:0,w:5,d:.2,top:2,bottom:0}];let p=make(0,2);stepPlayer(p,0,-5,.04,fence);assert.ok(p.z>=.5,'fence blocks high-speed motion');
// Raised lookouts can be reached from either ground-level ramp.
for(const x of [-17,17]){p=make(x,4);for(let i=0;i<190;i++)stepPlayer(p,0,-.1,.02,[]);assert.ok(Math.abs(p.y-3.28)<.02,'ramp joins lookout');assert.ok(p.z<-14);}
// The bridge is a floor above and an open passage below.
p=make(0,-10);for(let i=0;i<100;i++)stepPlayer(p,0,-.1,.02,[]);assert.ok(p.z<-19.9&&p.y<.3,'bridge underpass stays open');
p={x:0,z:-15,y:3.28,vy:0,grounded:true};stepPlayer(p,.1,0,.02,[]);assert.ok(Math.abs(p.y-3.28)<.001,'bridge supports feet');
// Jumping beneath the bridge stops at its underside, never teleports above it.
p=make(0,-15);p.vy=7;p.grounded=false;let max=0;for(let i=0;i<70;i++){stepPlayer(p,0,0,.016,[]);max=Math.max(max,p.y);}assert.ok(max<1.26);assert.ok(Math.abs(p.y-.28)<.02);
// A jump lands and the circular boundary cannot be crossed.
p=make(0,25);p.vy=7;p.grounded=false;for(let i=0;i<140;i++)stepPlayer(p,0,0,.016,[]);assert.ok(p.grounded&&Math.abs(p.y-.28)<.001);
p=make(0,38);stepPlayer(p,0,10,.04,[]);assert.ok(Math.hypot(p.x,p.z)<=ARENA_RADIUS-PLAYER_RADIUS);
assert.equal(canOccupy(0,0,.28,[{type:'circle',x:0,z:0,r:3,top:3,bottom:0}]),false);
console.log('Passed: sprint collision, both ramps, bridge deck and underpass, ceiling, jump landing, boundary, fountain collision.');
