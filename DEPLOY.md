# GitHub Pages deployment

This project is configured for the repository site:

https://zhnosql.github.io/english-website/

The Vite base path is `/english-website/`, and the dialogue recording is stored at `public/dialogue.mp3`.

The GitHub Actions workflow in `.github/workflows/deploy.yml` builds the site from source and publishes `dist/`. Do not commit an old `dist/` directory as the deployed copy.

After pushing to `main`, enable GitHub Pages with **Settings → Pages → Source: GitHub Actions** if it is not already enabled.
