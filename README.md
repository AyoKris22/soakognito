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

Click **Choose your character** to preview Bucket, Goggles, Noodle, Squirt, Ducky, and Drip. Each original geometry-based model has distinct hair, clothes, and accessories, with idle, walk, run, and jump poses. Your selection is remembered on this device. All characters share the same movement and collision size; their accessories are cosmetic. The chase camera pulls in near solid cover.

Click **Explore as [name]** or **Explore on foot** after the models load. Desktop: WASD or up/down arrows to move, drag the scene or use left/right arrows to look, Shift to sprint, Space to jump, Escape to return to overview. Touch: left joystick to move, drag the scene to look, Sprint toggle and Jump buttons. Return to entrance resets your position.

Combat, multiplayer, water refill behavior, and scoring are not implemented in this version. Character water blasters are decorative until combat is added. Refill kiosks are currently landmarks. Bushes and small camp dressing do not block movement.

## Development

The prebuilt `dist/` is ready to deploy. To rebuild: `npm ci`, `npm run build`. Run `npm test` for character rig, animation, movement, collision, and camera checks and `npm run check` for source syntax checks. Serve locally with `python3 -m http.server 8000 --directory dist`, then open localhost:8000. The 3D view requires WebGL; opening index.html via file:// will not load models.

## Cloudflare Workers

The linked Worker is `soakognito`. `wrangler.jsonc` serves `./dist` as static assets. Deployment command: `npx wrangler deploy`, root: `/`. The committed bundle means a build command is optional. Changes pushed to main trigger deployment when Cloudflare's Git connection is enabled.

## Assets

Kenney Platformer Kit 4.1, Mini Forest 1.0, and Survival Kit 2.0: CC0. Original licenses are in each `dist/assets/` pack folder. Three.js is bundled with its MIT license in `dist/vendor/`. Local static files include models and textures. Optional Google Fonts have system-font fallbacks.
