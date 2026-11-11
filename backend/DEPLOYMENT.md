# Deployment and verification

Active: dedicated Howdy Texas first-name/group-password login in Supabase project rzzipqdozabuxrmoxhlw. Existing Kufstein and Geiladachtzger accounts remain independent.

## Authentication
Four members are privately seeded. First names normalize case/whitespace; password characters compare exactly. Passwords use separate salted bcrypt hashes, excluded from source. An anonymous Supabase Auth session receives a verified 30-day private membership mapping only after the Edge function verifies the password. Every data policy requires that mapping. Throttling: 8 failed attempts/name and 40/network in 15 minutes. Logout revokes the mapping. Shared-password names do not independently prove a person's identity. No admin or provisioning UI.

## Data and migrations
schema.sql is the original one-time migration; private credentials are excluded.
ideas.sql is the additive migration howdy_shared_destination_and_hotel_ideas.
howdy_ideas contains nine destination and nine hotel seeds. Fields are length-limited; image motifs allowlisted; inserts and updates must match the verified member. Column grants protect author, ID and timestamps; revisions protect concurrent edits.
howdy_idea_votes allows only own votes; read access requires group membership.
Soft withdrawal preserves ideas/votes; authors can restore under Our Group.
howdy_plan retains shared date, tasks, budget, notes and revision guard. days defaults to 10 for old data, accepts 2-60 days and drives daily budget expenses.
Old howdy_votes is retained for rollback; it held zero votes at rollout.
Ideas and votes load after login and via explicit refresh; no realtime-sync promise.

## Verification
18 offline tests and syntax checks passed. The earlier live HTTP checks passed all four first names in lower, upper and title case, wrong password case rejection, pre-login denial, valid context after login, direct auth-RPC denial and access revocation after logout.
A new rolled-back database transaction verified 18 seeds, own creation/edit/withdrawal/restoration/voting, stale writes, denial of another author/vote and unverified bearer access. No test proposals remain.
Security advisor's anonymous-auth-policy notices are expected: policies require a separate private verified mapping. Other projects' existing warnings/settings were not changed.
All ten photo URLs returned HTTP 200 with image/jpeg on 2026-11-11.
Graphical local browser QA could not establish a connection before the Windows environment disconnected. Visual QA remains limited.

## Hosting and rollback
The GitHub repository and Sites audience remain private. Access for other travelers needs a separate outer Sites sharing decision.
Rollback: deploy the previous static version. Preserve new tables to keep any submitted ideas. Never automatically drop data or remove Auth users.
