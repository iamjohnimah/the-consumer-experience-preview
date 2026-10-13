# SPREEAI product components in the consumer app

Original public Shop assets were retrieved on 2026-10-13; the manifest records original URLs and source checksums. The consumer collection is implemented in src/NativeShop.jsx. Product/outfit components are mounted directly in the consumer DOM by mountConsumerShop, exported from the adapted original index module. There is no Shop iframe or separate hosted website entry.

The adapter supplies in-memory navigation, directs collection/profile actions to consumer callbacks and mounts dialogs in the consumer product container. Original collection/product styles are scoped under .native-shop. Website headers, menus, account links and marketing footers are excluded from the view. Product layout and outfit-builder components and animation code remain the original implementation. Media and fitting capabilities depend on the original public hosts/API. Pinned snapshots require deliberate source updates; no automatic refresh is configured.

The browser state used by original fitting components remains separate from the consumer fitting-profile storage. The visible consumer Edit Profile is the full ProfileEditor/ProfileFitting experience. Unifying those fitting-provider state models requires a source-level integration with the original Shop project; no backend capability changes were made here.
