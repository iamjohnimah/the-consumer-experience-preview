# Consumer preview releases

## 2026.10.16.01 — Banu product review

Includes redesigned Today, saved garments/looks and named lookbooks, collection rename and removal, resumable outfit drafts, product comparison, individual retailer links, preparation-aware legacy try-on and inline result reuse. Footer exposes the build number and release details. The existing browser state key is preserved; before the first updated save, an exact copy is kept at `spreeai-before-build-2026.10.16.01`.

Research rationale and PRD coverage: BANU_REVIEW.md. Production authentication, account isolation, cross-device sync, validated size-aware comparisons, attribution, serving budgets, and server-side capacity controls are not implemented by this static release. No arbitrary quotas or new paid plan were introduced.

## 2026.10.16.00 — Previous published source

Commit: b404e06655fd3d56f6997ad2bf355fd5768a6e67

Rollback branch: rollback/build-2026.10.16.00, preserving the exact previous published source.

## Deployment and rollback

The repository installation has been repaired for this repository only. Build 2026.10.16.01 is published as a single release commit; the existing Pages workflow runs frozen pnpm installation, tests, build, and deployment. Confirm the workflow and visible build number before treating the deployment as complete.

To roll back the complete single release, revert its deployment commit on main and allow the same Pages workflow to redeploy. Prefer a new revert commit over rewriting main. Verify the published page after deployment. Local browser data uses the same storage key; a source rollback does not erase the browser backup or saved wardrobe. If a data restore is necessary, first export current data from Profile, then restore the exact backup with an explicitly reviewed recovery procedure.
