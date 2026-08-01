# Enable LiveKit Cloud video in the Teaching Studio

## Why LiveKit
Twilio Programmable Video was discontinued (Dec 2024) and is not available for new projects, so it isn't an option. LiveKit Cloud is the cheapest embeddable option (~$0.03/hour per participant, 5,000 free participant-minutes per month) and the only one that lets video tiles sit inside our own studio layout alongside the whiteboard, synced diagram stage, and roster.

Cost example: a 90-minute lecture with 20 students is roughly $0.90 — and free while inside the monthly allowance.

## Current state
The video layer is already fully built. The token-minting backend function validates the signed-in user, confirms they are the instructor or an enrolled student, and issues a room token; the Video tab in the studio calls it. It returns "Live video is not configured yet" only because the three LiveKit credentials are absent.

## What happens next
1. You create a free project at livekit.io/cloud and copy three values from its settings: the server URL (`wss://...livekit.cloud`), an API key, and an API secret.
2. I open a secure form so you can paste them in — they are stored server-side only and never reach the browser.
3. I verify the Video tab in the Teaching Studio joins a live room end to end, with the instructor able to publish camera, mic, and screenshare, and students joining as subscribers.
4. If anything in the video tile layout or device controls needs polish after the live test, I fix it in the same pass.

No other work is needed — the whiteboard, animated clinical diagrams, live presence/attendance, and case simulator already run without these keys.

## Technical notes
- Secrets: `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, read only inside the `livekit-token` backend function.
- Room naming is scoped per classroom ID; permissions are derived from instructor vs. enrollment, so students cannot self-promote to publisher.
- Fallback preserved: if the credentials are ever removed, the studio degrades to the existing external meeting link instead of erroring.
