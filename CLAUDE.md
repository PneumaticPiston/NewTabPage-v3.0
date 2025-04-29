# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- No formal build process, as this is a browser extension/HTML project
- Will be run locally by opening HTML files in a browser
- Test by manually inspecting web pages and functionality
- Installed in Chrome by loading the directory as an unpacked extension
- 

## Code Style Guidelines
- **HTML**: Use semantic elements, proper indentation, and descriptive attributes
- **CSS**: Organize by component, use CSS variables for theming, follow BEM naming
- **JavaScript**: 
  - Prefer ES6+ features (const/let, arrow functions, destructuring)
  - Use camelCase for variables/functions, PascalCase for constructors
  - Group related CSS selectors and properties
  - Separate functional logic from UI components
  - All positions are relative to screen center for consistent scaling across devices
  - Organize code by feature, not by type of operation
  - Store user settings/preferences in browser storage (Chrome storage API or localStorage)
  - Font sizes should use relative scaling via CSS variables, not fixed pixel values
  - Apply proper error handling with try/catch blocks where needed