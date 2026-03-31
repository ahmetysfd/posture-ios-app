# PostureFix — Design Guidelines

## Brand Identity
PostureFix is a health & wellness iOS app focused on correcting posture problems through guided exercises. The brand tone is **encouraging, clean, and professional** — approachable enough for everyday users but authoritative enough to feel medically informed.

## Design Principles

### 1. Clarity First
Every screen should have a clear hierarchy. Users should immediately understand what to do. Use whitespace generously and avoid clutter.

### 2. Category Color System
Each posture category has a dedicated color pair (foreground + background):
- **Neck** → `#8B5CF6` / `#F5F3FF`
- **Shoulder** → `#3B82F6` / `#EFF6FF`
- **Back** → `#EC4899` / `#FDF2F8`
- **Hip** → `#F97316` / `#FFF7ED`
- **Wrist** → `#6366F1` / `#EEF2FF`

These should be used consistently for cards, badges, icons, and CTAs related to each category.

### 3. Motion with Purpose
Animations serve to orient the user, not decorate. Use `slideUp` for new content entering, `scaleIn` for modals/overlays, and `breathe` for active exercise states.

### 4. iOS-Native Feel
The app should feel like a native iOS app:
- Bottom tab navigation with blur backdrop
- Large bold titles (28px, weight 800)
- Rounded corners (14-20px on cards)
- Subtle shadows, not borders, for elevation
- System-like toggle switches

## Typography Scale
| Usage         | Size | Weight | Token              |
|---------------|------|--------|--------------------|
| Page Title    | 28px | 800    | --font-display     |
| Section Title | 18px | 700    | --font-display     |
| Card Title    | 16px | 700    | --font-display     |
| Body          | 15px | 400    | --font-body        |
| Caption       | 13px | 500    | --font-body        |
| Badge/Label   | 11px | 600    | --font-body        |

## Spacing
Use the 4px grid: 4, 8, 12, 16, 20, 24, 32, 48.

## Component Patterns
- **Cards**: White background, 1px border-light, shadow-card, 16px border-radius, 16-20px padding
- **Buttons**: Full-width CTAs use gradient backgrounds with color shadow, 16px border-radius
- **Badges**: Category-colored, uppercase, 0.05em letter-spacing
- **Progress bars**: 6px height, rounded, gradient fill
- **Toggles**: 52×30px, iOS-style with sliding knob

## Accessibility
- Minimum tap target: 44×44px
- Color contrast: WCAG AA minimum
- All interactive elements have visible focus states
- Screen reader labels on icon-only buttons
