# Marksmith for macOS

**Marksmith** - A Powerful Writing Tool and Document Management System for macOS

By OkAgentDigital - Forked with care from Inkdown

## 🛠️ Building from Source

Since Marksmith is not distributed as a pre-built binary, you'll need to build it locally:

### Prerequisites
- macOS 10.12 or later
- Apple Silicon (M1/M2) or Intel Mac with Rosetta 2
- Node.js v18+ (v24 recommended)
- npm or yarn
- Git

### Build Instructions

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/OkAgentDigital/marksmith.git
   cd marksmith
   ```

2. **Run the build script**:
   ```bash
   ./scripts/build-mac.sh
   ```

3. **Or build manually**:
   ```bash
   npm install
   npm run build
   npx electron-builder --mac --arm64
   ```
2. **Double-click** the DMG file to open it
3. **Drag** the Marksmith icon to your Applications folder
4. **Eject** the DMG volume
5. **Launch** Marksmith from your Applications folder or Spotlight

### Option 2: Using the ZIP Archive

1. **Download** the latest `Marksmith-mac-arm64.zip` from the [releases page](#)
2. **Unzip** the archive
3. **Open** the `mac-arm64` folder
4. **Double-click** `Marksmith.app` to launch

### Option 3: Direct Application Bundle

If you have the application bundle:
1. **Navigate** to `dist/darwin/arm64/mac-arm64/`
2. **Double-click** `Marksmith.app`

## ⌨️ Keyboard Shortcuts

Marksmith supports standard macOS keyboard shortcuts:

- **Cmd+C**: Copy
- **Cmd+V**: Paste
- **Cmd+X**: Cut
- **Cmd+Z**: Undo
- **Cmd+Shift+Z**: Redo
- **Cmd+A**: Select All
- **Cmd+,**: Open Settings
- **Cmd+N**: New Vault
- **Cmd+O**: Import Folder
- **Cmd+Shift+O**: Import File
- **Cmd+Q**: Quit Marksmith

## 🚀 After Building

Once the build completes, you'll find the application in:
```
dist/darwin/arm64/Marksmith-mac-arm64.dmg
```

### Installation

1. **Double-click** the DMG file to open it
2. **Drag** Marksmith to your Applications folder
3. **Launch** from Applications or Spotlight

### First Run

1. **Create a Vault**: Use File → New Vault or press Cmd+N
2. **Import Content**: Use File → Import Folder or File → Import File
3. **Explore Settings**: Use Marksmith → Settings or press Cmd+, to configure the app

## 🐛 Troubleshooting

### App won't open?
- Make sure you're using macOS 10.12 or later
- Check that your Mac has Apple Silicon (M1/M2) or Intel with Rosetta 2
- Right-click the app and select "Open" to bypass Gatekeeper if needed

### Menu items not working?
- Ensure you have an active window
- Some features require a vault to be open

## 📖 Documentation

- [Full Documentation](https://github.com/OkAgentDigital/marksmith/blob/master/README.md)
- [Report Issues](https://github.com/OkAgentDigital/marksmith/issues)
- [Source Code](https://github.com/OkAgentDigital/marksmith)

## 📋 Notes

- Marksmith v2.1.1 is built for Apple Silicon (ARM64)
- Requires macOS 10.12 or later
- English-only interface
- All core features are accessible via the menu bar

Enjoy using Marksmith! 🚀