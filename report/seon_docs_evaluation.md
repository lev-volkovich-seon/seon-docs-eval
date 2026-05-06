# SEON Documentation Evaluation Report
**Evaluated by:** Claude Sonnet 4.6 (LLM)  
**Date:** 2026-05-06  
**Task:** Build a mock ecommerce checkout using SEON Fraud API, assessed from an LLM-assisted integration perspective.  
**Docs evaluated:** docs.seon.io — Introduction, API Integration Guide, Fraud API Reference, Quick Start

---

## 1. Executive Summary

SEON's documentation is well-structured for human developers with an existing mental model of fraud prevention. The core 3-step flow is clear, the field documentation is thorough, and the Quick Start selector is a standout feature. However, **an LLM (or a developer starting cold) must synthesize across 4–5 separate pages to complete a single end-to-end transaction flow** — there is no single canonical "do this first" page that covers auth → payload → JS Agent → response → decision. Several integration-critical details are buried, require inference, or are undocumented entirely.

**Overall assessment:** Good — with targeted improvements, SEON docs could be among the easiest fraud API docs to integrate via AI-assisted tooling.

---

## 2. Evaluation Method

This report was produced by an LLM (Claude Sonnet 4.6) that:
1. Read the SEON docs home, API Reference index, Introduction, API Integration Guide, and Fraud API Reference pages
2. Attempted to build a complete browser-based ecommerce checkout integrating the SEON Fraud API with JS Agent device fingerprinting
3. Noted every friction point, ambiguity, and missing piece encountered during the process

---

## 3. What Works Well

### 3.1 Clear 3-step mental model
The Introduction page's "Step 1 – Providing the data / Step 2 – Enrichment & Scoring / Step 3 – Feedback" structure is excellent. An LLM can immediately extract the high-level workflow from this section.

### 3.2 Risk score thresholds are explicitly documented
The APPROVE / REVIEW / DECLINE thresholds table (0–10 / 10–20 / 20+) is clear and immediately actionable. This is exactly the kind of unambiguous data that LLMs need to generate correct conditional logic without hallucinating values.

### 3.3 Industry + use-case selector in Quick Start
The interactive Quick Start that lets you select language, industry, and use case (e.g., Ecommerce + Payment) is outstanding. This dramatically reduces the number of irrelevant fields an integrator must filter through. **This is a best-in-class feature** — most fraud API docs force you to read the full reference and guess which fields matter.

### 3.4 Multiple language examples
cURL, Java, Python, and PHP examples on the Fraud API page give LLMs concrete, parseable templates. Code examples are more reliable for code generation than prose descriptions.

### 3.5 Postman collection linked from the Fraud API page
Direct link to a Postman collection on the core API page is a good DX touch. Developers (and LLMs guiding developers) can immediately test without crafting requests from scratch.

### 3.6 Modular API design is well-explained
The explanation that each sub-API (Email, Phone, IP, BIN) is optional and controlled via `config.api_fields` is clearly communicated. This allows an LLM to generate minimal working payloads without enabling unnecessary enrichment.

### 3.7 Authentication is simple and standard
`X-API-KEY` header is a well-understood pattern. The docs state it clearly in the Introduction. No OAuth flows, no token refresh logic — excellent for low-friction onboarding.

---

## 4. Areas for Improvement

### 4.1 No single end-to-end flow page ❌ (High impact)
**Problem:** To understand a complete payment transaction flow, an LLM must read: Introduction (3-step model) → API Integration Guide (use-case recommendations) → Fraud API Reference (request/response) → JS Agent section (device fingerprinting) → Label API (feedback). Each page adds critical context missing from the others.

**Impact:** High. This is the primary source of LLM hallucination risk — gaps in a single-page view cause the model to fill in missing steps incorrectly.

**Recommendation:** Add a "Complete integration walkthrough" page (or expandable guide) that covers the full lifecycle in one place:
```
1. Load JS Agent → capture session token
2. On event (purchase/login) → POST to Fraud API with session + user data
3. Read state (APPROVE/REVIEW/DECLINE) → apply business logic
4. POST to Label API → close the feedback loop
```
A sequence diagram (frontend → backend → SEON → decision) would reduce onboarding time significantly.

---

### 4.2 JS Agent integration is buried ❌ (High impact)
**Problem:** The JavaScript Agent documentation is a subsection deep inside the Fraud API reference page — not a top-level navigation item, not cross-linked from the Quick Start, and not mentioned in the Integration Guide's ecommerce setup checklist. An integrator who reads the Quick Start payload example will see `session` in the request but has no immediate pointer to where that value comes from.

**Impact:** High. Missing the JS Agent step means device fingerprinting silently returns no data, with no error — very hard to debug.

**Recommendation:**
- Add a callout box at the top of the Fraud API page: *"If you're using device fingerprinting, you must integrate the JS Agent before calling this API. [See JS Agent setup →]"*
- Promote JS Agent to a first-class navigation item
- Add a note in the Quick Start explaining the `session` field origin

---

### 4.3 No realistic full response example ⚠ (Medium impact)
**Problem:** The response documentation describes fields but does not include a full realistic JSON example for a typical APPROVE transaction. An LLM generating response-parsing code must guess the exact field paths (e.g., `data.state`, `data.email_details.deliverable`).

**Impact:** Medium. LLMs may generate subtly wrong field accessors (e.g., `response.state` vs `response.data.state`).

**Recommendation:** Add collapsible full response examples per state (one APPROVE, one REVIEW, one DECLINE) with real-ish data. This is standard in high-quality API docs (Stripe, Twilio).

---

