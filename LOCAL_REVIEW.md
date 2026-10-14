# Consumer experience local review — October 13, 2026

Prepared against current GitHub main for publication after local review and QA.

Run `npm run dev` from this project. Review http://127.0.0.1:8940/#/today.

## Changes

- Today: tall, full-width Malik hero film showing Nigerian traditional wear, streetwear, and a tailored suit. Weather is inside the hero at the far upper right, aligned with the eyebrow. Yuna replaces the garment-only image in the getting-dressed section.
- Closet: persistent first-visit import dialog with Gmail, Pinterest, Instagram, links, photo entry, and skip. The normal wardrobe follows completion or dismissal. Import closet reopens the dialog for review. Existing browser wardrobes are preserved.
- Plan: removed from navigation and included at the bottom of Closet. Prior planner URLs resolve to Closet. Planning uses owned pieces and forecast.
- Trending: removed from navigation and help; prior Trending URLs resolve to Discover.
- Discover: prominent group/event discovery and celebrity profile spotlights. Publisher video embeds request muted autoplay as they enter view; playback depends on the publisher/browser. Native brand footage autoplays muted.
- Shop: newly generated 1080p Yuna streetwear film, muted and looping, in a loft with a curved sofa, chrome chair, and travertine table.
- Messages: circular, fixed-square portrait sizing in both the conversation list and chat header; public celebrity portrait photos and fictional fashion conversations with demo outgoing replies. Nothing is sent externally.
- Events: Vogue World Milano and Met Gala editorial retrospective cards with sourced photos; community events use atmosphere photos and flyer titles. Retrospectives remain identified and do not imply future admission.
- Profile: removed the Fitting profile/imports/preferences dropdown and the top Profile/search strip; removed the top-right moon, wishlist, and avatar controls. The bottom-left Profile entry opens the profile and displays the saved photo or Twin; the example portrait is shown before a selection. Full-width portrait header, blue glowing scalloped verification design, expanded demo bio/location/username, centered highlights, 1.2M demo followers, 328 following, 64 looks, and seven pieces. Removed verification requests, creator-space section, shared-closet tab, and caption/upload prompt. Editorial inspiration posts and Twin preview looks replace garment-only content. Visitor mode hides owner controls and settings.
- Edit profile: fitting/photo/Twin setup at the top, followed by editable name, username, city, region, country, bio, and website/social link. Removed duplicate profile-picture control.

Sidebar branding uses the full SPREEAI wordmark. The global top search/help/status strip is removed; search remains within Shop and Closet. Appearance is available under Settings in the footer and mobile More menu, with persistent Light/Dark choices.

## Media provenance

Freya profile portrait and closet intro footage: existing SPREEAI assets. Malik still: generated from the existing approved Malik Twin reference; the user explicitly approved its upload to Higgsfield. Malik film generation job: 556fa335-0431-4bf8-bafd-5feeffde807c. Yuna streetwear still: created from the existing Yuna reference using image generation. Clean video: Higgsfield Seedance 2.5 job 9e2c1326-9347-4862-b77c-64eb60c46427, generated after the user explicitly approved the reference-derived image upload. The initial take with unwanted text is excluded.

Event editorial source pages:
- https://www.vogue.com/slideshow/vogue-world-milano-2026-celebrity-arrivals-fashion
- https://www.vogue.com/slideshow/met-gala-2026-red-carpet-celebrity-arrivals-live

Celebrity portrait source and license details are retained in public/portrait-credits.json and displayed in Discover and Messages. Editorial feed links retain their original publishers. Social photos and receipts use the existing preview review flows; automatic social account scanning is not enabled.

## Validation

Production build and all 77 tests passed. Browser QA covered desktop, tablet, and 320/390px phones across all main pages, consistent Afacad typography (including the newly bundled medium weight), circular message avatars, persistent Closet skip and manual pieces, seven-day planning without duplicates, saved message replies, visitor control hiding, profile Twin avatar persistence, appearance persistence, event plans, community following, and muted playback of the 1920×1080 Malik and Yuna films. A real preset-Twin try-on completed and rendered successfully in the isolated QA browser.

QA repairs: decimal garment prices, link-import wording, product-search reset, native product recommendation/breadcrumb navigation inside the preview, same-origin loading-logo assets to avoid canvas taint, and correct retrospective event details without calendar booking controls. No personal photos were uploaded during QA. Test data was isolated from the user review browser.
