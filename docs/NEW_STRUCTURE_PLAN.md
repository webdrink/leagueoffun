# Documentation Restructure Plan

## Current Issues with Documentation
- 50+ scattered files with overlapping content
- Mix of implementation plans, status updates, and actual documentation
- No clear entry point for developers wanting to use the framework
- BlameGame-specific content mixed with framework documentation
- Outdated information and redundant files

## New Structure for Framework Documentation

```
docs/
├── README.md                           # Main entry point and overview
├── getting-started/
│   ├── README.md                      # Quick start guide
│   ├── installation.md               # Setup and installation
│   ├── first-game.md                 # Create your first game tutorial
│   └── examples/                     # Code examples and templates
├── architecture/
│   ├── README.md                     # Architecture overview
│   ├── framework-core.md             # Core framework concepts
│   ├── game-modules.md               # Game module system
│   ├── component-system.md           # Component architecture
│   ├── state-management.md           # Zustand stores and data flow
│   ├── phase-system.md               # Game phases and routing
│   └── data-providers.md             # Content and data management
├── guides/
│   ├── README.md                     # Guide index
│   ├── creating-components.md        # Component development guide
│   ├── internationalization.md      # i18n implementation
│   ├── testing.md                   # Testing strategies and patterns
│   ├── animations.md                # Animation system with Framer Motion
│   ├── theming.md                   # Styling and theming
│   ├── pwa-setup.md                 # Progressive Web App features
│   └── deployment.md                # Build and deployment
├── api-reference/
│   ├── README.md                     # API overview
│   ├── hooks/                        # Custom hooks documentation
│   ├── components/                   # Component API reference
│   ├── framework/                    # Framework APIs
│   └── utilities/                    # Utility functions
├── examples/
│   ├── README.md                     # Examples overview
│   ├── nameblame-game/              # Complete NameBlame implementation
│   ├── simple-game/                 # Minimal game example
│   └── custom-components/           # Component examples
└── migration/
    ├── README.md                     # Migration guides
    ├── from-legacy.md               # Migrating from direct React
    └── version-history.md           # Framework version changes
```

## Content Consolidation Strategy

### Keep and Modernize
- COMPONENT_STRUCTURE.md → architecture/component-system.md
- FRAMEWORK_IMPLEMENTATION_SUMMARY.md → architecture/framework-core.md
- MULTILINGUAL_STRATEGY.md → guides/internationalization.md
- TESTING_STRATEGY.md → guides/testing.md
- TRANSLATION_SYSTEM.md → guides/internationalization.md (merge)

### Archive (Move to docs/archive/)
- All plan-*.md files (implementation-specific)
- CURRENT_STATUS.md and similar status files
- Implementation roadmaps and project-specific documentation
- Outdated technical decisions

### Transform into Framework Documentation
- Extract framework-relevant parts from existing docs
- Remove BlameGame-specific implementation details
- Add generic examples that work for any game
- Focus on reusability and extensibility

## Key Documentation Principles

1. **Developer-First**: Written for developers wanting to build games
2. **Example-Driven**: Every concept illustrated with working code
3. **Progressive Disclosure**: Start simple, add complexity gradually
4. **Framework-Agnostic**: Focus on framework capabilities, not BlameGame specifics
5. **Actionable**: Every guide should result in working code
6. **Maintainable**: Clear ownership and update procedures

## Target Audiences

### Primary: Game Developers
- Want to build party games using this framework
- Need clear architecture understanding
- Require step-by-step implementation guides
- Expect working code examples

### Secondary: Framework Contributors
- Need deep architectural knowledge
- Require API documentation and patterns
- Need testing and contribution guidelines

### Tertiary: Maintainers
- Need deployment and release processes
- Require troubleshooting guides
- Need framework evolution documentation

## Success Metrics

1. **Discoverability**: New developers can find relevant information in < 2 clicks
2. **Time-to-First-Game**: Developer can create working game in < 30 minutes
3. **Self-Service**: 90% of questions answered without external help
4. **Maintainability**: Documentation stays current with framework changes
5. **Adoption**: Other developers successfully build games using framework

## Implementation Phases

1. **Phase 1**: Create new structure and main entry points
2. **Phase 2**: Archive old files and consolidate content
3. **Phase 3**: Write comprehensive framework documentation
4. **Phase 4**: Create working examples and tutorials
5. **Phase 5**: Polish and optimize navigation

This restructure will transform scattered project documentation into a comprehensive framework guide that enables other developers to build games effectively.