# Deployment and verification

Active: dedicated Howdy Texas first-name/group-password login, deployed in Supabase project `rzzipqdozabuxrmoxhlw`. Existing group accounts are independent.

## Authentication
- Four names are seeded privately at deployment. Login normalizes only the first name (case and surrounding whitespace); password characters are compared exactly.
- The selected group password is stored as a separate salted bcrypt hash for each member. Neither the password nor its hashes belong in source or browser storage.
- Supabase provides an anonymous Auth session. The Edge function verifies its bearer token, validates the group password through a service-only RPC and creates a 30-day membership mapping in the private schema.
- All public planning and voting data uses RLS with that verified mapping. Supabase anonymous Auth by itself grants no group access.
- Failed attempts are limited per name (8) and network (40) within 15 minutes. Shared-password names identify the chosen participant; they do not prove which person is physically using a device.
- Logout immediately removes the server-side membership mapping and clears the local Auth session.
- No password changes, account provisioning or admin privileges are exposed in the group UI.

## Data
`howdy_private.members`: private roster and bcrypt hashes.
`howdy_private.sessions`: temporary user-to-member mappings.
`howdy_private.login_attempts`: hashed throttle buckets.
`howdy_plan`: shared date, tasks, budget, notes; revision guard rejects stale writes.
`howdy_votes`: shared read access; insert/delete only for the current member.
`schema.sql` is the initial one-time migration; the private seed is deliberately excluded.

## Verification
16 offline tests pass.
Live HTTP checks passed for all four first names in lower, upper and title case; wrong password case was rejected. Verified empty plan access before login, correct group identity after login, allowed plan reads, denial of direct authentication RPC calls and votes for another member, plus access revocation after logout.
A rolled-back database transaction verified plan updates, stale-write rejection and own-vote insert/delete.
Security advisor flags anonymous Auth policies by design; each Howdy policy additionally requires a valid server-side group membership. No unrelated policies were changed.

## Hosting and rollback
Repository and Sites audience remain private. The outstanding public-hosting decision is separate from group authentication.
Set `backendReady: false` and deploy the previous static commit to disable login. Preserve data for recovery. Do not delete planning data or Auth users as an automatic rollback.

