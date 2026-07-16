# AgriIntel Roadmap

The path from the redesigned farmer-facing frontend (Phase 4) to a real, shipped product.

## Phase 4 — Frontend Redesign ✅ Done

Farmer-facing UI on Tailwind v4 + shadcn/ui, mocked data, no backend wiring. Three focused tools
(disease, yield, soil) reachable from a plain-language home screen, plus a simple past-checks
history view. Merged to `main` via PR #11.

## Phase 5 — Real API Integration ✅ Done

Wired `frontend/src/services/{disease,yield,soil,history}.ts` to the live FastAPI endpoints
documented in `docs/API_CONTRACTS.md`; removed the mock layer; added real error handling
(toast notifications, backed by a new backend-wide `{detail, error_code}` response contract);
added the previously-missing `GET /api/history/{id}` endpoint; rebuilt the history page with
real server-side filtering and pagination. Merged via PR #12.

A follow-up round of fixes came from actually using the real forms against the real backend
(the kind of gap tsc/lint/build/pytest can't catch): dropdown option lists in
`mocks/formOptions.ts` are now sourced directly from each ML module's real training
artifacts/dataset instead of hand-picked placeholders — and are per-module, since Disease/Soil
and Yield were trained on different data with different valid categories; a dead "Crop" field
was removed from the Soil form (the advisor module has no concept of crop); a browser-native
HTML5 validation bug that silently blocked decimal input was fixed; the Soil advisory's LLM
prompt had a data-pollution bug producing garbled, truncated output — fixed at the artifact
level; and uploaded disease photos are now actually linked and shown in history (previously
saved to disk but orphaned). See `CLAUDE_LOCAL.md` for the full technical write-up. Merged via
PR #13/#14.

## Phase 6 — Model Serving & Inference Reliability (next up)

Cold-start latency for the TF/sklearn/LLM artifact loads at process start; timeout/retry
handling on the LLM advisory call path; client-side image size/format guards before upload;
graceful behavior under concurrent usage.

## Phase 7 — Offline & Low-Connectivity Handling

Caching strategy for app shell assets; graceful degradation on slow or dropped connections;
retry/queue affordances for submitted forms so a farmer doesn't lose input on a bad connection;
image compression before upload to reduce data usage.

## Phase 8 — Deployment

Hosting targets for the static frontend and the FastAPI backend; production `CORS_ORIGINS`
configuration; environment config split (dev/staging/prod); CI build and test checks on push.

## Phase 9 — Real-User Testing & Iteration

Pilot with smallholder farmers; usability testing for low literacy and small/older Android
screens; validate Hindi/Telugu advisory quality with native speakers; feed findings back into
copy, confidence phrasing, and form design.

## Phase 10 — Post-Pilot Hardening (stretch)

Usage analytics and monitoring, accessibility pass, broader crop/state/language coverage,
scaling the backend for concurrent real users.
