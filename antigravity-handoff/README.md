# Peachtree Corners Loan & Pawn — first-stage site

This project is a safe, inquiry-first version of the existing website. The public entry point is `src/main.jsx`, which serves `src/SafeApp.jsx` and the protected hours screen at `/staff-hours`. The live merchandise array in `src/data/publicCatalog.js` is deliberately empty until the shop approves specific retail-eligible items. Customers are directed to call the shop to confirm availability.

The inherited components, pages, services, prototype tests, SQL schema and demo HTML in this repository are retained as reference material only. They are **not** the active site entry point, and their simulated checkout, payments, notifications, customer records and Hi-Tech Pawn integration are not production features. Do not connect or publish those prototypes without a separate implementation and security review.

Store hours are stored in the managed MySQL database and presented by the `server/` API. See [server/README.md](server/README.md) for hours administration, owner authorization, trusted origins, and operational requirements. The shop confirmed that Sunday is closed.

For local development, install the pinned dependencies with `npm ci`, run `npm run dev:server` for the API and `npm run dev` for the frontend. The managed project supplies the required server environment. `npm run build` builds the active storefront. Saving a Manus checkpoint does not publish a website, and the separate original GitHub repository is not automatically updated.
