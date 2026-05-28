# Al-Infaaq Design System Guide
> **The $500M Stripe-Level Design Standard for Anonymous Sadaqah Operations**
>
> This document governs the visual direction, component guidelines, color tokens, and layout schemas of the Al-Infaaq workspace. It bridges the gap between sacred charity and elite fintech user interfaces.

---

## 1. Design Philosophy

Al-Infaaq is built on three core pillars: **Anonymity (Sadaqah), Integrity (Trustee Review), and Velocity (Payment Orchestration)**. The design must reflect these principles by being **quiet, precise, premium, and devout**.

```
   ┌─────────────────────────────────────────────────────────┐
   │                       SACRED GOLD                       │
   │           Devotion, Humility, Eternal Rewards           │
   └───────────────┬─────────────────────────┬───────────────┘
                   │                         │
   ┌───────────────▼─────────┐     ┌─────────▼───────────────┐
   │     LIVING EMERALD      │     │     OBSIDIAN STONE      │
   │  Trust, Growth, Action  │     │ Anonymity, Strength, UI │
   └─────────────────────────┘     └─────────────────────────┘
```

*   **Elite Restraint (Stripe-Level):** Avoid loud borders, heavy shadows, or over-saturated gradients. Use sub-pixel borders (`border-stone-200/60`), custom micro-shadows, and clean, responsive transitions.
*   **Sacred Visual Cues:** Align elements around clean geometry, rich organic tones (stone, sand, emerald, charcoal), and delicate typography. Headings are sharp and clear, body copy is readable and airy, and status labels are refined.
*   **The Privacy Shield:** Design interfaces so that confidential information (donor identity) is physically isolated. Use visual signifiers like "Privacy Shield active" badges, blurred states, or optional hidden history modes.

---

## 2. Color Palette & Theme Tokens

The design system is built on Tailwind CSS v4 CSS custom properties, mapped under `@theme inline` in `packages/ui/src/globals.css`.

### 2.1 CSS Theme Variables
```css
:root {
  /* --- Stone & Earth (Base Surfaces) --- */
  --background-light: #f7f5ef;      /* Sacred off-white stone */
  --background-card: #ffffff;       /* Pure white card surface */
  --background-dark: #12110e;       /* Deep volcanic stone (Dark mode) */
  
  /* --- Carbon & Slate (Typography) --- */
  --foreground-light: #17130d;      /* Near black carbon */
  --foreground-dark: #fbfaf6;       /* Bright stone white */
  --muted-light: #6e675f;           /* Sandstone gray */
  --muted-dark: #b8b3ac;            /* Muted warm grey */

  /* --- Living Emerald (Primary Brand / Success) --- */
  --emerald-500: #10b981;           /* Vibrant emerald */
  --emerald-600: #059669;           /* Mid-tone emerald */
  --emerald-700: #047857;           /* Deep mosque emerald */
  --emerald-950: #022c22;           /* Forest black emerald */

  /* --- Sacred Gold (Secondary / Warnings / Accents) --- */
  --gold-100: #fef3c7;              /* Muted sand-gold */
  --gold-500: #d97706;              /* Amber gold */
  --gold-600: #b45309;              /* Burnished gold */
  --gold-950: #451a03;              /* Deep brass */

  /* --- Carbon Border / Slate Boundaries --- */
  --border-light: rgba(23, 19, 13, 0.08); /* 8% carbon overlay */
  --border-dark: rgba(251, 250, 246, 0.1);  /* 10% stone overlay */
  
  /* --- Interactive States & Rings --- */
  --focus-ring: #059669;            /* Focus ring using emerald-600 */
}
```

### 2.2 Dark Mode Mappings
Al-Infaaq uses a token-driven dark mode mapping system. Avoid writing explicit `dark:` classes for core colors where possible; rely on global CSS variables that flip values when the `.dark` class is present:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-border: var(--border-color);
  --color-muted: var(--muted-color);
}

:root {
  --background: var(--background-light);
  --foreground: var(--foreground-light);
  --border-color: var(--border-light);
  --muted-color: var(--muted-light);
}

