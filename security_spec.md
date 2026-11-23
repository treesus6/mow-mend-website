# Security Specification & Payload TDD — MOW & MEND LLC

## 1. Data Invariants
1. **Strict PII Isolation**: No unauthenticated user or non-owner account may ever `get`, `list`, `update`, or `delete` any document in `/estimateRequests/{requestId}` or `/estimateRequests/{requestId}/photos/{photoId}`.
2. **Initial Lead State Integrity**: Public `create` operations on `/estimateRequests/{requestId}` MUST have `status == 'New'`, MUST NOT include admin-only fields (`internalNotes`, `estimateAmount`, `followUpDate`), and MUST bind `createdAt == request.time` and `updatedAt == request.time`.
3. **Atomic Photo-to-Lead Binding**: Photos in `/estimateRequests/{requestId}/photos/{photoId}` MUST match their parent `requestId`, MUST verify via `existsAfter` and `getAfter` that the parent lead exists with `photoCount >= 1 && photoCount <= 5`, and MUST enforce `mimeType` in `['image/jpeg', 'image/png', 'image/webp']` and `dataUrl` size bounds (`<= 600000`).
4. **Verified Owner Gate**: Admin access requires `request.auth != null && request.auth.token.email_verified == true` matching the owner email (`treevanderveer@gmail.com`) or an existing `/admins/$(request.auth.uid)` record.
5. **Immutable Creation Fields**: Owner updates on `/estimateRequests/{requestId}` can only touch `['status', 'internalNotes', 'estimateAmount', 'followUpDate', 'updatedAt']` while keeping `createdAt` and customer contact fields immutable.

## 2. The "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated Lead Read**: Anonymous client attempts `getDoc(doc(db, 'estimateRequests/MM-261122-ABCD'))` -> DENIED.
2. **Unauthenticated Lead List Scrape**: Anonymous client attempts `getDocs(collection(db, 'estimateRequests'))` -> DENIED.
3. **Unauthenticated Photo Read**: Anonymous client attempts `getDoc(doc(db, 'estimateRequests/MM-261122-ABCD/photos/photo-0'))` -> DENIED.
4. **Non-Owner Signed-In Read**: Signed-in Google user with email `random@example.com` attempts to list `estimateRequests` -> DENIED.
5. **Unverified Admin Email Spoof**: User token with `email == 'treevanderveer@gmail.com'` and `email_verified == false` attempts to read `estimateRequests` -> DENIED.
6. **Status Shortcutting on Create**: Public submitter creates lead with `status: 'Paid'` or `status: 'Approved'` -> DENIED.
7. **Shadow Admin Field Injection on Create**: Public submitter includes `internalNotes: 'free'` or `isAdmin: true` in `create` payload -> DENIED.
8. **Timestamp Forgery**: Public submitter sets `createdAt` to a client-chosen past date instead of `request.time` -> DENIED.
9. **ID Poisoning**: Submitter tries to create document with 500-char ID or invalid characters `../bad/id` -> DENIED.
10. **Orphan Photo Upload**: Attacker uploads photo to `/estimateRequests/NONEXISTENT-999/photos/photo-0` without a valid parent lead -> DENIED.
11. **Oversized / Executable Photo Payload**: Attacker uploads `mimeType: 'text/html'` or 900KB `dataUrl` -> DENIED.
12. **Customer Update/Delete Tampering**: Non-admin attempts `updateDoc` or `deleteDoc` on an existing lead -> DENIED.
