# Manual steps — Caught Up

`NEEDED.md` is the canonical checklist. This page explains the three important
owner actions without preserving the retired in-repository generation setup.

## 1. Install the delivery App

Create or use the GitHub App named `boardlessai-delivery`, install it only on
`lukaskourilcz/aifirst`, and grant only repository contents read/write. Put the
App ID and private key in the Quorum repository’s Actions secrets as
`DELIVERY_APP_ID` and `DELIVERY_APP_PRIVATE_KEY`. Do not add either secret to
aifirst or Vercel.

## 2. Remove obsolete aifirst credentials

In the aifirst GitHub repository and Vercel project, remove credentials that
belonged to the retired generator: Anthropic, source APIs, image providers,
promotion, generation heartbeat and generation-report callbacks. Quorum is the
producer now, so verify its active secrets before removing anything from Quorum.
Rotate provider keys previously pasted into chat even if they are no longer
referenced.

## 3. Review the first three deliveries

For three consecutive live editions:

1. Open the English article at `/articles/<slug>` and Czech at
   `/cs/articles/<slug>`.
2. Check that both editions cite the same evidence and that Czech reads
   naturally rather than as a literal translation.
3. Open the protected [BoardlessAI admin](https://quorum-site-chi.vercel.app/admin)
   and review both Instagram carousels, captions and Threads posts.
4. Confirm the aifirst validation workflow and the Vercel production deployment
   succeeded.

The admin uses browser Basic Auth. Configure `ADMIN_USER` and `ADMIN_PASSWORD`
in the BoardlessAI Vercel project if they are not already present. Social items
remain drafts; carousel autopublishing is not enabled.

Optional health, Jina and OwnDashboard tasks remain listed in `NEEDED.md` with
their exact scope. None is required to publish the reader.
