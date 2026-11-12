# Deployment and verification

Active: GitHub Pages at https://thomasmarlin512.github.io/howdy-texas/ and Supabase project `rzzipqdozabuxrmoxhlw`. Only Howdy tables, private functions, and the `howdy-documents` bucket are used. Existing Kufstein and Geiladachtzger accounts and data remain independent.

## Authentication

Four privately seeded members. First names normalize case/whitespace; passwords compare exactly against separate salted bcrypt hashes excluded from source. An anonymous Supabase Auth JWT gains a verified 30-day private membership mapping only after the existing Edge function verifies the group password. Data and Storage policies require that valid mapping via `howdy_private.my_key()`, not just an authenticated JWT. Logout revokes the mapping. The shared password does not independently prove each member's identity.

Existing throttling: 8 failed attempts/name and 40/network in 15 minutes. No administrative or credential-provisioning UI.

## Migration order

For a new database, apply the existing `schema.sql`, private member provisioning separately, then `ideas.sql`, `migrations/20261112_flexible_routes.sql`, and `travel-hub.sql`. These setup scripts are one-time changes, not repeatable seed jobs.

The live project received `howdy_travel_hub_private_documents` and the corrective migration `howdy_document_access_without_policy_recursion`. `document-access-fix.sql` records the latter for an existing installation. The checked-in `travel-hub.sql` already contains the correction; do not apply both when installing afresh. The narrow private SECURITY DEFINER function tests only object existence in the caller's own folder with an empty search_path, avoiding recursive document/Storage policy evaluation. It exposes neither file content nor another member's objects.

Existing ideas, favorites, plan data and credentials are preserved. No user is automatically marked as attending, no option is pre-voted and no date is pre-confirmed. The 22 April–1/3/5 May date options are suggestions only.

## Shared records

- `howdy_bookings`: group reads/edits; four kinds and four statuses, two currencies, local timestamps with Central US/Zurich zones. Immutable creator and revision checks. Cancelling changes status and retains the record.
- `howdy_date_options`: 3–14 inclusive calendar days, earliest 22 April 2027. Own suggestions can be withdrawn/restored; a confirmed option cannot be archived.
- `howdy_date_votes`, `howdy_idea_ballots`, `howdy_attendance`: group reads, only own writes.
- `howdy_trip_settings`: shared confirmed option and optional external album link, revision protected.
- Existing heart favorites remain separate from yes/maybe/no votes. The legacy plan remains a budget estimate; its data is not overwritten by date confirmation. Its UI limits on-site days to 13, allowing the extra overnight-return calendar day.
- Only explicit refresh/login loads other members' changes; no realtime synchronization promise.

## Private documents

`howdy_documents` stores metadata. `howdy-documents` is private, limits files to 10 MiB and allows PDF/JPEG/PNG/WebP/HEIC/HEIF. The browser checks file signatures and normalizes filenames. Object paths are a member key plus UUID and canonical extension; tickets never enter the repository.

Upload flow: insert pending own metadata, upload through Storage API without upsert, then mark ready. Other members cannot read unfinished uploads. Finalization requires an existing object. An interrupted upload can be checked or removed by its creator. Completed files are readable by the group; only their creator can delete, and metadata cannot be removed while its object exists. No object UPDATE policy permits overwriting tickets.

Downloads use the authenticated Storage download API and a temporary browser Blob URL with a safe extension. No public or persistent signed document URLs. There is no inline HTML preview. Logging out revokes future access, not files previously downloaded to a device.

## Verification — 12 November 2026

- 29 offline Node tests pass, covering auth, existing catalog/routes, timezone chronology, invalid dates, maximum trip length, currency totals, overlap rules, file signatures/names, required markup and private page gates.
- Syntax checks cover both application modules and existing login logic.
- `tests/travel-hub.sql` ran against two disposable existing Auth user UUIDs inside a rolled-back transaction. It checked outsider denial, own votes, shared booking edits, revision conflicts, date bounds, pending-file isolation, confirmed-date archive protection, and expired membership. Set the session settings `howdy.test.user1` / `howdy.test.user2` before running. Do not run unrelated account provisioning in this test.
- 21 live HTTP assertions passed using two temporary anonymous Auth sessions and one synthetic PDF: normal first-name login, pending metadata, denial of finalization without a file, upload/finalization, exact-byte owner and group downloads, denied public/unverified downloads, denied foreign deletes and overwrite, orphan prevention, owner cleanup and logout revocation.
- Read-only database checks confirmed zero synthetic documents, objects, booking rows or group sessions remained. Auth users created through normal anonymous signup were not deleted.
- Security advisor's anonymous-auth-policy notices are expected because policies require the additional private verified membership mapping. No unrelated project's warnings or settings were changed.
- Browser visual and interactive QA was unavailable in this environment. Static markup and API checks do not replace an actual mobile browser check.

## Hosting and rollback

The public repository publishes only `dist/` through GitHub Actions after Node tests and syntax checks. No Sites deployment is performed.

To roll back the UI, redeploy the previous static version. Preserve all new tables and the bucket so uploaded files, votes and bookings remain intact. Do not drop data, delete Auth users, or change other apps' policies as part of a UI rollback.

