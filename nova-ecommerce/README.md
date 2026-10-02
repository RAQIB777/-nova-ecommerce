# NOVA — Full-stack fashion e-commerce starter

A professional, modular e-commerce project built with React + Vite, Express, MongoDB/Mongoose, JWT and Razorpay.

## Requirements
- Node.js 20+
- MongoDB local or Atlas
- Razorpay test account (optional until online checkout is enabled)

## Setup
1. Copy `backend/.env.example` to `backend/.env` and fill in MongoDB/JWT values.
2. In one terminal:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
3. In another terminal:
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm run dev
   ```
4. Open the Vite URL (normally http://localhost:5173).

The storefront supports browsing, search, category filtering, cart quantity changes, and a checkout/order flow. Backend routes include registration/login, product browsing, order creation/history, and admin order listing/status updates. Payment routes are scaffolded for Razorpay and require real test credentials.

## Important production checklist
This is a development starter, not a production-certified store. Before accepting real money: configure HTTPS, secure secrets, webhook signature verification, idempotency, inventory reservation/rollback, email delivery, refund workflow, rate limits, logging, backups, tax/shipping rules, and test the complete payment lifecycle. Never trust prices or payment status supplied by the browser. Seed products using MongoDB or build an admin product form.
