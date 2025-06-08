# BlameGame Documentation

Welcome to the BlameGame documentation. This guide provides a comprehensive overview of the project's structure, components, and development practices.

## 📚 Documentation Structure

### Architecture & Design

- [**Data Structure Overview**](DATA_STRUCTURE_OVERVIEW.md) - Core data structures and state management
- [**Data Flow and Component Interaction**](DATA_FLOW_AND_COMPONENTS.md) - Detailed data flow and component interaction
- [**Questions & Categories**](QUESTIONS_CATEGORIES.md) - Question data organization and loading
- [**Multilingual Strategy**](MULTILINGUAL_STRATEGY.md) - Language support and translation system
- [**Component Structure**](COMPONENT_STRUCTURE.md) - UI component organization and best practices
- [**Debug Features**](DEBUG_FEATURES.md) - Guide to debugging features

### Development Guides

- [**Dependency Management**](DEPENDENCY_MANAGEMENT.md) - Required dependencies and installation
- [**Testing Strategy**](TESTING_STRATEGY.md) - Comprehensive testing procedures
- [**Translation Glossary**](TRANSLATION_GLOSSARY.md) - Terminology reference for translators
- [**Documentation Structure**](DOCUMENTATION_STRUCTURE.md) - Guide to documentation organization

### Implementation References

- [**Feature Implementation Summary**](implementation-summary-final.md) - Overview of completed features
- [**Optimization Summary**](optimization-summary.md) - Summary of optimization efforts
- [**Release Criteria**](release_criteria.md) - Requirements for release readiness
- [**Sound Implementation**](sound-implementation.md) - Guide for implementing sound effects
- [**PWA Icon Creation**](pwa-icon-creation.md) - Instructions for creating PWA icons

## 🔍 Getting Started

### Project Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the development server:
   ```bash
   pnpm dev
   ```

### Key Files and Directories

- `/components` - React components organized by type
- `/hooks` - Custom React hooks for state and logic
- `/lib` - Utility functions and constants
- `/assets` - Static assets (sounds, images)
- `/public/questions` - Question and category data
- `/docs` - Project documentation

## 🧩 Project Architecture

BlameGame follows a component-based architecture with:

1. **Core Components** - Reusable UI building blocks
2. **Game Components** - Feature-specific components
3. **Hook-based State Management** - Custom hooks for game state
4. **Data-driven Content** - Questions and categories loaded dynamically

## 🌐 Multilingual Support

The application supports multiple languages:
- German (de) - Default
- English (en)
- Spanish (es)
- French (fr)

Questions, categories, and UI elements are all translatable through the system described in [Multilingual Strategy](MULTILINGUAL_STRATEGY.md).

## 🧪 Testing

Refer to the [Testing Strategy](TESTING_STRATEGY.md) for comprehensive testing procedures covering:
- Feature testing
- PWA functionality
- Multilingual support
- Cross-device compatibility

## 📋 Task Management

Current tasks and progress are tracked in [todo.md](todo.md), which is regularly updated with completion status.

## 📄 Documentation Note

Some older documentation has been moved to the [archive](archive/) directory. These files are kept for historical reference but have been superseded by newer documents.