### 4.4 `action_type` values not enumerated in one place ⚠ (Medium impact)
**Problem:** Valid `action_type` values (`account_register`, `account_login`, `purchase`, `withdrawal`, `deposit`) are mentioned in prose scattered across multiple pages. There is no single table listing all valid values with descriptions.

**Impact:** Medium. LLMs may hallucinate plausible but wrong values (e.g., `payment` instead of `purchase`).

**Recommendation:** Add a simple table in the Fraud API request section:

| action_type | When to use |
|---|---|
| account_register | New user signup |
| account_login | User authentication |
| purchase | E-commerce payment |
| deposit | Funds added to account |
| withdrawal | Funds removed from account |

---

### 4.5 CORS policy not documented ⚠ (Medium impact)
**Problem:** The docs do not mention whether the SEON API supports direct browser-to-API calls (CORS headers). All examples show server-side code, but the Quick Start does not warn against browser-direct integration. This is a critical gap for anyone building a frontend-only demo or evaluating the API without a backend.

**Impact:** Medium. Browser-direct calls may fail with CORS errors, which are confusing to diagnose if you don't know to expect them.

**Recommendation:** Add a callout in the Introduction or Fraud API page:
> *"The SEON API is designed for server-side integration. Direct browser calls may be blocked by CORS policy. Always proxy requests through your backend to keep your API key secure."*

---

### 4.6 Feedback loop (Label API) presented as optional ℹ (Low-medium impact)
**Problem:** Step 3 (feedback) is described as important for ML training, but the framing ("providing feedback is the key to refining the rules") reads as best-practice guidance rather than a required step. New integrators often skip it.

**Impact:** Low-medium. Skipping labels degrades ML model quality over time but doesn't break the integration.

**Recommendation:** Frame feedback as part of the core integration checklist, not an afterthought. Consider a "mandatory vs optional" section.

---

### 4.7 Rate limit details not cross-linked ℹ (Low impact)
**Problem:** Rate limits (2 req/s trial, 10 req/s production, 429 on breach) are documented only in the Introduction. The Fraud API page has no cross-reference. A developer reading only the Fraud API page won't know to handle 429.

**Recommendation:** Add a "Rate limits & errors" callout box on the Fraud API page with a link to the full error reference.

---

### 4.8 Session token lifecycle unclear ℹ (Low impact)
**Problem:** The JS Agent docs don't specify whether the `session` token expires, can be reused across requests, or is single-use. An integrator building a multi-step checkout flow doesn't know if they need to call `getSession()` once or on every request.

**Recommendation:** Add a one-line note: *"Each call to `getSession()` returns a unique, single-use token. Generate a new session per transaction."*

---

## 5. Integration Complexity Rating

| Step | Complexity | Notes |
|---|---|---|
| Authentication setup | 🟢 Low | Standard header, clearly documented |
| Understanding the API architecture | 🟡 Medium | Requires reading multiple pages |
| Building the request payload | 🟢 Low | Quick Start selector helps significantly |
| JS Agent device fingerprinting | 🔴 High | Buried, easy to miss, silent failure |
| Parsing the response | 🟡 Medium | No full response example |
| Applying APPROVE/REVIEW/DECLINE logic | 🟢 Low | Thresholds clearly documented |
| Closing the feedback loop | 🟡 Medium | Requires Label API on a separate page |
| Error handling | 🟡 Medium | Error codes on a separate page |

---

## 6. LLM-Specific Observations

### What LLMs handle well with these docs
- **Authentication:** The `X-API-KEY: [license_key]` pattern is unambiguous. An LLM generates correct auth code immediately.
- **Payload construction:** With the Quick Start selector showing language + industry + use case examples, an LLM can generate a near-complete payload with minimal inference.
- **Decision logic:** The score thresholds table is machine-readable and unambiguous.

### Where LLMs struggle
- **Multi-page synthesis:** LLMs have a finite context window. When critical integration steps are spread across 4+ pages, there's a risk that not all pages are loaded — causing incomplete code generation.
- **Implicit pre-requisites:** The JS Agent being a pre-requisite for `session` in the payload is only discoverable by reading deep into the Fraud API page. An LLM building from the Quick Start example alone will include `session: null` or omit the field without flagging the missing step.
- **Field path inference:** Without a full response example, LLMs must guess JSON paths. The `data.state` vs `state` ambiguity is a common hallucination point.
- **Silent failures:** SEON's design (never fail the Fraud API call even if sub-APIs time out) is good for resilience but means a broken JS Agent integration produces a valid-looking response with empty device fields. An LLM won't flag this as an error.

---

## 7. Recommendations (Priority Order)

1. **Add a "Complete Integration Walkthrough" page** (or prominent guide) covering the full lifecycle with a sequence diagram. This single change would reduce LLM hallucination risk most.

2. **Promote JS Agent to a first-class navigation item** and add a callout on the Fraud API page linking to it with context on when/why it's needed.

3. **Add full realistic response examples** (APPROVE / REVIEW / DECLINE) as collapsible JSON blocks on the Fraud API page.

4. **Create an `action_type` reference table** in the Fraud API request section.

5. **Document CORS behavior** explicitly — even a single sentence: "API calls must be made server-side."

6. **Promote the Label API feedback step** in the integration checklist as a core step, not optional guidance.

---

## 8. Conclusion

SEON's docs are above average for a fraud-as-a-service platform. The Quick Start selector, modular API design explanation, and clear scoring thresholds are genuinely excellent. The primary gap — for both human developers and LLM-assisted integration — is the absence of a single canonical end-to-end flow resource. Addressing the top 3 recommendations above would make SEON one of the most LLM-friendly fraud APIs available.
