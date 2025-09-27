# Header Layout Testing Guide

## Manual Verification Checklist

After implementing the responsive header fixes, test the following scenarios manually:

### Desktop Testing (1920x1080, 1440x900, 1280x720)
- [ ] Header title stays within container bounds
- [ ] Title font size is appropriate (readable but not overwhelming)
- [ ] Header height is balanced with footer
- [ ] No horizontal scrollbars appear
- [ ] Subtitle (if present) wraps properly and doesn't overflow

### Tablet Testing (768x1024, 1024x768)
- [ ] Header adapts to portrait/landscape orientation changes
- [ ] Touch targets are at least 44px in height/width
- [ ] Text remains readable at tablet scale
- [ ] Header takes appropriate proportion of screen space (<15% in landscape)

### Mobile Testing (375x667, 390x844, 360x800)
- [ ] Header text scales down appropriately
- [ ] Long titles wrap and use line-clamp-2 effectively
- [ ] Header height is PWA-compliant (56-72px range)
- [ ] Content area gets adequate space (>60% of viewport)

### Edge Cases
- [ ] Very long titles (>50 characters) are handled gracefully
- [ ] Very small viewports (280x480) still show readable text
- [ ] Zoom levels 75%-200% work properly
- [ ] High contrast mode doesn't break layout
- [ ] Custom fonts fail gracefully to fallbacks

## Testing Different Titles

Test with these different title lengths:
1. Short: "Game"
2. Normal: "BlameGame"
3. Long: "The Ultimate Blame Game Experience"
4. Very Long: "This is an extremely long game title that should definitely wrap properly and not overflow"

## Expected Behavior

### Header Structure
- Container: Responsive padding, proper shadow and backdrop blur
- Title: Uses game-header-font class, line-clamp-2, responsive sizing
- Overflow handling: break-words, hyphens-auto, proper width constraints

### Size Progression (breakpoints)
- Mobile (default): text-lg (18px)
- Small (640px+): text-xl (20px)  
- Medium (768px+): text-2xl (24px)
- Large (1024px+): text-3xl (30px)
- XL (1280px+): text-4xl (36px)
- 2XL (1536px+): text-5xl (48px)

### Container Heights
- Mobile: min-h-[56px]
- Small: min-h-[60px] 
- Medium: min-h-[64px]
- Large: min-h-[68px]

## Common Issues Fixed

1. **Title Overflow**: Now uses line-clamp-2 and proper width constraints
2. **Subtitle Overflow**: Added line-clamp-3 and responsive sizing
3. **Header Height**: Now follows PWA guidelines with min-height constraints
4. **Touch Targets**: Ensured clickable elements meet 44px minimum
5. **Font Fallbacks**: Added proper CSS class instead of inline styles
6. **Responsive Scaling**: Better progression across breakpoints

## Visual Testing Tools

Use browser dev tools to test:
1. Device toolbar (responsive mode)
2. Different zoom levels
3. Network throttling for font loading
4. Accessibility features (high contrast, larger text)

## Automated Test Files

Created comprehensive test suites:
- `tests/header-responsive-visual.spec.ts` - Multi-device visual tests
- `tests/header-layout-compliance.spec.ts` - PWA compliance tests

Run tests with: `npx playwright test tests/header-*.spec.ts`