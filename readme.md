# Custom New Tab Page v3.0

A highly customizable Chrome extension that replaces the default new tab page with a modern, feature-rich alternative.

## Features

### Link Management
- Create and organize links in different group layouts:
  - Stack: Vertical list of links with favicons
  - Grid: Customizable grid layout of links with icons
  - Single: Individual link with large icon
- Drag-and-drop positioning of link groups
- Custom group titles
- Automatic favicon fetching

### Search Bar
- Configurable search engine (Google, Bing, DuckDuckGo, Yahoo)
- Draggable search bar positioning
- Image search via drag-and-drop
- Customizable appearance

### Themes
- Built-in themes:
  - Light Minimal
  - Modern Dark
  - Forest
  - Ocean
  - Sunset
  - Cyberpunk
  - Midnight Blue
  - Emerald Dark
  - Slate Blue
  - Deep Purple
  - Nord
- Custom theme creation
- Custom background image support
- High contrast mode

### Accessibility
- Adjustable font sizes
- Configurable group scaling
- Customizable spacing
- Screen reader friendly markup

## Installation

### As Chrome Extension
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

### For Development
1. Clone the repository
2. Open the files directly in your browser
3. Use the localStorage fallback for testing

## Usage

### Managing Link Groups
1. Click the settings icon in the bottom right
2. Select "Edit Link Groups"
3. Use the "+" button to add new groups
4. Drag groups to position them
5. Click group settings to edit layout and links

### Customizing Themes
1. Open settings
2. Select a base theme or create custom theme
3. Adjust colors using the color pickers
4. Upload custom background if desired
5. Save changes

### Configuring Search
1. Open settings
2. Choose default search engine
3. Toggle search bar visibility
4. Position search bar in editor mode

## Development

### Project Structure
```
NewTabPage v3.0/
├── newtab/           # Main new tab page files
├── settings/         # Settings page and editor
├── theme/           # Theme definitions and styles
└── assets/          # Images and icons
```

### Key Files
- `newtab.js`: Core functionality
- `settings.js`: Settings management
- `editor.js`: Link group editor
- `themes.css`: Theme definitions

### Technologies Used
- Vanilla JavaScript
- CSS Custom Properties
- Chrome Storage API
- HTML5 Drag and Drop

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.