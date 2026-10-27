# Soakognito

A goofy water-fight arena in a circular woodland playground. The intended game mode is free-for-all with extra points for soaking an assigned target.

## Current version: arena exploration

Explore Splashwood Park on foot or inspect it from the map overview. This update combines Kenney's Survival Kit with Mini Forest and Platformer Kit.

- Splash plaza with fountain and cover islands
- Camp Splash: tents, a wooden shelter, workbench, and camping props
- Crate Yard: crates, barrels, fences, and multiple approaches
- Autumn Grove and Rocky Run: trees, rocks, and logs that break up long sightlines
- Two raised lookouts joined by a walkable bridge, with two approach ramps and an underpass
- Circular perimeter route, cross-map paths, and blue refill landmarks
- On-foot movement with solid-prop collision, sprint, jump, and map boundary

Click **Explore on foot** after the models load. Desktop: WASD or up/down arrows to move, drag the scene or use left/right arrows to look, Shift to sprint, Space to jump, Escape to return to overview. Touch: left joystick to move, drag the scene to look, Sprint toggle and Jump buttons. Return to entrance resets your position.

Combat, multiplayer, water refill behavior, scoring, and character selection are not implemented in this version. The requested blaster and mini-character packs have not been supplied. Refill kiosks are currently landmarks. Bushes and small camp dressing do not block movement.

## Development

The prebuilt `dist/` is ready to deploy. To rebuild: `npm ci`, `npm run build`. Run `npm test` for movement/collision checks and `npm run check` for source syntax checks. Serve locally with `python3 -m http.server 8000 --directory dist`, then open localhost:8000. The 3D view requires WebGL; opening index.html via file:// will not load models.

## Cloudflare Workers

The linked Worker is `soakognito`. `wrangler.jsonc` serves `./dist` as static assets. Deployment command: `npx wrangler deploy`, root: `/`. The committed bundle means a build command is optional. Changes pushed to main trigger deployment when Cloudflare's Git connection is enabled.

## Assets

Kenney Platformer Kit 4.1, Mini Forest 1.0, and Survival Kit 2.0: CC0. Original licenses are in each `dist/assets/` pack folder. Three.js is bundled with its MIT license in `dist/vendor/`. Local static files include models and textures. Optional Google Fonts have system-font fallbacks.
