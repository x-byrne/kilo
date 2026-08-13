# Deploying to GitHub Pages

## Overview

ABSVis Framework is a static vanilla-JS site with no build step. Deployment to GitHub Pages copies the web assets into the `docs/` folder, which GitHub Pages serves directly from the `main` branch.

**Live URL:** `https://x-byrne.github.io/kilo/`

## Prerequisites

- Repository must be public (or GitHub Pro/Team for private repos with Pages)
- GitHub Pages must be enabled in repo Settings → Pages

## One-time Setup

1. Go to **Settings → Pages** in the GitHub repository
2. Under **Build and deployment → Source**, select **Deploy from a branch**
3. Under **Branch**, select `main` and folder `/docs`
4. Click **Save**

GitHub will now serve the contents of the `docs/` folder at `https://x-byrne.github.io/kilo/`.

## Automated Deployment (CI/CD)

A GitHub Actions workflow is included at `.github/workflows/deploy-gh-pages.yml`. It automatically deploys on every push to `main`.

If you prefer manual deployment, skip this section and use the manual steps below.

## Manual Deployment

Run the deploy script to copy the site assets into `docs/`:

```bash
npm run deploy
```

This script:
1. Copies `index.html`, `datasets.json`, `src/`, and `data/` into `docs/`
2. Removes old markdown docs from `docs/` to avoid serving them as pages
3. Prints the next steps

After running, commit and push:

```bash
git add docs/
git commit -m "deploy: update GitHub Pages"
git push
```

## Local Testing

Serve the `docs/` folder locally to verify the deployment before pushing:

```bash
npx serve docs
```

## How It Works

- GitHub Pages serves the `docs/` folder as the site root for project sites (`username.github.io/repo-name`)
- ES modules (`type="module"`) are supported natively in modern browsers
- Data files are loaded from the jsDelivr CDN (`cdn.jsdelivr.net/gh/x-byrne/kilo@main/data/...`) — they do not need to be in `docs/` for the site to function
- External CDN dependencies (Chart.js, Google Fonts) are loaded from their respective CDNs

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 404 on refresh | GitHub Pages project sites handle this automatically; ensure SPA routes are not used |
| ES module errors | Ensure `type="module"` is present on the script tag in `index.html` |
| Data not loading | Verify the `data/` folder exists on the `main` branch (required for jsDelivr CDN) |
| Stale CDN cache | jsDelivr caches aggressively; the existing workflow includes a CDN purge step for data updates |
