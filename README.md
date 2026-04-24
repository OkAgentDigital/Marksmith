# <h1><img src="resources/icon.png" width="25"> Marksmith</h1>

## A Powerful Writing Tool and Document Management System

Marksmith is a WYSIWYG editor and document management system, fully compatible with GitHub Flavored Markdown Spec. It provides a robust workspace/vault system for organizing documents hierarchically with support for versioning, media attachments, and cross-document linking.

## 🚀 Project Status: Active Development

> **This project has been forked from Inkdown and is under active development by OkAgentDigital.**

## 📋 Roadmap

The current development roadmap focuses on:

1. **GitHub Publishing Path** - Seamless synchronization with Git repositories
2. **Feeds/MCP Integration** - Enhanced content aggregation and management
3. **Schema System** - Custom document types and templates
4. **Contacts Management** - Integrated address book functionality
5. **SQL Enhancements** - Advanced querying and reporting
6. **Task Management** - Built-in task tracking and workflows

## 📦 Installation

### Prerequisites

- Node.js v18+ (v24 recommended)
- npm or yarn
- Git (for source installation)

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

## 📁 Workspace/Vault System

Marksmith uses a sophisticated workspace system with:

- **Hierarchical Document Organization**: Tree structure with folders and files
- **SQLite Database Backend**: Reliable local storage with Knex.js
- **Version History**: Full document revision tracking
- **Media Management**: Integrated attachment handling
- **Cross-Document Linking**: Advanced reference system

### Database Schema

The core schema includes:

- `space`: Workspaces/vaults with filesystem binding
- `doc`: Documents with hierarchical structure and metadata
- `history`: Document version history
- `file`: Media attachments and assets

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