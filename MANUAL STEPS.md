# Manual steps — Caught Up

`NEEDED.md` is the canonical checklist. The delivery App is installed and the
reader deploys from `main`; this page explains only the remaining owner work.

## 1. Remove obsolete aifirst credentials

The aifirst GitHub repository still listed `ANTHROPIC_API_KEY` on 2026-07-31,
although no workflow or runtime reads it. Delete that secret. Audit the aifirst
Vercel project for old source, image, promotion, generation heartbeat and
generation-report credentials and remove them. Quorum is the producer now, so
verify its active secrets before removing anything from Quorum. Keep the
optional OwnDashboard sentinel pair only when its read-only receiver exists.
Rotate provider keys previously pasted into chat even when no code references
them.

## 2. Let the automated release check decide

Each new delivery must contain the English article, Czech article, exactly one
validated image and its attribution. BoardlessAI then:

1. commits only the authorized dated files;
2. waits for repository validation and the Vercel deployment;
3. checks both language routes, the content hash, image dimensions and attribution;
4. retries the same package once without another model call;
5. reverts and pauses Caught Up if the second check fails.

There is no owner content-approval gate. The protected
[BoardlessAI admin](https://boardless-ai.vercel.app/admin) shows the delivery and
social-readiness records. Social posting remains locked until its release counter,
credentials and safety checks pass, and the global kill switch remains the owner stop.

Optional health, Jina and OwnDashboard tasks remain listed in `NEEDED.md` with
their exact scope. None is required to publish the reader.
