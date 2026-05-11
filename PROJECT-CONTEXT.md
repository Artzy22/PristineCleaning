# Pristine Home Care — Project Context

> **For Claude / new session handoff.** Read this file first. It contains
> everything needed to continue work on this project without re-explaining.

Last updated: May 1, 2026

---

## 1. Who & What

**Owner:** Byron Vale, 19, Marietta GA. Non-technical — prefers paste-ready code, simple step-by-step guidance, no over-engineering.

**Business:** Pristine Home Care — residential & commercial cleaning, North Atlanta metro. DBA of **GRWTH CO LLC** (EIN 41-3188984).

**Service area:** Marietta, Lawrenceville, Norcross, Roswell, Sandy Springs, Alpharetta, Smyrna, Dunwoody, Tucker, greater Atlanta.

**Goal:** Single-page Meta Ads landing funnel that captures leads and creates contacts in GHL with full attribution.

---

## 2. Tech Stack & Channel

| Layer | Tool |
|---|---|
| CRM / Funnel hosting | **GoHighLevel** (location ID `iz6XXcGy6v5QfxJHe36T`) |
| Ads | Meta (Facebook/Instagram) |
| Tracking | Meta Pixel (ID still needs to be plugged in — placeholder is `YOUR_PIXEL_ID_HERE` in 2 files) |
| SMS | A2P 10DLC registered, approved, mixed/low-volume |
| Domain | `pristinehomecare.online` |

---

## 3. Critical IDs & Credentials

| Thing | Value | Notes |
|---|---|---|
| GHL Location ID | `iz6XXcGy6v5QfxJHe36T` | |
| GHL Form ID (Pristine Lead Form) | `bBWtxzVyzLdqPoTylrnU` | |
| Hidden form's auto-generated class | `.form-3BBACEcv_x` | What our JS targets |
| Custom field — Home Type | name=`Ub3svWk2B7rhCBya6vSS` | Auto-generated, may change if form recreated |
| Custom field — Frequency | name=`FLx3DdoJ2zAAcg7ju5bK` | Same |
| Custom field — Bedrooms | name=`w5a1RNWm467X9FiVkiYv` | Same — note capital W in `RNWm` |
| GHL API Token (PIT) | `pit-46f3497f-c46d-42a1-9e14-3cbf3b4baf01` | Server-side use only — never put in browser |
| Funnel preview URL | `https://app.gohighlevel.com/v2/preview/vdkQU9yXDZ4bmibbVEyG` | |
| Live landing | `pristinehomecare.online/landing` | |

**Phone numbers:**
- **A2P-registered SMS HELP line:** `(516) 589-9288` — DO NOT change in consent text or A2P registration breaks
- **Callback / display number:** `(404) 422-5144` — used in footer, thank-you page, alert workflows

**Email:** `info@pristinehomecare.online`

**Hours:** Mon–Sat 7am–7pm

---

## 4. Brand Identity

**Logo:** Pristine in bold script (Pacifico approximation) + "— HOME CARE —" subtitle with flanking dashes. Currently rendered as inline SVG in nav and footer.

**Colors (light editorial theme — UPDATED LATEST):**
| Token | Hex | Usage |
|---|---|---|
| `--phc-bg` | `#fbf6ec` | Page background (warm cream) |
| `--phc-bg-alt` | `#f6efe1` | Secondary background |
| `--phc-card` | `#ffffff` | White cards over cream |
| `--phc-cream` / `--phc-cream-warm` | `#f6efe1` / `#fbf6ec` | Legacy aliases |
| `--phc-charcoal` | `#1c1c1e` | Body text |
| `--phc-stone` | `#6b6b6b` | Muted text |
| `--phc-navy` | `#0a1f3d` | Headlines, accents |
| `--phc-navy-deep` | `#050f1f` | Deepest navy |
| `--phc-amber` | `#b88a52` | Bronze CTA (toned-down from original gold) |
| `--phc-amber-light` | `#d2a878` | Lighter bronze |
| `--phc-amber-deep` | `#855f2f` | Deep bronze |
| `--phc-success` | `#4d8a5a` | Confirmation/success |

**Typography:**
- **Display headlines:** Fraunces (variable, opsz 144, SOFT 100) — italic for emphasis
- **Body:** Plus Jakarta Sans
- **Logo script:** Pacifico
- All loaded via Google Fonts `@import` at the top of each section

**Aesthetic:** "Restoration Hardware × magazine editorial" — warm cream backgrounds, navy ink, bronze metallic accents, generous whitespace, refined serif headlines with hand-drawn-style amber underlines on emphasized words.