.dark {
  --background: var(--background-dark);
  --foreground: var(--foreground-dark);
  --border-color: var(--border-dark);
  --muted-color: var(--muted-dark);
}
```

---

## 3. Typography & Grids

### 3.1 Font Families
*   **Primary Sans:** `Geist Sans` or `Inter` (`font-sans`). Used for layout, dashboards, buttons, and numeric tables. Tighten tracking slightly for headers (`tracking-tight`) and set to normal for body copy.
*   **Decorative Serif (Optional):** A classical serif (e.g., `Playfair Display` or `Lora`) can be used in blockquotes for Quranic verses or Hadith references (e.g., *“The example of those who spend their wealth in the way of Allah...”*).

### 3.2 Typography Scale
```ts
// Font size guideline
h1: text-3xl font-semibold sm:text-5xl tracking-tight leading-none
h2: text-2xl font-semibold tracking-tight
h3: text-lg font-semibold tracking-normal
body: text-base leading-7 text-muted
caption: text-xs font-medium tracking-wider text-muted/80
```

### 3.3 Dashboard Layout & Grids
All workspaces (Spender, Foundation, Trustee, Admin) adhere to a unified layout framework:
*   **Max-Width Container:** `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8` to enforce alignment.
*   **Density:** Keep spacing tight but readable. Prefer `p-4` or `p-5` for cards.
*   **Layout Splits:** Use a `grid grid-cols-1 lg:grid-cols-3 gap-6` split. Two-thirds for main actions/charts, one-third for utility panels, checklists, or quick-stats.

---

## 4. Interactive Design & Motion

Stripe’s signature aesthetic is defined by physical feedback and buttery smooth transitions.

*   **Subtle Spring Lift:** Interactive cards should elevate and scale gently on hover.
    ```css
    .interactive-card {
      transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 200ms ease;
    }
    .interactive-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
    }
    ```
*   **Button Press Feedback:** All interactive items compress slightly when clicked.
    ```css
    .btn-press:active {
      transform: scale(0.98);
    }
    ```
*   **Subtle Status Glow:** A breathing pulsing effect for active indicators (e.g., "Live" fundraising or "Approved" reviews):
    ```css
    @keyframes pulse-glow {
      0%, 100% { opacity: 0.8; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.05); }
    }
    .status-glow {
      animation: pulse-glow 2s infinite ease-in-out;
    }
    ```

---

## 5. Component Blueprint System

### 5.1 Buttons
Use Tailwind CSS classes mapped to the shared UI buttons.

```tsx
// Packages/ui/src/components/button.tsx
import { cn } from "../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-150 btn-press active:scale-[0.98]",
        // Variants
        variant === 'primary' && "bg-[#17130d] text-white hover:bg-stone-800 dark:bg-[#fbfaf6] dark:text-stone-950 dark:hover:bg-stone-200 shadow-sm",
        variant === 'secondary' && "bg-[#047857] text-white hover:bg-emerald-800 dark:bg-[#059669]",
        variant === 'outline' && "border border-stone-200 bg-white text-stone-900 hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100",
        variant === 'ghost' && "text-stone-700 hover:bg-stone-100/80 dark:text-stone-300 dark:hover:bg-stone-850",
        // Sizes
        size === 'sm' && "h-8 px-3 text-xs",
        size === 'md' && "h-10 px-4 text-sm",
        size === 'lg' && "h-12 px-6 text-base",
        size === 'icon' && "size-10 p-0",
        className
      )}
      {...props}
    />
  );
}
```

### 5.2 Cards with Gradient Borders
A signature Stripe-style design detail: a card with a subtle gradient border that looks like light catching an edge.

```tsx
export function PremiumCard({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn(
      "relative rounded-xl border border-stone-200/60 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-stone-800/80 dark:bg-stone-950",
      className
    )}>
      {/* Decorative gradient border highlight */}
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent pointer-events-none" />
      {children}
    </div>
  );
}
```

### 5.3 Standard Forms & Inputs
Forms should use standard controls from `packages/ui` and match **Section 8 (Form System & Input Standardization)** of `code-culture.md`.

```tsx
// Pattern for forms: useZodForm + Field wrappers + InputField
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <InputField
      control={form.control}
      name="title"
      label="Donation Request Title"
      placeholder="e.g. Ramadan Food Baskets"
      description="Keep it clear and focused on the immediate operational need."
    />
    
    <Field.Group className="grid grid-cols-2 gap-4">
      <InputField
        control={form.control}
        name="targetNaira"
        label="Funding Goal (NGN)"
        type="number"
        prefix="₦"
      />
      <SelectField
        control={form.control}
        name="category"
        label="Category"
        options={[
          { label: "Water", value: "water" },
          { label: "Food", value: "food" },
          { label: "Shelter", value: "shelter" },
          { label: "Masjid Repair", value: "masjid" }
        ]}
      />
    </Field.Group>

    <SubmitButton isSubmitting={form.formState.isSubmitting}>
      Publish Request
    </SubmitButton>
  </form>
