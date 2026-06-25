# Academic LMS Design System
## Professional UI/UX Standards (Matching Slog Overs Quality)

---

## 🎨 CORE PRINCIPLES

### 1. **Exact Consistency**
- Every page uses the SAME text sizes, icon sizes, spacing
- No variation - strict adherence to the system
- Professional, not AI-generated looking

### 2. **Clean & Minimal**
- No excessive shadows or gradients
- Simple borders and subtle hover states
- Breathing room between elements

### 3. **Purposeful Typography**
- Limited font sizes - stick to the system
- Consistent font weights
- Proper hierarchy without being flashy

---

## 📐 TYPOGRAPHY (EXACT SIZES)

### Text Sizes (Use ONLY these)
```tsx
// Page titles
text-base font-bold font-[family-name:var(--font-heading)]

// Section titles  
text-base font-bold font-[family-name:var(--font-heading)]

// Card titles
text-sm font-semibold font-[family-name:var(--font-heading)]

// Body text
text-sm

// Secondary text
text-xs text-muted-foreground

// Metadata/labels
text-[11px] text-muted-foreground
text-[10px] text-muted-foreground uppercase tracking-wide

// Tiny text (rare)
text-[9px]
```

---

## 🎯 ICONS (EXACT SIZES)

### Icon Sizes (Use ONLY these)
```tsx
// Large (in hero/headers)
h-5 w-5

// Default (most common)
h-4 w-4

// Small (in badges, tight spaces)
h-3 w-3
h-3.5 w-3.5

// Icon containers
flex h-9 w-9 items-center justify-center rounded-lg  // Default
flex h-10 w-10 items-center justify-center rounded-lg // Slightly larger
flex h-7 w-7 items-center justify-center rounded-lg  // Compact
```

---

## 📦 SPACING (EXACT VALUES)

### Gaps
```tsx
gap-1.5  // Tight (badges, pills)
gap-2    // Close (form fields)
gap-3    // Default (most cards)
gap-4    // Spacious (sections)
```

### Padding
```tsx
p-4      // Default card padding
p-5      // Slightly more padding
px-3 py-2.5  // Compact elements
px-4 py-3    // Standard elements
```

### Margins
```tsx
mb-3     // Between elements
mb-4     // Between sections
mb-5     // Between major sections
```

---

## 🏷️ BADGES (EXACT SIZES)

```tsx
// Default badge
<Badge variant="...">Text</Badge>

// Small badge (most common)
<Badge variant="..." className="text-[10px]">Text</Badge>

// Tiny badge (rare)
<Badge variant="..." className="text-[9px] px-2 py-0.5">Text</Badge>
```

---

## 📊 CARDS (EXACT PATTERNS)

### Standard Card
```tsx
<Card>
  <CardContent className="p-4">
    {/* Content */}
  </CardContent>
</Card>
```

### Clickable Card
```tsx
<Card className="cursor-pointer hover:shadow-sm transition-shadow">
  <CardContent className="p-5">
    {/* Content */}
  </CardContent>
</Card>
```

### Colored Border Card
```tsx
<Card className="border-l-4 border-l-primary">
  <CardContent className="p-4">
    {/* Content */}
  </CardContent>
</Card>
```

---

## 🎨 COLORS (SEMANTIC ONLY)

```tsx
// Status colors
bg-green-50 text-green-600    // Success
bg-blue-50 text-blue-600      // Info
bg-orange-50 text-orange-600  // Warning
bg-red-50 text-red-600        // Error

// Icon containers
bg-primary/10 text-primary
bg-blue-50 text-blue-600
bg-green-50 text-green-600
bg-orange-50 text-orange-600
```

---

## ✅ EXACT PATTERNS FROM SLOG OVERS

### Hero Banner
```tsx
<div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary/80 px-6 py-5 text-white">
  <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-sm font-bold">
        AS
      </div>
      <div>
        <h1 className="text-base font-bold font-[family-name:var(--font-heading)]">Name</h1>
        <p className="text-xs opacity-75">Role • Department</p>
      </div>
    </div>
    <div className="flex items-center gap-5 text-sm">
      <div className="flex items-center gap-1.5">
        <span className="font-bold font-[family-name:var(--font-heading)]">5</span>
        <span className="opacity-70 text-xs">Label</span>
      </div>
    </div>
  </div>
</div>
```

### Stat Card
```tsx
<Card className="cursor-pointer hover:shadow-sm transition-shadow">
  <CardContent className="p-4">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Label</p>
        <p className="text-xl font-bold font-[family-name:var(--font-heading)] truncate">Value</p>
      </div>
    </div>
  </CardContent>
</Card>
```

### List Item
```tsx
<Card className="cursor-pointer hover:shadow-sm transition-shadow">
  <CardContent className="p-5">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-semibold font-[family-name:var(--font-heading)]">Title</h3>
          <Badge variant="..." className="text-[10px]">Status</Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Icon className="h-3 w-3" />
            Text
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-[10px] px-2 py-0.5">Tag</Badge>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## ❌ NEVER USE

- `text-lg`, `text-xl` for regular text (only for numbers/values)
- `h-6 w-6` icons (too large)
- `p-6`, `p-8` for cards (too much padding)
- `shadow-lg`, `shadow-2xl` (too heavy)
- Bright, saturated colors
- Inconsistent spacing

---

## ✅ ALWAYS USE

- `text-sm` for body text
- `text-xs` for secondary text
- `text-[10px]` or `text-[11px]` for labels
- `h-4 w-4` for default icons
- `p-4` or `p-5` for cards
- `hover:shadow-sm` for hover states
- Semantic colors only
- Consistent spacing throughout

---

**This design system ensures every page looks professional, consistent, and polished - exactly like Slog Overs.**
