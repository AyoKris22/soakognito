import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
let template=null;
export async function loadCharacterBody(bytes){const loader=new GLTFLoader();template=bytes?await loader.parseAsync(bytes,''):await loader.loadAsync('./assets/characters/crew-body.glb');for(const clip of template.animations)for(const track of clip.tracks)if(track.name==='Root.position')track.values.fill(0);return template;}
export function createCharacterBody(spec){
 if(!template)return null;const root=new THREE.Group(),model=clone(template.scene);root.add(model);root.scale.set(.92,.68,.9);
 const materials=new Set();model.traverse(o=>{if(!o.isMesh)return;o.geometry=o.geometry.clone();const original=Array.isArray(o.material)?o.material:[o.material];const copies=original.map(m=>{const n=m.clone(),name=m.name;const color=name.includes('Skin')?spec.skin:name.includes('Shirt')?spec.shirt:name.includes('Shorts')?spec.shorts:spec.shoes;n.color.set(color);n.roughness=.65;materials.add(n);return n;});o.material=Array.isArray(o.material)?copies:copies[0];o.castShadow=true;o.receiveShadow=true;});
 const bones={};model.traverse(o=>{if(o.isBone)bones[o.name]=o;});
 const mixer=new THREE.AnimationMixer(model),actions={};
 for(const clip of template.animations){const name=clip.name.includes('Idle')?'idle':clip.name.includes('Walk')?'walk':clip.name.includes('Run')?'run':clip.name.includes('Jump')?'jump':null;if(name){const action=mixer.clipAction(clip);action.play();action.setEffectiveWeight(name==='idle'?1:0);actions[name]=action;}}
 mixer.update(0);
 const point=new THREE.Vector3();
 return {root,model,bones,actions,point(name,parent){const bone=bones[name];if(!bone)return null;bone.getWorldPosition(point);return parent.worldToLocal(point.clone());},update(dt,speed,grounded){const move=Math.min(1,speed/2),run=THREE.MathUtils.clamp((speed-5)/3,0,1);const weights={idle:grounded?1-move:0,walk:grounded?move*(1-run):0,run:grounded?move*run:0,jump:grounded?0:1};for(const [name,action] of Object.entries(actions)){action.setEffectiveWeight(THREE.MathUtils.damp(action.getEffectiveWeight(),weights[name],12,dt));if(name==='walk')action.setEffectiveTimeScale(.8+speed/8);if(name==='run')action.setEffectiveTimeScale(.85+speed/18);}mixer.update(dt);},dispose(){mixer.stopAllAction();mixer.uncacheRoot(model);materials.forEach(m=>m.dispose());}};
}
