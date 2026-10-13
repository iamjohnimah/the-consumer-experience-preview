# Pinned SPREEAI Shop frontend

This directory contains the original public SPREEAI Shop frontend retrieved on 2026-10-13. The source manifest records the original URLs and unmodified SHA-256 hashes. Collection, product, profile, sizing, comparison, outfit-builder and stylist components keep their original CSS and animation code.

Adaptations: navigation stays under this directory; original media remains hosted at spreeai.com; the published demo environment is selected; external links open separately. The consumer shell embeds this local copy, rather than framing the remote site, which disallows cross-origin embedding. Each Shop entry mounts a fresh collection document; the original `orderForVisit` implementation randomizes every item and preserves that order through filtering and background refreshes.

Shop account, bag and saved-look state use the original Shop browser-storage namespace. Consumer closet/profile state remains separate. Demo capability availability and API behavior follow the original published demo service; no production service configuration was changed. Source snapshots are pinned and require intentional refreshes.
