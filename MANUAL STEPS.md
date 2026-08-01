# Manual steps — Caught Up

`NEEDED.md` is the canonical checklist. This page explains the three important
owner actions without preserving the retired in-repository generation setup.

## 1. Install the delivery App

Create or use the GitHub App named `boardlessai-delivery`, include
`lukaskourilcz/aifirst` in its approved repository installation, and grant only
repository contents read/write. The same installation can include the separately
approved MMA Files content target. Put the App ID and private key in the BoardlessAI
repository’s Actions secrets as
`DELIVERY_APP_ID` and `DELIVERY_APP_PRIVATE_KEY`. Do not add either secret to
aifirst or Vercel.

## 2. Remove obsolete aifirst credentials

The aifirst GitHub repository still listed `ANTHROPIC_API_KEY` on 2026-07-31,
although no workflow or runtime reads it. Delete that secret. Audit the aifirst
Vercel project for old source, image, promotion, generation heartbeat and
generation-report credentials and remove them. Quorum is the producer now, so
verify its active secrets before removing anything from Quorum. Keep the
optional OwnDashboard sentinel pair only when its read-only receiver exists.
Rotate provider keys previously pasted into chat even when no code references
them.

## 3. Review the first three deliveries

For three consecutive live editions:

1. Open the English article at `/articles/<slug>` and Czech at
   `/cs/articles/<slug>`.
2. Check that both editions cite the same evidence and that Czech reads
   naturally rather than as a literal translation.
3. Open the protected [BoardlessAI admin](https://boardless-ai.vercel.app/admin)
   and review the edition record. Social production is currently switched off.
4. Confirm the aifirst validation workflow and the Vercel production deployment
   succeeded.

The admin uses a username/password login and a signed session. Configure
`ADMIN_USER` and `ADMIN_PASSWORD` in the BoardlessAI Vercel project if they are
not already present. Social production remains off and autopublishing is not enabled.

Optional health, Jina and OwnDashboard tasks remain listed in `NEEDED.md` with
their exact scope. None is required to publish the reader.