---

## 5. Funnel Architecture

The landing page is a **single GHL funnel page** with:

1. Five Custom HTML/JavaScript blocks stacked top-to-bottom (one per section file)
2. **Plus** a hidden GHL Form Element added separately (in its own column at the bottom) — the form is what actually creates contacts. The visible HTML in Section 1 fills it via JS and clicks its submit button.
3. The hidden form column has Custom Class `phc-hidden-form` and is hidden via **page-level Custom CSS** (NOT via the layers panel eye icon — that's `display:none` which prevents the framework from rendering inputs).

**Page-level Custom CSS for the hidden form** (lives in funnel page Custom CSS, NOT inside any section):

```css
.phc-hidden-form {
  position: absolute !important;
  left: -9999px !important;
  top: 0 !important;
  pointer-events: none !important;
}
```

After form submits, GHL form's "On Submit Action" redirects to the Thank You funnel step (URL slug `thank-you`).

---

## 6. File Inventory

All files live in `D:\Projects\pristine-home-care\`.

| File | Goes in | Status |
|---|---|---|
| `section-1-hero-quiz.html` | Funnel page → Custom HTML #1 | ✅ Light theme converted, SVG logo, contains the **fragile form-fill JS** |
| `section-2-reviews.html` | Funnel page → Custom HTML #2 | ✅ Light theme converted (rotating testimonial marquee + gallery) |
| `section-3-how-it-works.html` | Funnel page → Custom HTML #3 | ✅ Already light, 3 steps with serif numerals |
| `section-4-cta.html` | Funnel page → Custom HTML #4 | ✅ Light theme converted, bronze CTA pill |
| `section-5-footer.html` | Funnel page → Custom HTML #5 | ✅ Light theme converted (Services + FAQ + footer columns + DBA disclosure) |
| `thank-you-page.html` | Thank You funnel step → Custom HTML | ⚠️ Still uses old amber palette + old text logo. NOT yet redesigned to light theme. |
| `privacy-policy.html` | Privacy Policy funnel step → Custom HTML | ✅ Standalone — DO NOT redesign per Byron's request |
| `terms-and-conditions.html` | Terms funnel step → Custom HTML | ✅ Standalone — DO NOT redesign per Byron's request |
| `GHL-HIDDEN-FORM-SKILL.md` | Reference doc | ✅ Battle-tested pattern doc |
| `n8n-workflow-pristine-lead.json` | (unused) | ❌ User rejected n8n — keep as backup only |

---

## 7. Form Integration — DO NOT BREAK

This took 30+ iterations to perfect. **Read `GHL-HIDDEN-FORM-SKILL.md` before touching the form code.**

**The pattern:** Custom HTML quiz collects answers → on submit, JS finds the hidden GHL Form element rendered as inline DIV (`.form-3BBACEcv_x`) → fills inputs using native `HTMLInputElement.prototype.value` setter (bypasses Vue/React framework wrappers) → ticks consent checkboxes via `.click()` → 200ms delay → clicks form's native submit button → GHL handles captcha + creates contact.

**Critical preservation rules in Section 1:**
- All `phc-*` IDs the JS depends on (`phc-quiz`, `phc-firstName`, `phc-lastName`, `phc-phone`, `phc-email`, `phc-consent1`, `phc-submit`, `phc-back`, `phc-address1`, `phc-city`, `phc-zip`)
- The 5 quiz steps with `data-step="1"` through `data-step="5"` and `phc-step` / `phc-hidden` classes
- Functions: `phcSelect`, `phcGoToStep`, `phcSubmit`, `phcScrollToQuiz`
- The `fillHiddenForm()` function inside the IIFE
- The `setReactInputValue()` helper
- Position-based custom field detection (NOT hardcoded random IDs)

**Things that can break it:**
- ❌ Removing the hidden GHL Form element from the page
- ❌ Hiding the hidden form via Layers panel eye icon (uses `display:none`, prevents framework init)
- ❌ Trying postMessage to trigger form submit (GHL has no public submit API)
- ❌ Trying direct POST to `backend.leadconnectorhq.com/forms/submit` (captcha-blocked, 401)
- ❌ Hardcoding `email1` instead of `email` for the email field name
- ❌ Hardcoding the random custom-field IDs (they may change — use position instead)

---

## 8. Funnel Flow

1. **Step 1** — What type of home? (4 photo cards: Apartment / Condo / House / Townhouse)
2. **Step 2** — How many bedrooms? (1 / 2 / 3 / 4+)
3. **Step 3** — How often do you need cleaning? (One-Time / Weekly / Bi-Weekly / Monthly)
4. **Step 4** — Where's the home located? (Street / City / ZIP)
5. **Step 5** — Reveal banner ("Your spot is reserved · We'll reach out in the next 5 minutes") + contact form (First Name, Last Name, Phone, Email) + ONE combined consent checkbox + "Get my free quote" CTA + satisfaction guarantee badge

After submit → redirects to `/thank-you` page.

**Urgency layer:**
- Live activity ticker above quiz (rotates 8 messages every 6s, white pill on cream)
- Eyebrow on Step 1: "Free Quote · 60-second match · No credit card"
- Reveal banner on Step 5: "We'll reach out in the next 5 minutes"
- Satisfaction guarantee: "Not perfect? We re-clean for free."
- Trust bar at bottom: "Georgia's #1 Trusted Home Cleaning Service" + 4.9 stars + 200+ reviews pill

---

## 9. SMS / Compliance

- Single combined consent checkbox (was originally 2 separate boxes for transactional + marketing — merged for UX)
- Consent text covers BOTH transactional and marketing purposes
- A2P 10DLC HELP line: `(516) 589-9288` — must stay this number
- Reply STOP / HELP language included
- Carriers-not-liable disclaimer in Terms

---

## 10. Known Issues / Things To Verify

After light-theme redesign was completed, the following may need a visual check:

1. **Photo cards in Step 1** — still have a dark navy gradient overlay on the photos. May look fine on cream BG (high contrast = pops) or may look heavy. Visual check needed.
2. **Live activity ticker pulse dot** — was green for "live" feel on dark BG. Should still work on light BG but verify it doesn't look like a stoplight.
3. **Thank-you page** — NOT redesigned to light theme. Currently still has the old amber tone and Pacifico-text logo (not SVG). Needs:
   - BG flip from dark to cream
   - Logo swap to SVG
   - Phone number is already `(404) 422-5144`
4. **Quiz card padding** — was widened earlier from 760 → 880 max-width. Verify mobile still feels right.

---

## 11. Pending Work (when picking up)

1. **Test the form submission end-to-end on the live page.** Form integration is solid in code — just needs a publish + incognito test to confirm contacts land in GHL.
2. **Replace `YOUR_PIXEL_ID_HERE`** (×2 in Section 1, ×2 in thank-you page) with real Meta Pixel ID once Byron has it.
3. **Redesign the thank-you page** to match the light theme (cream BG, navy text, bronze accents, SVG logo).
4. **Optional:** GHL automation workflow that texts the lead immediately + alerts Byron's phone for the 5-min response promise. Designed but not yet built.
5. **Optional:** Update photos in Section 1 quiz cards + Section 2 gallery from Unsplash placeholders to real Pristine team / interior photos when uploaded to GHL Media Library.

---

## 12. Voice / Copy Direction

- Premium but warm — Byron's customers have marble counters and brass pendants
- Specific over vague ("60-second match" not "quick quote")
- "We'll reach out in the next 5 minutes" — only works if Byron actually responds that fast (he claims he does)
- Anti-friction microcopy near CTAs ("No credit card · No commitment")
- Highlighted single word in each question with hand-drawn amber underline (e.g. "What type of **home** do you have?")
- DO NOT use: fake countdowns, stock urgency banners, loud red, manipulative dark patterns, "Insured & background-checked" (Byron asked to remove)
- DO use: real social proof, satisfaction guarantee, transparent timing, soft scarcity ("this week's pricing locked in")

---

## 13. Persistent Memory (User-Level)

The following memory files exist for this user across all sessions:

- `C:\Users\gpota\.claude\projects\D--Projects\memory\MEMORY.md`
- `C:\Users\gpota\.claude\projects\D--Projects\memory\user_byron.md`
- `C:\Users\gpota\.claude\projects\D--Projects\memory\reference_pristine_ghl.md`
- `C:\Users\gpota\.claude\projects\D--Projects\memory\reference_ghl_hidden_form_pattern.md`

These auto-load in any new session targeting `D:\Projects`.

---

## 14. House Rules

- **Don't create new docs (.md/README) unless Byron explicitly asks** — he runs lean
- **Always paste-ready** — Byron is non-technical, give him copy-paste blocks not abstract advice
- **Verify before claiming things work** — don't say "fixed!" without a test signal
- **Mention preview panel** when files update (the harness expects it)
- **Don't touch privacy-policy.html or terms-and-conditions.html** — they're standalone, finished
- **Don't break the form integration JS** — read `GHL-HIDDEN-FORM-SKILL.md` first if tempted

---

## END
