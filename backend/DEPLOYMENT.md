# Deployment review

Status: implementation prepared; production database changes NOT applied. Automated approval review requires explicit owner approval. `dist/config.js` intentionally keeps `backendReady: false`.

## Exact scope

1. In existing Supabase project `rzzipqdozabuxrmoxhlw`, apply `schema.sql` in one transaction with the reviewed four-person seed inserted separately. Existing trip tables, policies and passwords are unchanged. New reads reference `trip_attendance` and `group_members` to preserve two existing identities.
2. New private schema `howdy_private`: member allowlist, current-member lookup, context and revision helpers. New public tables `howdy_plan` and `howdy_votes`, both with RLS; anonymous access is denied. Only the four mapped members can read the plan. Each member can change only their own votes. Plan updates use an expected revision to reject stale overwrites.
3. New `howdy-code-login` Edge function. It validates the caller token itself (`verify_jwt=false`), uses existing server environment secrets and exact origin allowlists. Two existing members use their current personal code. The two new members have separate Supabase Auth accounts. The owner explicitly creates their starting passwords in the authenticated group UI; credentials are returned once, never committed or logged.
4. Existing-user password changes explicitly affect the existing group login as well. New-account password changes use Supabase Auth. Passwords have no email recovery for the reserved `.invalid` aliases; support is handled by the project owner. Do not silently reset existing accounts.
5. Test live access as unauthenticated visitor, unrelated group member, each allowed member and owner. Verify direct REST/RPC requests are denied, own-vote restrictions hold, stale writes are rejected and logout clears UI. Run Supabase security advisors. Only then set `backendReady: true` and deploy.

## Hosting decision

The existing Sites audience stays owner-private. The dedicated GitHub repository stays private. GitHub Pages requires a public repository or eligible paid plan. No public conversion has been performed. Source contains no private member seed, emails, UUID mappings or passwords. The Supabase publishable key is intentionally public and is not an authorization boundary.

## Rollback

Set `backendReady: false`, redeploy the previously verified static commit and disable the new function. Preserve the new data tables for recovery rather than deleting them. Existing group sites continue to use their original function. Do not delete Auth users or planning data as part of an automatic rollback.

## Validation limits

Offline tests cover input normalization, calculations, XSS escaping, request authentication, origin enforcement, identity consistency, provisioning authorization and login throttling responses. Production RLS and successful real-account login remain untested until the migration is approved. Do not describe them as verified.
