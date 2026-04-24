# 🚀 Marksmith macOS Installation Guide

## 📥 Download Options

Two distribution formats are available in the `dist/darwin/arm64/` directory:

### 1. DMG Installer (Recommended) 🎯
- **File**: `Marksmith-mac-arm64.dmg`
- **Size**: ~185 MB
- **Format**: Disk image with drag-and-drop installation
- **Best for**: End users, easy installation

### 2. ZIP Archive 📦
- **File**: `Marksmith-mac-arm64.zip`
- **Size**: ~180 MB
- **Format**: Compressed archive
- **Best for**: Advanced users, manual deployment

## 🐾 Installation Instructions

### Using the DMG (Recommended)

1. **Locate the DMG file**:
   ```bash
   open dist/darwin/arm64/Marksmith-mac-arm64.dmg
   ```

2. **Install the application**:
   - A new window will open showing the Marksmith app
   - Drag the Marksmith icon to your Applications folder
   - Eject the DMG when done

3. **Launch Marksmith**:
   - Open Finder → Applications
   - Double-click Marksmith
   - On first launch, macOS may ask for confirmation (Gatekeeper)

### Using the ZIP Archive

1. **Extract the ZIP file**:
   ```bash
   unzip dist/darwin/arm64/Marksmith-mac-arm64.zip -d ~/Applications/
   ```

2. **Launch Marksmith**:
   ```bash
   open ~/Applications/Marksmith.app
   ```

## ⚠️ First Launch Notes

### Gatekeeper Warning
Since this is a development build without code signing, macOS may show a security warning:

**"Marksmith" cannot be opened because the developer cannot be verified.**

**To fix this**:
1. Right-click (or Ctrl+click) the Marksmith app
2. Select "Open"
3. Click "Open" in the dialog that appears
4. This bypasses Gatekeeper for this app (one-time only)

### Data Location
Marksmith stores your data in:
```
~/Library/Application Support/marksmith/
```

This includes:
- `data.sqlite` - Your documents and workspaces
- Configuration files
- Cache and temporary files

## 🔍 Verification

### Check Application Info
1. Right-click Marksmith.app → "Get Info"
2. Verify it's optimized for Apple Silicon (ARM64)
3. Check version: 2.1.1

### Test Basic Functionality
1. **Create a workspace**: File → New Workspace
2. **Create a document**: Right-click → New Document
3. **Test editing**: Type some markdown content
4. **Test saving**: Changes should persist automatically
5. **Test workspace switching**: Create multiple workspaces

## 🎯 Advanced Usage

### Command Line Launch
```bash
open /Applications/Marksmith.app
```

### Multiple Instances
```bash
open -n /Applications/Marksmith.app
```

### Development Mode
If you need to go back to development mode:
```bash
npm run dev
```

## 🐛 Troubleshooting

### App won't launch
- Check Console.app for error messages
- Try deleting and reinstalling
- Ensure no other Marksmith instances are running

### Database issues
- Backup your data first:
  ```bash
  cp ~/Library/Application\ Support/marksmith/data.sqlite ~/Desktop/marksmith-backup.sqlite
  ```
- Try resetting the app:
  ```bash
  rm -rf ~/Library/Application\ Support/marksmith/
  ```

### Performance issues
- Check Activity Monitor for high CPU/memory usage
- Try restarting the app
- Ensure you're not running other electron apps simultaneously

## 📋 Technical Details

### Build Information
- **Electron Version**: 35.7.5
- **Architecture**: arm64 (Apple Silicon)
- **Node.js**: Bundled with Electron
- **Vite**: 6.4.2
- **Build Date**: $(date +%Y-%m-%d)

### Included Dependencies
- SQLite (better-sqlite3)
- Knex.js (query builder)
- MobX (state management)
- Ant Design (UI components)
- Slate.js (rich text editor)
- PDF.js (PDF rendering)
- Mermaid (diagrams)
- KaTeX (math rendering)

## 🔄 Updates

This is a development build. For future updates:

1. **Pull latest changes**:
   ```bash
   git pull origin master
   ```

2. **Rebuild**:
   ```bash
   npm run build:mac:arm64
   ```

3. **Replace existing app**:
   - Delete old version from Applications
   - Install new version using the updated DMG

## 🤝 Support

**Found an issue?** Please report it on GitHub:
https://github.com/OkAgentDigital/Marksmith/issues

**Need help?** Check the full documentation in README.md

---

© 2024 OkAgentDigital. Marksmith v2.1.1 - Empowering your document workflow! 🚀