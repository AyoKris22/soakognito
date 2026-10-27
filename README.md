# Soakognito

A goofy water-fight arena in a circular woodland playground. The intended game mode is free-for-all with extra points for soaking an assigned target.

## Current version: character crew and arena exploration

Choose an original chibi character and explore Splashwood Park with a third-person camera, or inspect it from the map overview. This update combines Kenney's Survival Kit with Mini Forest and Platformer Kit.

- Splash plaza with fountain and cover islands
- Camp Splash: tents, a wooden shelter, workbench, and camping props
- Crate Yard: crates, barrels, fences, and multiple approaches
- Autumn Grove and Rocky Run: trees, rocks, and logs that break up long sightlines
- Two raised lookouts joined by a walkable bridge, with two approach ramps and an underpass
- Circular perimeter route, cross-map paths, and blue refill landmarks
- On-foot movement with solid-prop collision, sprint, jump, and map boundary

Click **Choose your character** to preview Bucket, Goggles, Noodle, Squirt, Ducky, and Drip. Original chibi heads and accessories are combined with the rigged body, shirt, shorts, shoes, and movement clips from the supplied Creative_Character_free.blend. Colors are customized for each character, with blended idle, walk, run, and jump animations. Imported root motion is removed so the visible body stays aligned with game physics. Your selection is remembered on this device. All characters share the same movement and collision size; their accessories are cosmetic. The over-the-shoulder camera pulls in near solid cover. Desktop practice captures the mouse for free look; Escape releases it and returns to the map. If capture is unavailable, hovering the mouse over the game still rotates the view without holding a button.

Click **Explore as [name]** or **Explore on foot** after the models load. Desktop: WASD or up/down arrows to move, free mouse-look (click to capture if needed), hold left mouse to spray, R to refill, Shift to sprint, Space to jump, Escape to return to overview. Touch: left joystick to move, drag the scene to look, hold SPRAY to shoot, Refill button, Sprint toggle and Jump buttons. Return to entrance resets your position.

Water spray practice is implemented with a refillable tank, splash effects, cover interception, and three practice targets near the entrance. Straight water shots travel from the muzzle to the point under the precisely centered crosshair; the barrel turns toward that same point, with no projectile drop. Blue kiosks refill the tank when approached. Practice hits are a local test counter. Multiplayer, player damage, and free-for-all scoring are not implemented yet. Bushes and small camp dressing do not block movement.

## Development

The prebuilt `dist/` is ready to deploy. To rebuild: `npm ci`, `npm run build`. Run `npm test` for character rig, animation, movement, collision, and camera, preview-switching, and water-physics checks and `npm run check` for source syntax checks. Serve locally with `python3 -m http.server 8000 --directory dist`, then open localhost:8000. The 3D view requires WebGL; opening index.html via file:// will not load models.

## Cloudflare Workers

The linked Worker is `soakognito`. `wrangler.jsonc` serves `./dist` as static assets. Deployment command: `npx wrangler deploy`, root: `/`. The committed bundle means a build command is optional. Changes pushed to main trigger deployment when Cloudflare's Git connection is enabled.

## Assets

Character body source: user-supplied `Creative_Character_free.blend`, adapted to `dist/assets/characters/crew-body.glb`. Chibi heads, signature accessories, and retro pump blasters are custom geometry.

Kenney Platformer Kit 4.1, Mini Forest 1.0, and Survival Kit 2.0: CC0. Original licenses are in each `dist/assets/` pack folder. Three.js is bundled with its MIT license in `dist/vendor/`. Local static files include models and textures. Optional Google Fonts have system-font fallbacks.
