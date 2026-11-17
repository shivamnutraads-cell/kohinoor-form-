# Kohinoor Plus – GitHub + LeadVertex

## Files
- `index.html`: GitHub Pages form.
- `worker.js`: Cloudflare Worker backend. Keep the LeadVertex token here as a Worker Secret only.

## Important before going live
1. The API password/token shown in the uploaded text file is exposed. Change/rotate it in LeadVertex first.
2. Do NOT put the new token in `index.html`, GitHub repository, or any public file.
3. Confirm the Kohinoor Plus product `goodID` with LeadVertex. Do not use the Easy Slim Pro ID.
4. Confirm the order price. Worker currently defaults to 2250; change the `ORDER_PRICE` Worker variable if needed.
5. The Worker code follows the uploaded API docs' `addOrder.html` endpoint, webmasterID 28, and fields `fio`, `phone`, `address`, `price`, `total`, `quantity`, `timezone`, and UTM fields. Test CRM insertion before advertising.

## Deploy backend (Cloudflare Workers)
1. Create a Cloudflare account, open Workers & Pages → Create → Worker.
2. Paste `worker.js` into the Worker editor and Deploy.
3. Worker → Settings → Variables and Secrets:
   - Add Secret `LEADVERTEX_TOKEN` = your newly rotated LeadVertex API token.
   - Add Variable `ALLOWED_ORIGINS` = your exact GitHub Pages origin, e.g. `https://YOUR-USERNAME.github.io` (or `https://YOUR-USERNAME.github.io/YOUR-REPO` is NOT an origin; origin is scheme + host only).
   - Add Variable `ORDER_PRICE` = `2250` (confirm this).
   - Add Variable `LEAD_DOMAIN` = your published GitHub Pages domain.
   - Add `GOOD_ID` only after confirming the Kohinoor Plus product ID.
4. Save and redeploy if prompted. Copy the Worker URL, e.g. `https://your-worker.your-subdomain.workers.dev`.

## Deploy frontend (GitHub Pages)
1. In `index.html`, replace `PASTE_YOUR_CLOUDFLARE_WORKER_URL_HERE` with your Worker URL.
2. Upload `index.html` to the root of your GitHub repository.
3. Enable GitHub Pages in repository Settings → Pages.
4. Add the exact site origin (scheme + hostname only) to Worker `ALLOWED_ORIGINS`.

## Test
Submit one test lead using your own test phone number, then verify the new order appears in LeadVertex Orders. Do not repeatedly submit tests. A successful API response should contain `{ "OK": "order-number" }`.
