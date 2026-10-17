# Product and implementation decisions — October 16, 2026 review

## Source reviewed

Banu Jafarli’s **Consumer B2C App Requirements 10/2026**, Google Doc:
https://docs.google.com/document/d/14naTmi6c318bZAsOwR9Rn5J2YxWdjkG9gEvA9E567GM/edit

All document text and both returned comment threads were read. Neither thread had replies or was resolved:

- “capacity”: “@john@spreeai.com need to think through this” (Oct 16, 17:19:32 UTC).
- “alignment”: “Also alling on this @john@spreeai.com” (Oct 16, 17:19:47 UTC).

The document is a draft for CEO alignment. Proposed phases are not Q4 delivery commitments. This implementation is a review proposal, not evidence of team agreement, production readiness, catalog permission, GPU capacity, or approved pricing.

## Research applied

These are design references, not evidence that this revision increases conversion or retention. No controlled user study was performed.

| Primary source | Observed pattern | Decision for SPREEAI |
| --- | --- | --- |
| Apple, Onboarding — https://developer.apple.com/design/human-interface-guidelines/onboarding | Keep onboarding fast and optional; put contextual instruction near the relevant interface. | Browse without an onboarding wall. Offer setup from Today and keep fitting setup attached to the chosen product. |
| Whering, How it works — https://whering.co.uk/how-it-works | Add clothes from photos or a database to build a digital wardrobe. | Keep Closet as the home for owned clothing and its planner; do not force garment import before shopping. |
| Whering, Outfit suggestions — https://whering.co.uk/faq/outfit-suggestions-on-Whering | Describes daily outfits using added wardrobe pieces, personal style, and weather. | Keep occasion-based outfit editing, label catalog examples explicitly, and use owned clothing when present. No newly claimed recommendation model. |
| Pinterest, Manage boards — https://help.pinterest.com/en/article/boards | Named collections organize saved ideas. | Add a first-class Saved destination and named lookbooks, with pieces and looks as separate views. |

## Product choices for review

1. **Lead with personal shopping assistance; let wardrobe utility grow with use.** Today offers discovery, an editable outfit, saved work, and an owned-clothes path. Existing planner and social surfaces remain accessible. This is a recommendation, not a confirmed launch promise.
2. **Give saving a clear home.** A new Saved route holds saved garments and looks. Named lookbooks support membership without duplicate records. Removing a garment from a lookbook leaves the global saved garment intact.
3. **Explain readiness at the action.** Products explicitly awaiting preparation cannot start the legacy inline try-on. Catalog sizes do not imply size-aware rendering. Comparison clearly says when it displays catalog images.
4. **Shop one item at a time.** Outfit shopping lists each garment separately, labels owned pieces, and disables missing/unsafe/known out-of-stock destinations. It does not open all retailers or invent a combined checkout.
5. **Preserve SPREEAI’s existing assets.** Retain bundled SPREEAI logo, Afacad typography, neutral palette, catalog/model photographs, and the existing native Shop. Today has no video.
6. **Do not turn proposed economics into a purchase offer.** Replace the prominent $20/month navigation promotion with the Saved entry point. Existing exploratory membership copy remains in source; it is not an approved pricing model or enabled checkout.

## Capacity comment: concrete treatment and remaining decision

Product comparison uses existing catalog assets and starts zero generation jobs. Existing inline serialization prevents concurrent duplicate jobs; the revised inline renderer reuses an already available front/back/video result rather than regenerating on a repeat request. Explicitly awaiting products are rejected before generation. Existing pending selection and error recovery behavior is retained.

These are interface protections, not infrastructure guarantees. Before launch, engineering must supply observed workload costs, latency, peak concurrency, queue limits, shared partner allocation, retry behavior, and serving budgets. Do not publish invented usage allowances or GPU capacity. A server-side idempotency key, feature flags, rate limits, monitoring, and admission control must be validated on the actual shared platform.

## PRD coverage and limits

| Requirement | Treatment in this local revision |
| --- | --- |
| FR-01 Accounts | Guest local review remains available; production authentication, recovery, cross-device sync, and account isolation remain backend work. |
| FR-02 Try-on profile | Retain existing photo/Twin setup and product continuity. No personal images submitted during verification. |
| FR-03 Discovery | Retain Shop filters and Discover; redesign Today entry points. |
| FR-04 Product details | Add preparation messaging and explicit size-selection distinction to legacy detail view. Preserve native Shop details. |
| FR-05 Personalized try-on | Retain existing service adapter; guard awaiting items and reuse existing inline results. Production readiness is unverified. |
| FR-06 Build a Look | Retain builder, compatible selection logic, editing and local save; add duplicate-look protection and item-by-item shopping. |
| FR-07–11 Sizing and comparisons | Retain existing supported sizing paths. Fix Shop product comparison. Do not label catalog images size-aware or personalized. Validated same-profile size/look result comparison remains integration work. |
| FR-12 Saved content | Dedicated Saved destination; garments and looks persist locally, with native-Shop metadata available to the global library. |
| FR-13 Lookbooks | New named collections for saved garments and looks. |
| FR-14–16 Immersive views | Existing adapters retained; no new readiness claims or automatic multi-view generation. |
| FR-17–19 Owned wardrobe | Existing add/import/organize and mixed outfit flows retained. Asset readiness still differs from ownership. |
| FR-20 Purchase import | Existing review/import flows retained; no new provider permissions or automatic inbox access. |
| FR-21–26 Wardrobe utility | Existing styling/planning/travel/insight tools retained. No new ML or production data claims. |
| FR-27 Data controls | Existing export/removal controls retained. Production retention/deletion orchestration remains unverified. |
| FR-28 Availability | Guard explicit preparation states in legacy detail/inline generation. Full cross-platform feature configuration remains backend work. |
| SHOP-01–04 Retailer handoff | Add individual links to builder and validate safe destinations. Catalog prices are snapshots; selected variants may need reselection at retailer. |
| SHOP-05–07 Analytics/attribution | No new analytics service or purchase attribution. An outbound click is not a purchase or confirmed retailer arrival. |

## Alignment decisions still needed

Recommended launch order: product browsing and retailer mapping → profile and supported try-on → saved results and garment persistence → Build a Look → supported sizing and comparisons → richer owned wardrobe and immersive features. Existing prototype breadth can stay available for exploration without becoming a release commitment.

Decide first-release scope, mobile-web/native distribution, relationship to Living Storefront, platform integration contract, permitted catalog coverage, cross-experience identity reuse, attributable retailer coverage, business model, and launch audience. This prototype cannot resolve commercial permissions or infrastructure capacity by design alone.

## Verification

Production build succeeded. All 81 automated tests passed, including retailer destination validation and generation preparation gating. Existing 77 regression tests remain passing. An additional server-rendering smoke check covers the new Today and Saved components; local HTTP checks confirm the packaged index, JS bundle and logo can be served.

No live-browser visual/interaction QA was performed on this local build in this session. Responsive CSS includes desktop and phone layouts, keyboard focus styles and reduced-motion behavior, but visual correctness and complete keyboard interaction still require browser review. No new real try-on, personal-photo upload, retailer checkout, publication, or load test was performed. Prior repository documentation describing earlier browser QA does not validate this revision.

## Numbered release follow-up

Build 2026.10.16.01 adds visible release details, a browser-state backup before the first new save, resumable outfit drafts, mobile Saved navigation, lookbook renaming and removal of looks from collections. RELEASES.md records rollback baseline and publishing status.
