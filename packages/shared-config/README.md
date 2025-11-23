# Shared Config

Base configuration files shared across all League of Fun games.

## Purpose

Provides consistent build and development configurations across the monorepo. Games extend these base configs to ensure consistency while allowing customization.

## Contents

### Configuration Files

- `tsconfig.base.json` - Base TypeScript configuration
- `tailwind.config.js` - Base Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration

## Usage

### TypeScript Configuration

Games extend the base TypeScript config:

```json
// games/*/tsconfig.json
{
  "extends": "../../packages/shared-config/tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@framework-ui/*": ["../../packages/framework-ui/src/*"],
      "@game-core/*": ["../../packages/game-core/src/*"]
    }
  }
}
```

### Tailwind Configuration

Games can extend or override Tailwind settings:

```javascript
// games/*/tailwind.config.js
import baseConfig from '../../packages/shared-config/tailwind.config.js';

export default {
  ...baseConfig,
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/framework-ui/src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      // Game-specific theme extensions
    }
  }
};
```

### PostCSS Configuration

Shared across all games:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

## Structure

```
shared-config/
├── tsconfig.base.json    # Base TypeScript config
├── tailwind.config.js    # Base Tailwind config
├── postcss.config.js     # PostCSS config
├── package.json
└── README.md
```

## Base TypeScript Configuration

The base config includes:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true
  }
}
```

## Base Tailwind Configuration

Includes common theme extensions:

```javascript
export default {
  theme: {
    extend: {
      colors: {
        // Shared color palette
      },
      animation: {
        // Shared animations
      }
    }
  }
};
```

## How to Modify

### Updating Base Config

When updating shared configs:

1. **Test Impact**: Changes affect ALL games
   ```bash
   npm run build
   npm run typecheck
   ```

2. **Document Changes**: Update this README

3. **Communicate**: Let team know of breaking changes

### Adding New Config

To add a new shared config:

1. Create config file in this directory

2. Document usage in this README

3. Update games to use it

## Game-Specific Overrides

Games should:
- **Extend** base configs
- **Add** game-specific settings
- **Not modify** shared base directly

Example:

```json
{
  "extends": "../../packages/shared-config/tsconfig.base.json",
  "compilerOptions": {
    // Game-specific additions
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## What Belongs Here

### ✅ DO Include

- Base TypeScript settings
- Common Tailwind theme
- Shared build configurations
- ESLint/Prettier base configs
- Common theme tokens

### ❌ DON'T Include

- Game-specific configs
- Runtime code
- Components or utilities
- Build artifacts

## Modification Guidelines

### Safe to Modify

- ✅ Adding new theme colors
- ✅ Adding new animations
- ✅ Updating TypeScript target version
- ✅ Adding new shared utilities

### Requires Careful Testing

- ⚠️ Changing TypeScript strict settings
- ⚠️ Modifying module resolution
- ⚠️ Changing Tailwind purge settings
- ⚠️ Updating build targets

### Avoid

- ❌ Breaking existing APIs
- ❌ Removing config options games depend on
- ❌ Adding game-specific settings
- ❌ Large breaking changes without coordination

## TypeScript Paths

Games configure path aliases in their own tsconfig:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@framework-ui/*": ["../../packages/framework-ui/src/*"],
      "@game-core/*": ["../../packages/game-core/src/*"],
      "@shared-config/*": ["../../packages/shared-config/*"]
    }
  }
}
```

## Tailwind Content

Games must include shared package paths:

```javascript
{
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/framework-ui/src/**/*.{js,ts,jsx,tsx}'
  ]
}
```

This ensures Tailwind processes shared component classes.

## Theme Tokens

Shared theme tokens can be defined here:

```javascript
// Future: theme.config.js
export const themeTokens = {
  colors: {
    primary: '#...',
    secondary: '#...'
  },
  spacing: {
    // Custom spacing
  }
};
```

## Testing Changes

After modifying configs:

```bash
# Type check all games
npm run typecheck

# Build all games
npm run build

# Test in development
npm run dev:blamegame
npm run dev:hookhunt
npm run dev:game-picker
```

## What NOT to Modify

- ❌ **DON'T**: Add runtime code
- ❌ **DON'T**: Include game-specific settings
- ❌ **DON'T**: Change without testing all games
- ❌ **DON'T**: Break backward compatibility

## Migration Notes

When migrating games to use shared configs:

1. Replace game config with extends
2. Move shared settings here
3. Keep game-specific settings in game
4. Test build and development
5. Update documentation

## Need Help?

- TypeScript config: See official TS docs
- Tailwind setup: Check Tailwind documentation
- Game configs: Review individual game tsconfig files
