// Shared, renderer-independent arena movement. Units are metres.
export const ARENA_RADIUS=39.5;
export const PLAYER_RADIUS=.42;
export const surfaces=[
 {x:-17,z:-15,w:9,d:8,h:3},
 {x:17,z:-15,w:9,d:8,h:3},
 {x:0,z:-15,w:25,d:3,h:3},
 {x:-17,z:-4,w:3.5,d:14,h:3,ramp:true},
 {x:17,z:-4,w:3.5,d:14,h:3,ramp:true}
];
export function groundAt(x,z,maxHeight=Infinity){let h=.28;for(const s of surfaces){if(Math.abs(x-s.x)<=s.w/2&&Math.abs(z-s.z)<=s.d/2){const top=s.ramp?s.h*Math.max(0,Math.min(1,(s.z+s.d/2-z)/s.d))+.28:s.h+.28;if(top<=maxHeight)h=Math.max(h,top);}}return h;}
export function canOccupy(x,z,feet,solids,radius=PLAYER_RADIUS){if(Math.hypot(x,z)>ARENA_RADIUS-radius)return false;for(const s of solids){if(feet>=s.top-.08||feet+1.65<s.bottom)continue;if(s.type==='circle'){if(Math.hypot(x-s.x,z-s.z)<s.r+radius)return false;}else{const dx=x-s.x,dz=z-s.z,c=Math.cos(s.rot||0),q=Math.sin(s.rot||0);const lx=dx*c-dz*q,lz=dx*q+dz*c;if(Math.abs(lx)<s.w/2+radius&&Math.abs(lz)<s.d/2+radius)return false;}}return true;}
export function supportAt(x,z,maxHeight,solids){
 let h=groundAt(x,z,maxHeight);
 for(const s of solids){if(s.top>maxHeight)continue;let inside;if(s.type==='circle')inside=Math.hypot(x-s.x,z-s.z)<=s.r+PLAYER_RADIUS*.5;else{const dx=x-s.x,dz=z-s.z,c=Math.cos(s.rot||0),q=Math.sin(s.rot||0);inside=Math.abs(dx*c-dz*q)<=s.w/2+PLAYER_RADIUS*.5&&Math.abs(dx*q+dz*c)<=s.d/2+PLAYER_RADIUS*.5;}if(inside)h=Math.max(h,s.top);}
 return h;
}
export function stepPlayer(player,dx,dz,dt,solids){
 const distance=Math.hypot(dx,dz),steps=Math.max(1,Math.ceil(distance/.12));
 for(let i=0;i<steps;i++){
  for(const axis of ['x','z']){const amount=(axis==='x'?dx:dz)/steps;if(!amount)continue;const nx=player.x+(axis==='x'?amount:0),nz=player.z+(axis==='z'?amount:0),ground=supportAt(nx,nz,player.y+.35,solids);const blockedRamp=surfaces.some(s=>s.ramp&&Math.abs(nx-s.x)<=s.w/2&&Math.abs(nz-s.z)<=s.d/2&&groundAt(nx,nz)>player.y+.35);if(!blockedRamp&&canOccupy(nx,nz,Math.max(player.y,ground),solids)){player.x=nx;player.z=nz;if(player.grounded&&ground>=player.y-.35)player.y=ground;}}
 }
 const oldY=player.y;player.vy-=19*dt;player.y+=player.vy*dt;for(const s of surfaces){if(s.ramp||Math.abs(player.x-s.x)>s.w/2||Math.abs(player.z-s.z)>s.d/2)continue;const underside=s.h+.28-.38;if(oldY+1.65<=underside&&player.y+1.65>underside){player.y=underside-1.65;player.vy=0;}}const floor=supportAt(player.x,player.z,Math.max(oldY,player.y)+.35,solids);if(player.y<=floor){player.y=floor;player.vy=0;player.grounded=true;}else player.grounded=false;
 return player;
}
