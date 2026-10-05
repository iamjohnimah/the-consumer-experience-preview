# The Consumer Experience — public preview

SPREEAI's responsive wardrobe, fashion discovery and shopping experience. This repository is a clean public frontend, without the private hosted backend or its history.

## Preview behavior

- Wardrobe, favorites, planner, looks, feed comments and community drafts persist in the visitor's browser. Export a backup from Profile. Clearing browser storage removes this copy.
- Community creators and groups are sample inspiration. Draft posts, votes and follows are local; they are not delivered to other people.
- Messages and cloud account saves link to the private signed-in review app. Its access permissions remain unchanged.
- Native SPREEAI try-on uses garment-scoped guest sessions against staging. Only prepared garments can render; unavailable items are clearly indicated. Staging availability and approved browser origins are required. Photos are submitted only through the explicit try-on consent flow.
- Weather uses the public weather provider. Purchase links open the original retailers.
- Gmail OAuth and paid subscriptions are not active in this public preview. No mailbox connection or payment is claimed.

## Run

Node.js 24: `npm ci`, then `npm run dev`. Run `npm test` and `npm run build` before publishing.

GitHub Pages deploys the generated `dist` via the included workflow. Relative asset paths and hash routing support the repository URL without rewriting routes.

Product images, brand marks and product links identify their respective owners. This is a SPREEAI demonstration, not an official retailer checkout.

## Everyday experience

- Closet is a visual library with Owned, Purchases and Wishlist views. Room backgrounds and customization were removed. Existing wardrobe data remains compatible.
- Discover has attributed editorial trend ideas and selectable city, state/region and country contexts. These are curated ideas, not measured local popularity or live regional rankings.
- Comments, votes, follows, room memberships and posts are functional device previews; none are published to other viewers.
- Planner shows a Monday-first week of suggestions, using owned pieces when present and available weather forecasts. Without a wardrobe, suggestions are labeled examples from the catalog. Plan my week preserves existing plans; individual plans can be edited.
- Official events link to organizers. Sample meetups show explicitly labeled sample attendance, and local RSVPs adjust that count. No real booking or verified attendance feed is implied.
- SPREEAI Plus is proposed at $20/month; checkout remains disabled. No payment or subscription is created.
- No opening onboarding. Profile and the footer offer How it works. Mobile More includes all destinations, Wishlist, Plus, appearance and the guide.
