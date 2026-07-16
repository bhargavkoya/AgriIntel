# AgriIntel Roadmap

The path from the redesigned farmer-facing frontend (Phase 4) to a real, shipped product.

## Phase 4 — Frontend Redesign (current)

Farmer-facing UI on Tailwind + shadcn/ui, mocked data, no backend wiring. Three focused tools
(disease, yield, soil) reachable from a plain-language home screen, plus a simple past-checks
history view.

## Phase 5 — Real API Integration

Wire `frontend/src/services/{disease,yield,soil,history}.ts` to the live FastAPI endpoints
documented in `docs/API_CONTRACTS.md`; remove the mock layer; handle real 400/422/503 error
paths (invalid state/soil_type, LLM provider unavailable, validation failures); source
crop/state/season/soil_type option lists from backend-validated values instead of the
hardcoded arrays in `mocks/formOptions.ts`.

## Phase 6 — Model Serving & Inference Reliability

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
