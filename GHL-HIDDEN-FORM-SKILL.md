# GHL Funnel: Custom HTML Quiz → Hidden GHL Form → Native Submit

A proven pattern for combining a custom-designed quiz/funnel UX with GHL's
native form submission (so contacts get created reliably, captcha is handled,
attribution is preserved). Tested and working on Pristine Home Care funnel.

---

## The architecture

1. **Custom HTML in funnel sections** — designs the entire user-facing experience
   (hero, multi-step quiz, contact form). Lives in Custom HTML/JavaScript blocks
   on the funnel page.
2. **One hidden GHL Form Element** — added to the funnel page via the page
   builder's Form element (NOT via Custom Code embed). Contains every contact
   field the form needs to write: name, phone, email, address, custom fields,
   consent checkboxes.
3. **Off-screen CSS** at the **funnel page level** — pushes the form's section
   to `left: -9999px` so the iframe-free DIV renders into the DOM (so JS can
   access it) but the user never sees it.
4. **JavaScript in Section 1's Custom HTML** — when the visible custom HTML
   form's submit button is clicked, finds the hidden GHL form via DOM, fills
   each input using the native `HTMLInputElement.prototype.value` setter,
   ticks the consent checkboxes via `.click()`, and clicks the form's native
   submit button. GHL handles the rest (captcha, contact creation, redirect).

**Why this works:** GHL renders Form *elements* on funnel pages as inline HTML
(a `<div>` with regular inputs), NOT as cross-origin iframes. So the parent
page's JS can directly read/write the form's inputs.

---

## Step-by-step setup

### 1. Create custom contact fields in GHL

`Settings → Custom Fields → + Add Field`. For each:
- Type: **Single Line** (NOT Dropdown — match the URL-param value to any string)
- Field Key: lowercase_underscore (e.g. `home_type`, `bedrooms`, `frequency`)

### 2. Build the GHL form

`Sites → Forms → Builder → + Create Form`. Drag in:
- Personal: First Name, Last Name, Phone, Email
- Address widget (compound — gives Street, City, State, Country, Postal Code)
- Each custom field (under "Add Object Fields" tab → Custom Fields)
- Two consent checkboxes (with A2P-compliant text)
- Submit button

In the form's **Settings tab**:
- **On Submit Action**: Redirect to URL → `https://yoursite.com/thank-you`
- **Sticky Contact**: ON
- **Create Conversation on Submission**: ON
- Leave **Facebook Pixel ID** blank (the parent funnel page handles Pixel events)

### 3. Add the hidden form to the funnel page

In the funnel page builder:
1. `+ Add Element → Quick Add → 1 Column` — drop a new column at the bottom.
2. Inside that column: `+ Add Element → Forms → Inline Form`.
3. Pick your form in the right sidebar.
4. **Click on the Form element** → right sidebar → **Styles tab** → **Custom Class**
   field → type `phc-hidden-form` → Enter.
5. **CRITICAL**: in the Layers panel, leave the section's eye icon **VISIBLE**
   (not strikethrough). GHL's "hide" toggle uses `display: none` which prevents
   the iframe-free DIV from rendering. We hide via CSS instead.

### 4. Add page-level Custom CSS

Open the funnel page's **Custom CSS** dialog (page-level, not form-level — the
form's own Custom CSS field doesn't reach the rendered DIV in some GHL versions).

Paste:

```css
.phc-hidden-form {
  position: absolute !important;
  left: -9999px !important;
  top: 0 !important;
  pointer-events: none !important;
}
```

**Don't** use `display: none`, `visibility: hidden`, `width: 1px`, or `opacity: 0`
— those can prevent the form's framework from initializing or finding inputs.

**Don't** apply CSS to descendants (`.phc-hidden-form *`) — that breaks the
internal layout the framework needs.

### 5. Custom HTML for Section 1 (the quiz + visible contact form)

The visible form should collect: First Name, Last Name, Phone, Email, both
consent checkboxes. Address is collected in a quiz step (Street/City/Zip).
Quiz answers are stored in a `data` object.

The submit handler must:
1. Validate fields.
2. Find `.form-XXXXX` (the hidden form's auto-generated class — get this from
   the form's right-sidebar **CSS Selector** field in the GHL form builder,
   or from inspecting the live page).
3. Fill standard fields by name (`first_name`, `last_name`, `phone`, `email`,
   `address`, `city`, `state`, `country`, `postal_code`).
4. Fill custom fields **by position** (NOT by hardcoded random ID — GHL may
   regenerate them).
5. Tick consent checkboxes via `.click()` (not `.checked = true` — the
   framework needs the click event).
6. Click the form's submit button.

---

## The critical JS patterns

### Bypass the framework with native value setter

