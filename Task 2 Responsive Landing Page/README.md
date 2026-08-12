# Launch Flow

**Plan better. Build faster. Launch smarter.**

## Overview

LaunchFlow is a semantic, mobile-responsive SaaS marketing landing page with a
frontend product demo (simulated authentication, account dashboard, pricing
state and a demo payment flow). It is built with hand-written HTML5, CSS3 and
vanilla JavaScript — no frameworks, no build step, no backend.

**Main entry point: `index.html`**

## Features

- Sticky header with scroll-spy navigation and an accessible mobile drawer
- Hero, feature grid, interactive product tabs, LaunchFlow Intelligence demo,
  bento grid, how-it-works, integrations, stats counters, testimonial carousel,
  pricing, FAQ accordion and a full footer
- Light/dark theme with the preference stored in `localStorage`
- Scroll reveal animations and animated counters via `IntersectionObserver`
- Accessible modals with focus trapping and Escape-to-close
- Authenticated dashboard: KPIs, projects, activity, productivity chart,
  intelligence insight and quick actions

## Authentication

Authentication is **simulated entirely in the browser** with `localStorage` —
there is no server, no database and no network request.

- Sign up with Full Name, Email, Password and Confirm Password
- Duplicate emails are rejected; passwords need 8+ characters with a letter and a number
- Successful signup authenticates immediately and shows *Welcome back, {First name}.*
- Sign in validates the stored credentials and shows an inline error
  (*The email or password you entered is incorrect.*) on failure — never `alert()`
- The session, name, email, plan, billing cycle and masked payment method
  survive a page refresh; Log Out clears the session

Keys used: `launchflow:users`, `launchflow:session`, `launchflow:theme`,
`launchflow:billingCycle`.

## Pricing

| Plan | Price | Notes |
| --- | --- | --- |
| **Free** | $0 forever | 3 projects, basic task management, basic analytics, limited LaunchFlow Intelligence. Every new account starts here. |
| **Growth** | $18 / user / month (or $15 / user / month billed yearly, save 17%) | Unlimited projects, advanced analytics, workflow automation, team collaboration, LaunchFlow Intelligence. |
| **Scale** | Contact Sales | Everything in Growth plus advanced automation, enterprise analytics, advanced permissions and priority support. |

The monthly/yearly switch updates the prices, the upgrade summary and the amount
charged in the demo payment flow. Plan buttons reflect real state: the active
plan shows **Current Plan**, and Growth users can change billing or downgrade
(with a confirmation step).

## Payment

The upgrade flow opens a review modal, then a **demo** card form with automatic
`1234 5678 9012 3456` card formatting, `MM / YY` expiry formatting, Luhn-checked
card validation and inline errors.

> **Payment is simulated. No real payment is processed, no gateway is contacted
> and no card data is sent anywhere.** Only a masked representation such as
> `Visa •••• 4242` is stored locally. The full card number and the CVC are never
> stored.

## Technologies

- HTML5 (semantic landmarks, ARIA, no framework)
- CSS3 (custom properties, Grid, Flexbox, container-free fluid type, media queries)
- Vanilla JavaScript (ES5-compatible syntax, no dependencies, no bundler)

## Responsive Design

Mobile-first, verified with zero horizontal scrolling at 320, 360, 375, 390, 414,
480, 768, 820, 1024, 1280, 1440 and 1920 px. Explicit breakpoints in
`css/responsive.css`:

| Breakpoint | Target | Key change |
| --- | --- | --- |
| `max-width: 480px` | Small phones | Single-column everything, full-width buttons, tighter gutters |
| `481–767px` | Large phones | Two-column feature/bento grids |
| `768–1023px` | Tablets | Three-column panels, two-column pricing, four-column stats |
| `1024–1279px` | Laptops | Desktop navigation, split hero, three-column pricing |
| `min-width: 1280px` | Desktops | Four-column bento with spanning cells, wider gutters |
| `min-width: 1600px` | Large desktops | Wider container, taller hero |

The mobile drawer, tab strip and modals are all built to survive 320 px width
without `body { overflow-x: hidden }`.

## Project Structure

```text
LaunchFlow/
├── index.html
├── css/
│   ├── style.css        Reset, design tokens, layout, header, hero, footer
│   ├── components.css   Buttons, cards, tabs, pricing, modals, dashboard
│   └── responsive.css   Explicit breakpoint layers
├── js/
│   ├── ui.js            Helpers, storage, theme, modals, form validation, toasts
│   ├── auth.js          Simulated signup/login/logout and account menu
│   ├── pricing.js       Billing cycle, upgrade, demo payment, downgrade
│   ├── dashboard.js     Dashboard, account, billing, settings, quick actions
│   └── main.js          Navigation, tabs, FAQ, carousel, reveal, counters
└── README.md
```

## How to Run

> Extract the ZIP and open `index.html` in a modern browser.

No `npm install`, no build step, no server, no database.

### Demo walkthrough

Create account → sign in → see your name → refresh → still signed in → open
Pricing → start on Free → Upgrade to Growth → enter demo card `4242 4242 4242 4242`,
any future expiry and any 3-digit CVC → complete upgrade → Growth shows as
Current Plan → refresh → still Growth → check Billing → downgrade → log out.
Settings → **Reset Demo Account** wipes everything.

## External Resources

No external CDN, font or script is loaded — the project is fully offline-capable.
The only external URLs are outbound links to official product websites:

- Slack — https://slack.com/
- GitHub — https://github.com/
- Figma — https://www.figma.com/
- Google Drive — https://drive.google.com/
- Notion — https://www.notion.so/
- Microsoft Teams — https://www.microsoft.com/microsoft-teams/
- Zapier — https://zapier.com/
- Linear — https://linear.app/
- LinkedIn — https://www.linkedin.com/
- X — https://x.com/
- YouTube — https://www.youtube.com/

All open with `target="_blank"` and `rel="noopener noreferrer"`.

## Author

**Mahnoor Yasir**
