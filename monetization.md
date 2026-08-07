# Caught Up — monetization

A bilingual technology briefing produced by BoardlessAI and served as a static
reader. Revenue depends on trust and audience; the producer boundary does not
change the need for sponsor approval, disclosure and measurable traffic.

| Option | Likelihood of income | Possible earnings | Pros | Cons |
|---|---|---|---|---|
| **Display ads (contextual, privacy-friendly)** | Medium | $0–500/mo | Passive; scales with traffic | Needs real traffic; can hurt UX |
| **Newsletter / sponsor slots** | Medium | $0–1,000/mo | High CPM; direct deals | Requires a subscriber base |
| **Paid membership / ad-free tier** | Low–Medium | $0–400/mo | Recurring; aligns with quality | Hard to convert without a moat |
| **Affiliate links (tools, courses)** | Low | $0–150/mo | Passive; fits tech content | Low conversion; disclosure needed |
| **Buy Me a Coffee / donations** | Low | $0–80/mo | Zero setup | Small and irregular |

**Recommendation:** grow the newsletter first (sponsor slots have the best
CPM), add contextual ads once traffic is real; keep a light donation link.

## The partner belt

One slot exists already: `today-partner-belt`, after the completion mark on
Today, at the IAB standard 728×90 and 320×100. `config/banner.json` holds it and
it is inactive, so nothing renders and no space is reserved. Filling it means
committing a local image and a destination — no ad network, no script, no
tracking, so it stays inside the CSP and costs nothing to serve. That is the
direct-deal path in the table above, not the programmatic one, which this
repository does not permit.
