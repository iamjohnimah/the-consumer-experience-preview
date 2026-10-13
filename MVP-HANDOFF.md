# SPREEAI consumer MVP — October 13, 2026

## Delivered in this package

React + Vite consumer experience, with an iOS Capacitor 8.5.3 project. App display name SPREEAI. Proposed bundle ID com.spreeai.consumer; confirm against the existing App Store Connect record before signing.

Discover starts with creator examples, short outfit video, a four-in-hand tie tutorial, fashion-week inspiration and sample groups. Likes, saves, group joins and filters persist locally. Example content and activity are labeled. Existing community composer, comments, reporting and remix tools remain accessible below More community inspiration.

Today introduces “You are the star” and an outfit-film entry point. A generated ten-second approved-demo-model concept demonstrates three outfits. The personal flow uses the saved profile photo/model and configured SPREEAI fitting endpoints to request front/back renders and moving previews for up to three garments. It requires adult/image authorization, exposes progress and cancellation, and preserves service failures. This is a sequence of separate generated clips; single-file assembly is not implemented. Live end-to-end generation from a personal upload has not been verified.

The real SA artwork is black on an opaque white square, used for the app icon, browser icon and app navigation.

## The growth loop to ship

1. Upload one photo → get a strong first look with little setup.
2. Pick a three-look template → create a short 9:16 transformation film.
3. Export directly to camera roll and the native share sheet, with a restrained SPREEAI attribution and “Try these looks on me” link.
4. Recipient opens the same garments/template → uploads their own photo → creates their version.
5. Invite a friend to a weekly “One piece, three ways” challenge; credit the original creator and link both remixes.

No feature guarantees virality. Test whether recipients actually make their own looks before investing in more navigation/features. Use small creator cohorts and examine activation, film completion, export/share, recipient conversion, remix completion and week-one return. Keep affordability/owned-wardrobe styling prominent rather than relying on luxury-only shopping.

## MVP priorities

P0: authenticated accounts, durable wardrobe/photo storage with deletion, shared post/media database, server-side video jobs and retry/idempotency, render-ready garment eligibility, one-file video assembly and download, privacy controls, functional reports/blocking/moderation, stable mobile fitting service configuration.

P0 for distribution: real iPhone QA, keyboard/safe-area/media tests, offline/service-failure states, approved privacy/support URLs and disclosures, current Apple signing team/provisioning, matching bundle ID, App Store Connect app record, archive/upload and tester assignment. Do not interpret local success as TestFlight distribution.

P1: universal/deferred links that retain garments and template; reciprocal remix lineage; native share/camera-roll integration; trending based on real recent activity; small relevant group recommendations; useful notifications. Current sample group joins do not create shared memberships. Current example share links open the Discover route with a post hint; no universal/deferred links are configured.

Keep secondary utilities behind More for initial onboarding. Defer subscriptions until core creation and return behavior are validated. Existing Plus pricing is a prototype hypothesis.

## Build and TestFlight

Use Node 22+ and pnpm. Run `pnpm install`, `pnpm test`, `pnpm build`, `pnpm exec cap sync ios`, then open `ios/App/App.xcodeproj` in Xcode. The native project bundles local web assets, not a hosted URL. The pnpm lockfile is authoritative.

Select the existing SPREEAI developer team and verify com.spreeai.consumer is the correct registered ID. Set the next unused build number and run on a physical iPhone. Archive for a generic iOS device and upload through Organizer. Wait for Apple processing, complete export-compliance/beta metadata, add John to the internal tester group and verify the invitation/build in TestFlight. External testing may require Beta App Review.

Current blockers: this Mac reports an unaccepted Xcode license, and App Store Connect opens at login. User elected to finish the package first. No signed archive, upload, beta approval or TestFlight invitation has been created. App version 0.1.0, provisional build 1; signing team is unset.

## Validation

67 existing automated tests pass. Production web build passes. New desktop and 390px iPhone-width screens inspected. Save/filter interactions checked. Generation output is demo concept media, not verified garment-specific product output. New live photo-to-video service calls are unverified. The iOS project was generated and web assets copied; Xcode compilation remains blocked by license acceptance.
