# Meridian (auto-app)

A simple, static **workplace hub** web app meant as a **system under test (SUT)** for demos and learning.

Use it to build or showcase a UI test framework — **Playwright, Selenium, WebdriverIO, Cypress**, or anything else that drives a browser. The app is tool-agnostic; only the tests you write are framework-specific.

No build step. Serve `public/` locally, or copy it into your automation repo (often as `app/`).

## Quick start

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000).

Point your test base URL at that origin (or wherever you host `public/`).

## Demo accounts

| Role | Email | Password | Can approve / invite / delete / drag kanban |
|------|-------|----------|-----------------------------------------------|
| Admin | `alex@northline.co` | `meridian123` | Yes |
| Viewer | `viewer@northline.co` | `viewer123` | No (read-only for those actions) |

## Pages

| Route | Purpose |
|-------|---------|
| `/` / `index.html` | Sign in |
| `/home.html` | Dashboard, charts, activity feed |
| `/people.html` | Directory table, combobox search, invite |
| `/person.html?id=1` | Person profile + messages |
| `/requests.html` | New request, list, kanban board, calendar |
| `/request.html?id=REQ-1048` | Request detail (approve / reject / cancel) |
| `/files.html` | Upload, library, preview |
| `/reports.html` | Nested iframe report |
| `/settings.html` | Profile, theme, preferences, policy iframe |

## UI coverage for demos

Common automation surfaces:

- Forms, dropdowns, radios, checkboxes, date range (Leave)
- Tables (sort, filter, pagination, row select)
- Tooltips, toast queue + Undo
- Charts (bar + donut) with stable `data-testid`s
- Autocomplete combobox
- Kanban drag-and-drop
- Context menus (right-click)
- Shadow DOM status badge (`<meridian-status-badge>`)
- Nested iframe (Reports)
- File upload + preview modal
- Skeleton loaders
- Dark / light / system theme
- Role-based UI (admin vs viewer)

Prefer selectors like `[data-testid="login-button"]` so frameworks stay interchangeable.

## Persistence

Uses browser storage:

- **Session / remember-me** — auth (`sessionStorage` / `localStorage`)
- **Requests, files, settings, messages** — `localStorage`

Clear site data or call `Meridian.reset()` to restore defaults. Useful for deterministic demo tests.

## Test helpers (`window.Meridian`)

Available in the page after scripts load. Call from any framework via “execute script in browser”:

```js
Meridian.reset()
Meridian.seed({ requests: [], files: [] })
Meridian.applyPreset('manyPending')
Meridian.getState()
Meridian.logout()
Meridian.canApprove()
```

### URL shortcuts

| Query | Effect |
|-------|--------|
| `?reset=1` | Reset data to defaults |
| `?dev=1` | Enable Dev panel (persists until hidden) |
| `?dev=0` | Disable Dev panel |
| `?preset=clean` | Apply a named preset |

Example: `http://localhost:3000/home.html?reset=1&dev=1`

### Seed presets (Dev panel)

With `?dev=1`, use the floating **Dev** button (handy while designing tests by hand):

| Preset | What it does |
|--------|----------------|
| `clean` | Full reset to defaults |
| `emptyRequests` | No requests |
| `manyPending` | 20 pending/submitted requests |
| `leaveThisMonth` | Leave spanning mid-current-month |
| `emptyFiles` | Clear file library |
| `darkTheme` | Force dark theme in settings |

### Using helpers from your framework

**Playwright**

```ts
await page.goto('/home.html?reset=1')
await page.evaluate(() => Meridian.applyPreset('manyPending'))
```

**Selenium (JavaScript)**

```js
await driver.get('http://localhost:3000/home.html?reset=1')
await driver.executeScript('Meridian.applyPreset("manyPending")')
```

**WebdriverIO**

```ts
await browser.url('/home.html?reset=1')
await browser.execute(() => Meridian.applyPreset('manyPending'))
```

Same idea in Java/Python/C#: navigate, then run JS that calls `Meridian.*`.

## Using this in a demo framework repo

Typical layout:

```text
your-demo-framework/
  app/                 ← copy of this repo’s public/ (SUT)
  tests/ or test/      ← Playwright / Selenium / WDIO / etc.
```

Serve `app/` with your tool’s static server, `npx serve`, or any static host. Keep Meridian as the product under test; keep framework code separate.

## Project layout

```
public/
  index.html          # login
  home.html
  people.html / person.html
  requests.html / request.html
  files.html
  reports.html / report-frame.html
  settings.html / policy.html
  css/styles.css
  js/
    store.js          # data, auth, seed/reset/presets
    shell.js          # sidebar/topbar, theme, roles, dev panel
    widgets.js        # tooltips, charts, combobox, toasts, …
    app.js            # page controllers
package.json
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` / `npm run serve` | Serve `public/` on port **3000** |

## Notes

- Zero app dependencies to install (`npx serve` only for local hosting).
- Not a production product — a realistic-enough UI for teaching and demonstrating test frameworks.
