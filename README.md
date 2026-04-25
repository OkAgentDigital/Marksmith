# <h1><img src="resources/icon.png" width="25"> Marksmith</h1>

## A Powerful Writing Tool and Document Management System

Marksmith is a WYSIWYG editor and document management system, fully compatible with GitHub Flavored Markdown Spec. It provides a robust workspace/vault system for organizing documents hierarchically with support for versioning, media attachments, and cross-document linking.

## 🚀 Project Status: Active Development

> **This project has been forked from Inkdown and is under active development by OkAgentDigital.**

## 📋 Roadmap

The current development roadmap focuses on:

## 📜 Legacy & License Compliance

Marksmith is a fork of [Inkdown](https://github.com/1943time/inkdown), originally licensed under AGPL-3.0. 

**📁 Legacy Archive**: The `.legacy/` directory contains archived copies of the original fork for license compliance. See [`.legacy/README.md`](.legacy/README.md) for details.

---

1. **GitHub Publishing Path** - Seamless synchronization with Git repositories
2. **Feeds/MCP Integration** - Enhanced content aggregation and management
3. **Schema System** - Custom document types and templates
4. **Contacts Management** - Integrated address book functionality
5. **SQL Enhancements** - Advanced querying and reporting
6. **Task Management** - Built-in task tracking and workflows

## 📦 Installation

### macOS (Apple Silicon)

**🍎 Download the latest macOS release:**
- [Marksmith-mac-arm64.dmg](dist/darwin/arm64/Marksmith-mac-arm64.dmg) (Disk Image)
- [Marksmith-mac-arm64.zip](dist/darwin/arm64/Marksmith-mac-arm64.zip) (ZIP Archive)

See the [macOS Quickstart Guide](MACOS_QUICKSTART.md) for installation instructions.

### From Source

```bash
git clone https://github.com/OkAgentDigital/marksmith.git
cd marksmith
npm install --legacy-peer-deps --omit=peer
npm run dev
```

The application will start on `http://localhost:5174/`

## 🔧 Development Setup

```bash
# Install dependencies
npm install --legacy-peer-deps --omit=peer

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Persistent Vault Indexing System

Marksmith features a robust, production-ready vault indexing system that persists all your documents and their hierarchical structure between sessions.

### 🗃️ Core Features

- **SQLite Database Backend**: Uses `~/Library/Application Support/marksmith/data.sqlite` for reliable local storage
- **Hierarchical Organization**: Documents organized in tree structure with parent-child relationships
- **Workspace Binding**: Each workspace can be linked to a local filesystem folder
- **Version History**: Complete document revision tracking with restore capability
- **Media Management**: Integrated attachment handling with document associations
- **Cross-Document Links**: Advanced reference system between documents
- **Offline-First**: Full functionality without internet connection

### 🔧 Database Schema

The core schema includes these tables:

#### `space` - Workspaces/Vaults
- `id`: Unique identifier
- `name`: Workspace name
- `writeFolderPath`: Local filesystem path for synchronization
- `sort`: Ordering position
- `opt`: Additional workspace options

#### `doc` - Documents
- `id`: Unique identifier
- `name`: Document name
- `spaceId`: Foreign key to workspace (enables multi-workspace support)
- `parentId`: Hierarchical structure (folder parent)
- `folder`: Boolean flag (true for folders)
- `schema`: Document content structure
- `links`: Document links/references
- `medias`: Media attachments
- `sort`: Ordering within folder
- `deleted`: Soft delete flag (enables trash/restore functionality)
- `created`, `updated`, `lastOpenTime`: Timestamps

#### `history` - Document Versions
- `docId`: Foreign key to document
- `schema`: Historical document content
- `spaceId`: Workspace reference
- `created`: Timestamp
- `links`, `medias`: Historical attachments

#### `file` - Media Attachments
- `name`: File name (primary key)
- `spaceId`: Workspace reference
- `messageId`: Chat message reference (if applicable)
- `created`, `size`: File metadata

### 🔄 Synchronization System

Marksmith maintains bidirectional synchronization between:

1. **Database ←→ Filesystem**: Documents in workspaces can be synchronized with local folders
2. **Hierarchy Preservation**: Folder structure is maintained in both database and filesystem
3. **Conflict Resolution**: Intelligent handling of concurrent changes
4. **Change Detection**: Automatic detection of external filesystem changes

### 🎯 Key Benefits for uDos Integration

Since Marksmith and uDos share the same document vault format:

- **Direct Compatibility**: Same SQLite schema and indexing approach
- **Shared Workspaces**: Both apps can access the same vaults seamlessly
- **Unified Search**: Cross-app document discovery
- **Consistent Experience**: Same organizational structure across both applications

### 📊 Advanced Features

- **Soft Delete System**: Documents marked as `deleted: 1` instead of being removed, allowing trash/restore functionality
- **Hierarchical Sorting**: Documents maintain sort order within each folder level
- **Cross-Document References**: Documents track links to other documents
- **Media Associations**: Documents maintain relationships with their attachments
- **Version Diffing**: Ability to compare different versions of documents

### 🔍 Performance Characteristics

- **Instant Loading**: SQLite provides fast access to document metadata
- **Efficient Search**: Full-text search across all documents
- **Scalable**: Handles thousands of documents per workspace
- **Reliable**: ACID-compliant transactions prevent data corruption
- **Portable**: Single SQLite file can be moved or backed up easily

### 🛠️ Development Notes

The indexing system uses:
- **Knex.js**: SQL query builder for database operations
- **Better-SQLite3**: High-performance SQLite driver
- **MobX**: State management for reactive UI updates
- **TypeScript**: Type-safe document and workspace models

This system provides a solid foundation that uDos can build upon while maintaining full compatibility with Marksmith's document vaults.

## 🎨 Features

- **WYSIWYG Markdown Editor**: Real-time preview and editing
- **Multi-Workspace Support**: Organize documents across multiple vaults
- **Offline-First**: Full functionality without internet connection
- **Cross-Platform**: Works on macOS, Windows, and Linux
- **Extensible**: Plugin architecture for additional functionality

## 🔄 Migration from Inkdown

Marksmith is a direct evolution of Inkdown with:

- **Renamed** from Inkdown to Marksmith throughout the codebase
- **Simplified** by removing i18n system for streamlined development
- **Enhanced** workspace indexing system
- **Updated** dependencies and build configuration

## 🤝 Credits

### Original Developers

Marksmith builds upon the excellent work of:
- **1943time**: Original creator of Inkdown
- **Inkdown Contributors**: All who contributed to the original project

### Current Maintainers

- **OkAgentDigital**: Project stewardship, architecture, and development
- **Open Source Contributors**: Community members who help improve Marksmith

## 📄 License

Marksmith is released under the **AGPL-3.0 License**, ensuring it remains open and freely available while protecting the rights of contributors.

## 🐛 Issues and Contributions

Please report issues and contribute via:
- **GitHub Issues**: https://github.com/OkAgentDigital/marksmith/issues
- **Pull Requests**: https://github.com/OkAgentDigital/marksmith/pulls

## 🔗 Related Projects

- **uDos**: Companion document management system that shares the same vault format
- **OkAgentDigital Platform**: Integrated ecosystem for knowledge management

---

© 2024 OkAgentDigital. All rights reserved.

*Marksmith - Empowering your document workflow*