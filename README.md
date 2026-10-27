# Soakognito

Splashwood Park is the first environment for a goofy secret-target water-fight game.

This initial version is an interactive **map preview**, not a multiplayer game. Drag to orbit, zoom, and select landmark views. Water guns, character selection, player movement, collision, crowd AI, and multiplayer are not implemented yet. The blaster and mini-character packs have not been supplied.

## Map

90-metre circular arena, outer loop, four inward routes, central splash fountain, four lookout structures, camp corners, forest cover, and refill-station placeholders. Terrain/platform pieces come from Kenney Platformer Kit; trees, structures, bridges, and props come from Mini Forest. Raised structures and bridges are visual layouts pending traversal/collision work.

## Run

The prebuilt dist/ is ready to serve. To rebuild after editing dist/map.js, run `npm ci` then `npm run build`.

Serve the `dist/` directory with a static HTTP server, such as `python3 -m http.server 8000 --directory dist`. Open localhost:8000. Opening index.html as file:// will not work because models use fetch.

## Cloudflare Pages with GitHub

Push this folder's contents to a new GitHub repository. In Cloudflare Workers & Pages, create a Pages project and connect the repository. Framework: None. No build command. Output directory: `dist`. This is a static site; no credentials, database, or paid services are required for this preview. Git integration deploys future commits. Account authorization must be completed by the account owner where requested.

## Assets

Kenney Platformer Kit 4.1 and Mini Forest 1.0, CC0; original license files are preserved under dist/assets/. Three.js is bundled locally, with its MIT license in dist/vendor/. Fonts are optional Google Fonts; system fallbacks work without them. All 3D assets and JavaScript are served locally.
