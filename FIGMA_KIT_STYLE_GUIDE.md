# Figma Kit Component Style Guide

This guide documents the styling patterns, design tokens, and component specifications from the `figma-kit` folder to help match the Figma UI aesthetic in your plugin.

## Table of Contents
- [Design Tokens](#design-tokens)
- [Component Library](#component-library)
- [Color System](#color-system)
- [Best Practices](#best-practices)

---

## Design Tokens

### Spacing Scale
All spacing uses a consistent scale based on `rem` units:

```css
--space-0: 0rem;
--space-px: 0.0625rem;     /* 1px */
--space-0_5: 0.125rem;     /* 2px */
--space-1: 0.25rem;        /* 4px */
--space-1_5: 0.375rem;     /* 6px */
--space-2: 0.5rem;         /* 8px */
--space-2_5: 0.625rem;     /* 10px */
--space-3: 0.75rem;        /* 12px */
--space-3_5: 0.875rem;     /* 14px */
--space-4: 1rem;           /* 16px */
--space-5: 1.25rem;        /* 20px */
--space-6: 1.5rem;         /* 24px */
--space-8: 2rem;           /* 32px */
--space-12: 3rem;          /* 48px */
--space-16: 4rem;          /* 64px */
```

**Usage**: `padding: var(--space-2);` for 8px padding

### Border Radius
```css
--radius-extra-small: 0.0625rem;  /* 1px */
--radius-small: 0.125rem;         /* 2px */
--radius-medium: 0.3125rem;       /* 5px */
--radius-large: 0.8125rem;        /* 13px */
--radius-full: 9999px;            /* Circular */
--radius-default: var(--radius-small);
```

**Common usage**:
- Buttons, inputs, checkboxes: `--radius-medium`
- Dialogs, menus: `--radius-large`
- Circular elements (radio, switches): `--radius-full`

### Typography
```css
--font-family-default: Inter, ui-sans-serif, system-ui, sans-serif;
--font-family-monospace: 'Roboto Mono', monospace;

/* Font sizes */
--font-size-1: 11px;   /* Small text */
--font-size-3: 12px;   /* Default */
--font-size-5: 14px;   /* Large */

/* Font weights */
--font-weight-default: 400;
--font-weight-strong: 600;

/* Line heights */
--line-height-1: 16px;
--line-height-3: 16px;
--line-height-5: 20px;

/* Letter spacing */
--letter-spacing-default: 0.005em;
```

### Shadows (Elevation)
```css
/* Light theme */
--elevation-100: 0px 0px 0.5px rgba(0,0,0,0.3), 0px 1px 3px rgba(0,0,0,0.15);
--elevation-200: 0px 0px 0.5px rgba(0,0,0,0.18), 0px 3px 8px rgba(0,0,0,0.1);
--elevation-300: 0px 0px 0.5px rgba(0,0,0,0.15), 0px 5px 12px rgba(0,0,0,0.13);
--elevation-400: 0px 0px 0.5px rgba(0,0,0,0.12), 0px 10px 16px rgba(0,0,0,0.12);

/* Dark theme includes inset highlights */
/* Automatically switches based on .dark or .dark-theme class */
```

**Usage**:
- Tooltips: `--elevation-300`
- Menus, dropdowns: `--elevation-400`
- Slider thumbs: `--elevation-200`

---

## Color System

### Figma Color Variables
The kit uses Figma's native color tokens that automatically adapt to light/dark themes:

#### Backgrounds
```css
--figma-color-bg                    /* Primary background */
--figma-color-bg-secondary          /* Input fields, secondary surfaces */
--figma-color-bg-tertiary           /* Subtle backgrounds */
--figma-color-bg-brand              /* Primary action (blue) */
--figma-color-bg-brand-pressed      /* Active state */
--figma-color-bg-brand-tertiary     /* Very subtle brand tint */
--figma-color-bg-danger             /* Destructive actions (red) */
--figma-color-bg-danger-pressed     /* Destructive active state */
--figma-color-bg-success            /* Success state (green) */
--figma-color-bg-success-pressed    /* Success active state */
--figma-color-bg-pressed            /* Generic pressed state */
--figma-color-bg-selected           /* Selected items (subtle) */
--figma-color-bg-selected-strong    /* Selected items (prominent) */
--figma-color-bg-disabled           /* Disabled elements */
--figma-color-bg-onselected         /* Text on selected bg */
```

#### Text
```css
--figma-color-text                  /* Primary text */
--figma-color-text-secondary        /* Less prominent text */
--figma-color-text-tertiary         /* Subtle text, placeholders */
--figma-color-text-disabled         /* Disabled text */
--figma-color-text-brand            /* Brand colored text (links) */
--figma-color-text-onbrand          /* Text on brand background */
--figma-color-text-ondanger         /* Text on danger background */
--figma-color-text-onsuccess        /* Text on success background */
--figma-color-text-ondisabled       /* Text on disabled background */
--figma-color-text-oncomponent      /* Text on dark components (menus) */
--figma-color-text-oncomponent-secondary
--figma-color-text-oncomponent-tertiary
```

#### Borders & Icons
```css
--figma-color-border                /* Default borders */
--figma-color-border-strong         /* Prominent borders */
--figma-color-border-disabled       /* Disabled borders */
--figma-color-border-disabled-strong
--figma-color-border-selected       /* Focus/selected state */
--figma-color-border-selected-strong
--figma-color-border-onbrand-strong
--figma-color-border-danger-strong
--figma-color-border-success-strong

--figma-color-icon                  /* Primary icons */
--figma-color-icon-secondary
--figma-color-icon-tertiary
--figma-color-icon-disabled
--figma-color-icon-brand
--figma-color-icon-onbrand
--figma-color-icon-ondanger
--figma-color-icon-onsuccess
--figma-color-icon-oncomponent      /* Icons in menus */
```

#### Component-Specific Colors
```css
/* Menus & Dropdowns */
--color-bg-menu: #1e1e1e
--color-bg-menu-hover: #2c2c2c
--color-bg-menu-selected: var(--figma-color-bg-selected-strong)
--color-border-menu: #383838
--color-text-menu: var(--figma-color-text-oncomponent)
--color-icon-menu: var(--figma-color-icon-oncomponent)

/* Tooltips */
--color-bg-tooltip: #1e1e1e
--color-text-tooltip: #fff

/* Dialogs */
--color-overlay-dialog: #00000080  /* 50% black overlay */
```

---

## Component Library

### Button

**Variants**:
- `primary` - Blue brand color, high emphasis
- `secondary` - Transparent with border (default)
- `inverse` - For dark backgrounds
- `destructive` - Red, for dangerous actions
- `success` - Green, for positive actions
- `text` - No background or border

**Sizes**:
- `small` - 24px height (default)
- `medium` - 32px height

**Props**:
- `fullWidth` - Stretches to container width

**CSS Classes**:
```css
.fp-Button                    /* Base class */
.fp-variant-primary          /* Blue filled button */
.fp-variant-secondary        /* Default outlined button */
.fp-variant-destructive      /* Red filled button */
.fp-size-small               /* 24px height */
.fp-size-medium              /* 32px height */
.fp-full-width               /* Width: 100% */
```

**Key Styles**:
```css
border-radius: var(--radius-medium);
font-size: var(--font-size-default);
font-weight: var(--font-weight-default);
outline-offset: -1px;          /* Inner outline */
outline-width: 1px;
cursor: default;               /* Figma uses default, not pointer */
user-select: none;
```

**States**:
- `:active` - Darker background
- `:focus-visible` - Selected border color
- `:disabled` - Reduced opacity, disabled colors

**Usage Example**:
```tsx
import { Button } from '@figma-kit/components/button';

<Button variant="primary" size="small">Create</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="destructive">Delete</Button>
```

---

### Input

**CSS Class**: `.fp-Input`

**Key Styles**:
```css
height: var(--space-6);               /* 24px */
padding: var(--space-1) 0 var(--space-1) var(--space-2);
background-color: #383838;            /* Darker input background */
border: 1px solid #444444;            /* Subtle border */
border-radius: var(--radius-medium);
outline: none;

/* States */
&:hover:not(:disabled, :focus) {
  border-color: #8c8c8c;
}

&:focus {
  border-color: var(--figma-color-border-selected);
}

&::placeholder {
  color: var(--figma-color-text-tertiary);
}
```

**Props**:
- `selectOnClick` - Selects all text when clicked

**Usage Example**:
```tsx
import { Input } from '@figma-kit/components/input';

<Input 
  placeholder="Enter name..."
  selectOnClick
/>
```

---

### Slider

**CSS Classes**:
- `.fp-SliderRoot` - Container
- `.fp-SliderTrack` - Background track
- `.fp-SliderRange` - Filled portion (brand color)
- `.fp-SliderThumb` - Draggable handle

**Key Styles**:
```css
/* Track */
--slider-track-size: var(--space-4);         /* 16px height */
--slider-thumb-width: var(--space-4);        /* 16px */
background: var(--figma-color-bg-secondary);
border-radius: var(--radius-full);
outline: 1px solid rgba(0,0,0,0.1);         /* Subtle border */

/* Range (filled portion) */
background-color: var(--figma-color-bg-brand);

/* Thumb */
width: var(--space-4);
height: var(--space-4);
border: 4px solid var(--figma-color-icon-onbrand);
background-color: transparent;
border-radius: var(--radius-full);
box-shadow: var(--elevation-200);
```

**Props**:
- `min`, `max` - Value range
- `value`, `defaultValue` - Current value(s)
- `range` - Show filled range (default: true)
- `hints` - Array of snap points
- `orientation` - 'horizontal' | 'vertical'

**Usage Example**:
```tsx
import { Slider } from '@figma-kit/components/slider';

<Slider 
  min={0}
  max={100}
  defaultValue={[50]}
  hints={[0, 25, 50, 75, 100]}
/>
```

---

### Checkbox

**Structure**:
```tsx
<Checkbox.Root>
  <Checkbox.Input />
  <Checkbox.Label>Label text</Checkbox.Label>
  <Checkbox.Description>Helper text</Checkbox.Description>
</Checkbox.Root>
```

**CSS Classes**:
- `.fp-CheckboxRoot` - Grid container
- `.fp-CheckboxInput` - 16px square checkbox
- `.fp-CheckboxIndicator` - Checkmark/indeterminate icon
- `.fp-CheckboxLabel` - Label text
- `.fp-CheckboxDescription` - Secondary text

**Key Styles**:
```css
/* Input */
width: var(--space-4);               /* 16px */
height: var(--space-4);
border: 1px solid var(--figma-color-border-strong);
border-radius: var(--radius-medium);

&:checked {
  background-color: var(--figma-color-bg-brand);
  border-color: transparent;
}

&:focus-visible {
  outline: 1px solid var(--figma-color-border-selected);
}
```

**Usage Example**:
```tsx
import * as Checkbox from '@figma-kit/components/checkbox';

<Checkbox.Root>
  <Checkbox.Input />
  <Checkbox.Label>Enable feature</Checkbox.Label>
  <Checkbox.Description>Optional description</Checkbox.Description>
</Checkbox.Root>
```

---

### Radio Group

**Structure**:
```tsx
<RadioGroup.Root>
  <RadioGroup.Label>
    <RadioGroup.Item value="option1" />
    Option 1
  </RadioGroup.Label>
  <RadioGroup.Label>
    <RadioGroup.Item value="option2" />
    Option 2
  </RadioGroup.Label>
</RadioGroup.Root>
```

**CSS Classes**:
- `.fp-RadioGroupRoot` - Flex container
- `.fp-RadioGroupItem` - 16px circular radio button
- `.fp-RadioGroupLabel` - Label with gap

**Key Styles**:
```css
/* Item */
width: 16px;
height: 16px;
border: 4px solid transparent;
border-radius: var(--radius-full);
outline: 1px solid var(--figma-color-icon);

&[data-state='checked'] {
  background-color: var(--figma-color-icon);
  border-color: var(--figma-color-bg);
}

/* Root orientation */
&[data-orientation='horizontal'] {
  gap: var(--space-5);
}

&[data-orientation='vertical'] {
  flex-direction: column;
  gap: var(--space-2);
}
```

**Props**:
- `orientation` - 'horizontal' | 'vertical' (default: horizontal)
- `value`, `defaultValue` - Selected option
- `disabled` - Disable all options

---

### Switch

**CSS Classes**:
- `.fp-switchRoot` - Track container
- `.fp-switchThumb` - Draggable toggle

**Key Styles**:
```css
/* Root */
width: var(--space-6);               /* 24px */
height: var(--space-3);              /* 12px */
background: linear-gradient(
  90deg, 
  var(--figma-color-bg-brand) 0px 24px,    /* On state */
  var(--figma-color-icon-tertiary) 24px 48px  /* Off state */
);
background-size: 200% 100%;
transition: background-position 0.1s ease-out;

&[data-state='checked'] {
  background-position: 0;
}

&[data-state='unchecked'] {
  background-position: -24px;
}

/* Thumb */
width: var(--space-2_5);             /* 10px */
height: var(--space-2_5);
background: var(--figma-color-icon-onbrand);
border-radius: var(--radius-full);
transition: all 0.1s ease-out;
```

**Usage Example**:
```tsx
import { Switch } from '@figma-kit/components/switch';

<Switch 
  checked={isEnabled}
  onCheckedChange={setIsEnabled}
/>
```

---

### Select (Dropdown)

**Structure**:
```tsx
<Select.Root>
  <Select.Trigger placeholder="Choose..." />
  <Select.Content>
    <Select.Item value="1">Option 1</Select.Item>
    <Select.Item value="2">Option 2</Select.Item>
    <Select.Separator />
    <Select.Group>
      <Select.Label>Group</Select.Label>
      <Select.Item value="3">Option 3</Select.Item>
    </Select.Group>
  </Select.Content>
</Select.Root>
```

**CSS Classes**:
- `.fp-SelectTrigger` - Button-like trigger
- `.fp-MenuContent` - Dropdown menu (shares menu styles)
- `.fp-MenuItem` - Individual option
- `.fp-MenuSeparator` - Divider line

**Key Styles**:
```css
/* Trigger */
height: var(--space-6);
padding: 0 0 0 var(--space-2);
border: 1px solid var(--figma-color-border);
border-radius: var(--radius-medium);

/* Menu Content */
padding: var(--space-2);
background-color: var(--color-bg-menu);
border-radius: var(--radius-large);
box-shadow: var(--elevation-400);
font-size: 12px;

/* Item */
height: var(--space-6);
padding: 0 var(--space-2);
border-radius: var(--radius-medium);

&[data-highlighted] {
  background-color: var(--color-bg-menu-selected);
}
```

**Props**:
- `portal` - Render in portal (default: false)

---

### Icon Button

**Variants**:
- `activeAppearance`:
  - `subtle` - Light selected background (default)
  - `solid` - Strong selected background

**Sizes**:
- `small` - 24px × 24px (default)
- `medium` - 32px × 32px

**CSS Classes**:
```css
.fp-IconButton
.fp-size-small
.fp-size-medium
.fp-active-appearance-subtle
.fp-active-appearance-solid
```

**Key Styles**:
```css
display: flex;
align-items: center;
justify-content: center;
padding: 0;
border: 0;
background-color: transparent;
border-radius: var(--radius-medium);
--color-icon: var(--figma-color-icon);

&:hover:not(:disabled) {
  background-color: var(--figma-color-bg-pressed);
}

&[data-state='open'].fp-active-appearance-subtle {
  background-color: var(--figma-color-bg-selected);
  --color-icon: var(--figma-color-icon-brand);
}

&[data-state='open'].fp-active-appearance-solid {
  background-color: var(--figma-color-bg-selected-strong);
  --color-icon: var(--figma-color-icon-onbrand);
}
```

**Props**:
- `aria-label` - Required for accessibility
- `tooltipContent` - Optional custom tooltip
- `disableTooltip` - Disable automatic tooltip

**Usage Example**:
```tsx
import { IconButton } from '@figma-kit/components/icon-button';
import { PlusIcon } from '@figma-kit/components/icons';

<IconButton 
  aria-label="Add item"
  size="small"
>
  <PlusIcon />
</IconButton>
```

---

### Dialog

**Structure**:
```tsx
<Dialog.Root>
  <Dialog.Trigger>
    <Button>Open</Button>
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content size="2">
      <Dialog.Title>Title</Dialog.Title>
      <Dialog.Close />
      {/* Content */}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

**CSS Classes**:
- `.fp-DialogBaseOverlay` - Background overlay
- `.fp-DialogContent` - Modal content
- `.fp-DialogBaseTitle` - Title text

**Sizes**:
- `1` - 288px width
- `2` - 352px width (default)
- `3` - 448px width
- `fullscreen` - Full viewport

**Placement**:
- `center` - Vertically and horizontally centered
- `top` - Top aligned, horizontally centered (default)

**Key Styles**:
```css
/* Overlay */
background-color: var(--color-overlay-dialog);  /* #00000080 */

/* Content */
position: fixed;
max-width: calc(100vw - 32px);
max-height: 80%;
border-radius: var(--radius-large);
background-color: var(--figma-color-bg);

&.fp-placement-top {
  top: min(10vh, 80px);
  left: 50%;
  transform: translateX(-50%);
}

&.fp-placement-center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

**Props**:
- `width`, `maxWidth`, `height`, `maxHeight` - Custom dimensions

---

### Tabs

**Structure**:
```tsx
<Tabs.Root defaultValue="tab1">
  <Tabs.List>
    <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
    <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="tab1">Content 1</Tabs.Content>
  <Tabs.Content value="tab2">Content 2</Tabs.Content>
</Tabs.Root>
```

**CSS Classes**:
- `.fp-TabsList` - Horizontal tab container
- `.fp-TabsTrigger` - Individual tab button
- `.fp-TabsContent` - Content panel

**Key Styles**:
```css
/* Trigger */
height: var(--space-6);
padding: 0 var(--space-2);
white-space: nowrap;

&[data-state='inactive'] {
  color: var(--figma-color-text-secondary);
  --color-icon: var(--figma-color-icon-secondary);
}

&[data-state='active'] {
  font-weight: var(--font-weight-strong);
  color: var(--figma-color-text);
  background: var(--figma-color-bg-secondary);
  border-radius: var(--radius-medium);
}
```

**Note**: Tab width is automatically fixed on first render to prevent layout shift when font-weight changes.

---

### Textarea

**CSS Class**: `.fp-textarea`

**Key Styles**:
```css
padding: var(--space-1) var(--space-2);
background-color: var(--figma-color-bg-secondary);
border-radius: var(--radius-medium);
outline: 1px solid transparent;
resize: none;                        /* Auto-resizes via react-textarea-autosize */
word-break: break-word;

&:hover:not(:disabled, :focus) {
  outline-color: var(--figma-color-border);
}

&:focus {
  outline-color: var(--figma-color-border-selected);
}
```

**Usage Example**:
```tsx
import { Textarea } from '@figma-kit/components/textarea';

<Textarea 
  placeholder="Enter description..."
  minRows={3}
  maxRows={10}
/>
```

---

### Text

**Variants**:
- **Size**: `small` (11px), `medium` (12px), `large` (14px)
- **Weight**: `default` (400), `strong` (600)
- **Align**: `start`, `center`, `end`
- **Block**: Makes text `display: block`

**Components**:
- `Text` - Inline text (`<span>`)
- `Label` - Label element (`<label>`)
- `Paragraph` - Paragraph (`<p>`)
- `Link` - Anchor (`<a>`)

**CSS Class**: `.fp-Text`

**Key Styles**:
```css
font-family: var(--font-family-default);
color: var(--figma-color-text);
margin: 0;

/* Inline elements */
& strong {
  font-weight: var(--font-weight-strong);
}

& code {
  font-family: var(--font-family-monospace);
  background-color: var(--figma-color-bg-brand-tertiary);
  padding: 0.05rem 0.15rem;
  border-radius: var(--radius-extra-small);
}

& mark {
  background-color: var(--figma-color-bg-onselected);
}
```

**Usage Example**:
```tsx
import { Text, Label, Paragraph } from '@figma-kit/components/text';

<Text size="small" weight="strong">Title</Text>
<Label>Field Label</Label>
<Paragraph size="medium">Description text</Paragraph>
```

---

### Tooltip

**CSS Classes**:
- `.fp-tooltip` - Tooltip content box
- `.fp-tooltip-arrow` - Arrow pointer

**Key Styles**:
```css
padding: var(--space-1) var(--space-2);
min-height: var(--space-6);
background-color: var(--color-bg-tooltip);   /* #1e1e1e */
color: var(--color-text-tooltip);            /* #fff */
border-radius: var(--radius-medium);
box-shadow: var(--elevation-300);
white-space: pre-wrap;
word-break: break-word;
font-size: var(--font-size-default);
```

**Usage Example**:
```tsx
import { Tooltip } from '@figma-kit/components/tooltip';

<Tooltip content="Helpful hint">
  <Button>Hover me</Button>
</Tooltip>
```

**Props**:
- `content` - Tooltip text/content
- `delayDuration` - Hover delay in ms
- `container` - Portal container

---

### Segmented Control (Toggle Group)

**Structure**:
```tsx
<SegmentedControl.Root defaultValue="1">
  <SegmentedControl.Item value="1">
    <SegmentedControl.Text>Option 1</SegmentedControl.Text>
  </SegmentedControl.Item>
  <SegmentedControl.Item value="2">
    <SegmentedControl.Text>Option 2</SegmentedControl.Text>
  </SegmentedControl.Item>
</SegmentedControl.Root>
```

**CSS Classes**:
- `.fp-SegmentedControlRoot` - Container
- `.fp-SegmentedControlItem` - Individual segment
- `.fp-SegmentedControlText` - Text label

**Props**:
- `fullWidth` - Stretch to container width
- `value`, `defaultValue` - Selected value
- `onValueChange` - Change handler

**Key Feature**: Enforces single selection (can't deselect last item).

---

### Collapsible

**Structure**:
```tsx
<Collapsible.Root>
  <Collapsible.Trigger>
    <Button>Toggle</Button>
  </Collapsible.Trigger>
  <Collapsible.Content>
    {/* Collapsible content */}
  </Collapsible.Content>
</Collapsible.Root>
```

**CSS Class**: `.fp-CollapsibleContent`

**Key Feature**: Smooth expand/collapse animation.

---

### Color Picker

**Structure**:
```tsx
<ColorPicker.Root value={color} onValueChange={setColor}>
  <ColorPicker.Area />           {/* 2D hue/saturation area */}
  <ColorPicker.Hue />            {/* Hue slider */}
  <ColorPicker.Alpha />          {/* Alpha slider */}
  <ColorPicker.Input />          {/* Hex input field */}
</ColorPicker.Root>
```

**CSS Class**: `.fp-ColorPicker`

**Features**:
- Visual area picker for saturation/lightness
- Separate hue slider
- Optional alpha channel
- Hex code input

---

### Icons

All icons accept these props:
- `size` - '4' (16px), '5' (20px), '6' (24px), etc.
- Uses `--color-icon` CSS variable for color

**Available Icons**:
- `CheckmarkIcon`
- `CheckmarkIndeterminateIcon`
- `ChevronDownIcon`, `ChevronUpIcon`, `ChevronLeftIcon`, `ChevronRightIcon`
- `CircleIcon`
- `CloseIcon`
- `PlusIcon`

**Key Styles**:
```css
.fp-Icon {
  color: var(--color-icon);
  width: var(--icon-size);
  height: var(--icon-size);
}
```

**Usage Example**:
```tsx
import { PlusIcon, CheckmarkIcon } from '@figma-kit/components/icons';

<PlusIcon size="4" />
<CheckmarkIcon size="5" />
```

---

## Best Practices

### 1. **Cursor Behavior**
Figma uses `cursor: default` for all interactive elements (buttons, inputs), not `pointer`:
```css
button, input, select {
  cursor: default;  /* Not pointer! */
}
```

### 2. **Focus Styles**
Always use `:focus-visible` instead of `:focus` to only show focus ring on keyboard navigation:
```css
&:focus-visible {
  outline: 1px solid var(--figma-color-border-selected);
  outline-offset: -1px;  /* Inner outline */
}
```

### 3. **Outline Pattern**
Figma uses inner outlines (negative offset) for consistent sizing:
```css
outline-width: 1px;
outline-offset: -1px;
outline-style: solid;
```

### 4. **State Order**
Apply pseudo-class states in this order:
1. Default
2. `:hover:not(:disabled, :focus)`
3. `:active`
4. `:focus-visible`
5. `:disabled`
6. Data attributes (`[data-state]`, `[data-disabled]`)

### 5. **Spacing Consistency**
Use spacing tokens, never arbitrary values:
```css
/* ✅ Good */
padding: var(--space-2);
gap: var(--space-1);

/* ❌ Avoid */
padding: 7px;
gap: 0.3rem;
```

### 6. **Color Usage**
Always use semantic Figma color tokens, not hardcoded values:
```css
/* ✅ Good */
background-color: var(--figma-color-bg-secondary);
color: var(--figma-color-text);

/* ❌ Avoid */
background-color: #2c2c2c;
color: #fff;
```

### 7. **Border Radius**
Match element type to radius:
- Small controls (checkboxes, inputs): `--radius-medium`
- Large containers (dialogs, menus): `--radius-large`
- Circular (radio, slider thumb): `--radius-full`

### 8. **Typography**
Use default Figma typography settings:
```css
font-family: var(--font-family-default);
font-size: var(--font-size-default);      /* 12px */
font-weight: var(--font-weight-default);  /* 400 */
letter-spacing: var(--letter-spacing-default);
line-height: var(--line-height-default);
```

### 9. **Component Composition**
Build complex UIs by composing primitives:
```tsx
// ✅ Good - Compose primitives
<Checkbox.Root>
  <Checkbox.Input />
  <Checkbox.Label>Label</Checkbox.Label>
</Checkbox.Root>

// ❌ Avoid - Monolithic components
<Checkbox label="Label" />
```

### 10. **Accessibility**
- Always provide `aria-label` for icon buttons
- Use semantic HTML (`<button>`, `<label>`, `<input>`)
- Ensure focus indicators are visible
- Test keyboard navigation

### 11. **Animation**
Keep transitions fast and purposeful:
```css
transition: all 0.1s ease-out;  /* Quick, subtle */
```

### 12. **Dark Mode**
All Figma color tokens automatically adapt. Never hardcode theme-specific colors:
```css
/* ✅ Good - Adapts automatically */
background: var(--figma-color-bg);

/* ❌ Avoid - Breaks in dark mode */
background: #ffffff;
```

---

## Integration Checklist

When migrating your plugin to Figma Kit styles:

- [ ] Replace custom CSS variables with Figma tokens
- [ ] Update spacing to use `--space-*` scale
- [ ] Change `cursor: pointer` to `cursor: default`
- [ ] Use `outline` instead of `border` for focus states
- [ ] Apply `outline-offset: -1px` for inner outlines
- [ ] Update border-radius to semantic tokens
- [ ] Replace hardcoded colors with `--figma-color-*` variables
- [ ] Change `:focus` to `:focus-visible`
- [ ] Update typography to use Figma font tokens
- [ ] Apply elevation (shadow) tokens to floating elements
- [ ] Use component composition patterns from Radix UI
- [ ] Add proper `aria-label` to icon buttons
- [ ] Test in both light and dark themes
- [ ] Verify keyboard navigation works correctly

---

## Additional Resources

- **Component Source**: `figma-kit/src/components/`
- **Token Definitions**: `figma-kit/src/styles/tokens/`
- **Base Styles**: `figma-kit/src/styles/index.css`
- **Radix UI Docs**: https://www.radix-ui.com/
- **Class Variance Authority**: https://cva.style/

---

## Quick Reference: Common Patterns

### Button Group
```tsx
<div style={{ display: 'flex', gap: 'var(--space-2)' }}>
  <Button variant="primary">Save</Button>
  <Button variant="secondary">Cancel</Button>
</div>
```

### Form Field
```tsx
<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
  <Label>Field Label</Label>
  <Input placeholder="Enter value..." />
  <Text size="small" style={{ color: 'var(--figma-color-text-secondary)' }}>
    Helper text
  </Text>
</div>
```

### Icon + Text Button
```tsx
<Button>
  <PlusIcon size="4" />
  <span>Add Item</span>
</Button>
```

### Modal Dialog
```tsx
<Dialog.Root>
  <Dialog.Trigger asChild>
    <Button>Open Settings</Button>
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content size="2">
      <div style={{ padding: 'var(--space-4)' }}>
        <Dialog.Title>Settings</Dialog.Title>
        {/* Content */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
          <Dialog.Close asChild>
            <Button variant="primary">Save</Button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <Button variant="secondary">Cancel</Button>
          </Dialog.Close>
        </div>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

### Dropdown Menu
```tsx
<Select.Root value={value} onValueChange={setValue}>
  <Select.Trigger placeholder="Select option..." />
  <Select.Content>
    <Select.Item value="1">Option 1</Select.Item>
    <Select.Item value="2">Option 2</Select.Item>
    <Select.Separator />
    <Select.Item value="3">Option 3</Select.Item>
  </Select.Content>
</Select.Root>
```

---

**Last Updated**: November 25, 2025  
**Version**: Based on figma-kit latest snapshot