GHL forms use a JS framework (Vue or React). Setting `input.value = X` directly
gets ignored — the framework's tracked state stays empty and submission sends
empty values. Use the native HTMLInputElement setter to write values that
the framework picks up:

```js
function setReactInputValue(input, value) {
  var proto = input.tagName === 'TEXTAREA'
    ? window.HTMLTextAreaElement.prototype
    : window.HTMLInputElement.prototype;
  var setter = Object.getOwnPropertyDescriptor(proto, 'value');
  if (setter && setter.set) setter.set.call(input, value);
  else input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}
```

### Find custom fields by position, not by name

GHL auto-generates random IDs for custom field input names (e.g.
`Ub3svWk2B7rhCBya6vSS`). These can change across page loads or when the form
is edited. **Don't hardcode them.** Filter out known field names and the
remaining text inputs ARE the custom fields, in form-builder order:

```js
var knownNames = ['first_name','last_name','phone','email','email1',
                  'address1','address','street_address',
                  'city','state','country','postal_code','postalCode',
                  'Search']; // 'Search' = address autocomplete input

var customTextInputs = Array.from(form.querySelectorAll('input[type="text"]'))
  .filter(function (i) { return knownNames.indexOf(i.name) === -1; });

// customTextInputs[0] = first custom field in form order
// customTextInputs[1] = second custom field
// etc.
```

### Tick checkboxes with .click(), not .checked = true

```js
form.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
  if (!cb.checked) cb.click(); // triggers framework's change handler
});
```

### Delay the submit click slightly

After filling all values, give the framework ~200ms to register state before
clicking submit. Otherwise the framework may validate against stale empty state:

```js
setTimeout(function () {
  form.querySelector('button[type="submit"], button').click();
}, 200);
```

---

## Diagnostic console snippet

Run this on the live page at the form-render step to inspect everything:

```js
const f = document.querySelector('.form-XXXXX');
console.log('Total inputs:', f.querySelectorAll('input,textarea,select').length);
Array.from(f.querySelectorAll('input,textarea,select')).forEach((i, idx) =>
  console.log((idx+1)+'.', i.type, '| name:', i.name||'(none)', '| value:', i.value||'(empty)')
);
```

Replace `form-XXXXX` with the form's actual class (find it in the GHL form
builder's right sidebar **CSS Selector** field, or inspect the live page).

---

## Gotchas

| Symptom | Cause | Fix |
|---|---|---|
| `0 GHL iframe(s) found` | Form section was hidden via Layers eye icon (display:none) | Unhide; use off-screen CSS instead |
| `input not found for name="..."` | Hardcoded random ID changed across page loads | Use position-based custom field detection |
| Form reaches "Sending..." and hangs | Required field wasn't filled | Check ALL custom field positions are filled |
| Field filled but value empty in GHL | Framework ignored direct `.value = X` assignment | Use the native setter pattern |
| Address fields empty even though URL params sent | Form doesn't have address fields, and custom-field URL params aren't auto-captured | Add Address widget to the form |
| Consent checkboxes don't tick framework state | Used `.checked = true` instead of `.click()` | Use `.click()` |

---

## What doesn't work (don't waste time trying)

- ❌ **Direct POST to `backend.leadconnectorhq.com/forms/submit`** — GHL enforces
  reCAPTCHA v3 server-side; returns 401 without a valid token.
- ❌ **postMessage to a GHL form iframe to trigger submit** — no public API.
- ❌ **Custom Code embed (iframe) version of the form** — cross-origin DOM
  access is blocked, so you can't fill fields programmatically. Only the Form
  *element* renders inline.
- ❌ **The Form's own Custom CSS field** — in some GHL versions it doesn't
  apply to the rendered DIV (likely because it's scoped to the iframe-version
  of the same form, which isn't what's rendering on the funnel).
- ❌ **GHL's "Hidden" toggle on form fields** — this UI option doesn't exist
  in current GHL form builder.
- ❌ **GHL Workflow capturing URL parameters** — workflow trigger variables
  in current GHL only expose `Contact` + `Custom Values` categories, no URL
  parameters from the form's source page.
- ❌ **`display: none` on the form section** — prevents the framework from
  initializing inputs in the DOM. Position off-screen instead.

---

## What DOES auto-capture even without a form field

GHL automatically writes URL parameters to **standard contact fields** when
ANY form is submitted, even if the form doesn't have those fields:
- `?city=...` → contact.city
- `?state=...` → contact.state
- `?postal_code=...` → contact.postalCode
- `?country=...` → contact.country

Custom fields are NOT auto-captured this way — they MUST be on the form.

---

## Project this was developed on

Pristine Home Care funnel. Form ID: `bBWtxzVyzLdqPoTylrnU`. Form's auto-generated
class: `.form-3BBACEcv_x` (specific to that form). See files in
`D:\Projects\pristine-home-care\` for the working implementation.
