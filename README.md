# Open Receptionist OS (`@openscaffold/voice-receptionist` v1.0)

**White-Label Weave, Podium, RingCentral, Smith.ai & OpenTable Per-Cover Replacement across all 17 Open Scaffold Labs Verticals**

Live Production URLs:
- `https://open-receptionist-os.vercel.app`
- `https://www.openscaffoldlabs.com/products/open-receptionist/`

## Architectural Overview

Small businesses pay **`$4,200 to $18,000/year`** for fragmented phone, SMS, AI answering, and reservation widgets (`Weave` at `$399–$650/mo`, `Podium` at `$499–$799/mo`, `RingCentral` at `$35–$45/user/mo`, `Smith.ai` at `$300–$900/mo`, and `OpenTable` at `$299–$899/mo` + `$1.00–$1.50/cover`) when the underlying wholesale telecom and voice-AI rails cost pennies:
1. **Wholesale Carrier SIP Trunking & Local Number Porting (`$1.00/mo` DID + `$0.0035/min` via Telnyx / Bandwidth):** Replaces `$35–$45/seat/mo` VoIP subscriptions with unlimited WebRTC desktop/mobile softphones and existing desk-phone SIP registration.
2. **Wholesale 10DLC Two-Way SMS & Instant Missed-Call Text-Back (`$0.004/SMS`):** Replaces `$500–$800/mo` Weave/Podium bundles with direct carrier 10DLC messaging, 2-second missed-call text-back, and automated Google Review generation.
3. **24/7 Sub-400ms Real-Time AI Voice Receptionist (`@openscaffold/vi` + `@open-scaffold-labs/ai`):** Answers inbound calls 24/7 in natural human voice, recognizes callers via `@openscaffold/crm` Screen-Pop, answers business-specific questions, and books directly into `@openscaffold/schedule`.
4. **Zero-Commission Direct Booking & `Pay = Member` Private-Domain Loop:** Eliminates `$1.00–$1.50/cover` OpenTable tolls, GolfNow barter rounds, and Zocdoc/Thumbtack lead fees by converting every phone/SMS caller directly into a first-party appointment with an embedded `@openscaffold/payment` deposit link.
