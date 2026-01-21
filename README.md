# Release Notes Closer for Obsidian.md

An Obsidian plugin that automatically closes the release notes tab that opens after Obsidian updates.

## Why?

After each Obsidian update, a "Release Notes" tab automatically opens. Unlike VS Code, Obsidian doesn't provide a built-in option to disable this behavior. This plugin solves that by automatically detecting and closing the release notes tab.

## How it works

The plugin monitors for workspace changes and checks each leaf (tab) for characteristics of the release notes view:

1. **View type detection**: Checks if the view type is `release-notes`
2. **Tab title pattern**: Matches "Release Notes [version]" pattern
3. **Content detection**: Looks for changelog links and release notes content
4. **DOM inspection**: Checks for links to `obsidian.md/changelog/`

When a release notes tab is detected, it's automatically closed.

## Installation

### Manual Installation

1. Download the latest release from the releases page
2. Extract the files into your vault's `.obsidian/plugins/release-notes-closer` folder
3. Reload Obsidian
4. Enable the plugin in Settings → Community plugins

### Building from source

1. Clone this repository into your vault's `.obsidian/plugins/` folder
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the plugin
4. Reload Obsidian and enable the plugin

## Development

```bash
# Install dependencies
npm install

# Build for development (with watch mode)
npm run dev

# Build for production
npm run build
```

## License

MIT