</Form>
```

### 5.4 Data Tables (Section 7 Pattern)
Use dense headers, light rows, and subtle zebra stripes or hover states. Keep values clean and numbers tabular-numeric.

```tsx
// Using CSS tabular-nums for aligned financial columns
<td className="px-4 py-3 text-right font-mono text-sm tabular-nums">
  ₦2,400,000
</td>
```

---

## 6. Role-Specific Dashboard Blueprints

### 6.1 Spender Workspace (Al-Muhsin)
*   **Core UI Goals:** Preserve anonymity, track goals quietly, minimize distraction.
*   **Features:**
    *   *Anonymous Wallet Grid:* Clear cards showing total spent in the cause of Allah. Shows a toggled "Privacy Shield" which blur values using a CSS filter (`blur-md transition-all duration-300`).
    *   *Progress Dial:* A clean SVG circle progress tracking the spender's monthly goal (e.g. ₦75,000).
    *   *Reminder Configuration:* Quiet options to receive email notifications (weekly/monthly/none) without retaining long-term tracking.

### 6.2 Foundation Workspace
*   **Core UI Goals:** Professional organization, verified identity, fast request updates.
*   **Features:**
    *   *Banner Workspace:* Generate beautiful, high-contrast, QR-backed SVGs for print or sharing.
    *   *Request Pipeline:* Cards representing requests (Draft, Review, Published, Funded) with clear target progress bars.
    *   *Trust Status Badge:* Highlights "Approved" (green check with a Trustee name indicator) vs "Pending Review" (warning gold).

### 6.3 Trustee Queue
*   **Core UI Goals:** Fast evaluation, security, and verification accountability.
*   **Features:**
    *   *Review Checklist Card:* Shows foundation registration docs side-by-side with the review decision form.
    *   *Evaluation Drawer:* Quick slider to approve/reject, add notes, and record Trustee ID.

### 6.4 Admin Command Center
*   **Core UI Goals:** Global operational health, audit log inspection, and payout reconciliation.
*   **Features:**
    *   *Metric Strips:* Total processing volume, active channels (Paystack vs Lemon Squeezy), system status logs.
    *   *Audit Log Timeline:* Clean vertical list of events (e.g., "Foundation Amanah Care approved by Trustee Farooq").

---

## 7. Accessibility & Verification Checklist

To maintain Stripe-level standard, UI builders must verify:
*   **Focus Ring Indicators:** Every interactive element must show a distinct outline ring (`focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2`).
*   **WCAG Contrast Baseline:** Minimum contrast of 4.5:1 for body copy. Avoid light gray text on off-white backgrounds. Use `--muted-light` which provides proper contrast.
*   **Semantic Elements:** Wrap main content in `<main>`, headers in `<header>`, tables in `<table>` with `<thead>` and `<tbody>`, and sections in `<section>` with clear headings.
*   **Tab-Index & Keyboard Navigation:** All modal overlays (`composite/dialog`) trap focus automatically and can be dismissed via the `Esc` key.
*   **Loading & Empty States:** Always verify loaders (`lucide-react`'s `Loader2` rotating with `animate-spin`) and empty state illustrations.
