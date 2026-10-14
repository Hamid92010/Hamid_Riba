# Hamid Riba — Portfolio

New professional portfolio for **Game Developer** and **XR Developer**, built with plain HTML, CSS and JavaScript for **GitHub Pages**.

## Included

- `index.html` — home page with illustration, profile, text, contact links and buttons.
- `game-developer.html` — separate Game Developer page (opens in new tab).
- `xr-developer.html` — separate XR Developer page (opens in new tab).
- `styles.css` — desktop and mobile design, neon styles and background.
- `script.js` — energy particles emerging from the illustrated portal; no GIF or video required.
- `assets/` — original PNG images supplied for the portfolio.

## Publishing on GitHub Pages

1. Create a **public** GitHub repository named `HamidRiba-v2`.
2. Download and extract the provided ZIP locally.
3. Place **all the extracted files and the `assets` folder** in the repository root. An easy way is to use GitHub Desktop: Clone repository → copy the files into the local folder → Commit → Push origin.
4. On GitHub, open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
5. The URL should be `https://hamid92010.github.io/HamidRiba-v2/` after GitHub Pages deploys. If you use a different repository name, the URL changes too.

To test the files locally, open `index.html` in a browser. The background and particles work without any build step.

## Contacts

- LinkedIn: `https://www.linkedin.com/in/hamid-riba-developer/`
- Email: `hamidriba@hotmail.com` (change the `mailto:` link, `aria-label` and tooltip text in `index.html` if you prefer another address).

## Design notes

- The background image stays a normal PNG. The moving stars/sparks are painted using the HTML Canvas API by `script.js`.
- The portal location in `script.js` is adjusted to match the background crop at desktop and mobile widths. Change `portalX` and `portalY` if you later change the background illustration.
- Animations automatically pause if the viewer prefers reduced motion or switches tabs.
- Both specialty buttons open their sections in a new browser tab (`target="_blank"`).
- Later, replace the starter content of both specialty sections with full project pages and media.
