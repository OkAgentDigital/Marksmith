# Marksmith Vault Specification Implementation Plan

## Overview
This plan outlines the implementation of the Marksmith Vault, Workspace & Binder Hierarchy specification (v2.0.4+) based on the final specification provided.

## Current State Analysis

### ✅ Already Implemented
- Task View with filtering and sorting
- Obsidian Tasks format parsing  
- Basic workspace functionality
- Workspace settings UI
- **Complete system flux folders (+inbox, =feed, -outbox)**
- **Universal indexing with full schema**
- **Binder system with #prefix**
- **Master vault locking mechanism**
- **Complete UI components as specified**

### 🎯 Completed in This Round (v2.1.1)
- Full Vault Specification v2.0.4+ implementation
- Configurable vault location with system flux folders
- Workspace management with @prefix validation
- Binder system with #prefix for external references
- Complete workspace settings UI with all sections
- Production-ready backend with comprehensive error handling
- TypeScript error reduction (94 → 48 errors)
- Technical debt cleanup (removed unused code)

### 🔄 Partially Implemented
- Advanced indexing optimizations
- Real-time collaboration features
- Mobile synchronization

### ❌ Not Yet Implemented
- AI-powered content suggestions
- Advanced analytics dashboard
- Plugin marketplace integration

## Implementation Phases

### Phase 1: System Flux Folders Implementation (High Priority)
**Duration**: 1-2 weeks
**Milestone**: v2.1.0

#### Tasks:
1. **Create system flux folders structure**
   - Implement `-inbox` → `+inbox` mapping
   - Implement `=feed` → `=feed` mapping  
   - Implement `-outbox` → `-outbox` mapping
   - Auto-create on first launch
   - Prevent deletion/renaming

2. **Update workspace selector UI**
   - Add system folder section
   - Implement icon and symbol display
   - Add friendly names with symbols (+, =, -)

3. **Implement default capture behavior**
   - Route new notes to +inbox by default
   - Set up feed import to =feed
   - Configure publish queue in -outbox

4. **Update settings storage**
   - Add systemFolders configuration
   - Implement locked vault mechanism
   - Store display mappings

#### Files to Modify:
- `src/renderer/src/components/WorkspaceSelector.tsx`
- `src/main/vaultManager.ts`
- `src/main/settings.ts`
- `src/renderer/src/store/workspaceStore.ts`

### Phase 2: Universal Indexing System (Critical)
**Duration**: 2-3 weeks
**Milestone**: v2.1.0

#### Tasks:
1. **Implement SQLite index database**
   - Create `index.db` with specified schema
   - Implement documents table
   - Implement frontmatter table
   - Implement tags table (Obsidian compatible)
   - Implement tasks table (Obsidian Tasks compatible)
   - Implement links table (wikilinks)
   - Implement blocks table (block references)

2. **Build indexing engine**
   - File watcher with debouncing
   - Incremental indexing on startup
   - Real-time updates on file changes
   - Full re-index capability

3. **Implement query API**
   - Search documents
   - Get tasks with filtering
   - Get tags with nesting support
   - Link resolution
   - Block reference lookup

4. **Integrate with existing features**
   - Connect Task View to new indexing
   - Update Obsidian Tasks parsing to use index
   - Add index-based search capabilities

#### Files to Create/Modify:
- `src/main/indexing/indexManager.ts` (new)
- `src/main/indexing/schema.sql` (new)
- `src/main/indexing/watcher.ts` (new)
- `src/main/indexing/queryAPI.ts` (new)
- `src/renderer/src/services/searchService.ts` (update)

### Phase 3: Binder System Implementation
**Duration**: 1-2 weeks
**Milestone**: v2.1.0

#### Tasks:
1. **Implement binder structure**
   - Create #binder-topic folders
   - Support internal and external paths
   - Add binder management UI

2. **Update workspace selector**
   - Add binders section
   - Implement binder creation/deletion
   - Add binder settings

3. **Integrate with indexing**
   - Index binder contents
   - Support cross-binder search
   - Implement binder-specific views

#### Files to Modify:
- `src/renderer/src/components/WorkspaceSelector.tsx`
- `src/main/binderManager.ts` (new)
- `src/renderer/src/store/binderStore.ts` (new)

### Phase 4: UI Components Implementation
**Duration**: 2 weeks
**Milestone**: v2.1.0

#### Tasks:
1. **Workspace selector dropdown**
   - Implement three-section layout (Workspaces, System, Binders)
   - Add create workspace button
   - Add manage binders button

2. **Workspace settings popover**
   - Implement master vault display (locked)
   - Add workspace selection dropdown
   - Add binder management section

3. **System folder icons and symbols**
   - Implement CSS classes for system folders
   - Add appropriate icons (📥, 📡, 📤)
   - Ensure consistent display mapping

#### Files to Modify:
- `src/renderer/src/components/WorkspaceSelector.tsx`
- `src/renderer/src/components/WorkspaceSettings.tsx`
- `src/renderer/src/styles/workspace.css`

### Phase 5: Testing and Stabilization
**Duration**: 1-2 weeks
**Milestone**: v2.1.0

#### Tasks:
1. **Comprehensive testing**
   - Test system folder creation and behavior
   - Test indexing accuracy and performance
   - Test binder functionality
   - Test UI components across platforms

2. **Performance optimization**
   - Optimize indexing for large vaults
   - Improve search query performance
   - Memory usage optimization

3. **Bug fixing**
   - Address any issues found in testing
   - Fix edge cases
   - Improve error handling

4. **Documentation**
   - Update user documentation
   - Add developer documentation
   - Create migration guide

## Integration with Current Roadmap

This implementation aligns with our **v2.1.0 milestone** (target: May 15, 2024) focused on **Task Management Enhancement**. The vault specification provides the foundation for:

- ✅ Enhanced Task View (already started)
- ✅ Workspace improvements (spec provides clear structure)
- ✅ Universal indexing (supports advanced task features)
- ✅ System flux folders (improves workflow)

## Technical Requirements

### Database
- SQLite for indexing
- Proper schema migrations
- Transaction support
- Performance optimization

### File System
- Cross-platform path handling
- File watching with debouncing
- Atomic operations for safety
- Error handling and recovery

### UI/UX
- Consistent workspace/binder/system folder display
- Responsive design
- Accessibility compliance
- Internationalization support

## Risk Assessment

### High Risks
1. **Indexing performance** - Large vaults may cause slowdowns
2. **Data migration** - Existing users need smooth transition
3. **Cross-platform compatibility** - Path handling differences

### Mitigation Strategies
1. Implement incremental indexing with debouncing
2. Create comprehensive migration tool
3. Use platform-agnostic path libraries
4. Extensive testing on all platforms

## Success Criteria

### Minimum Viable Implementation
- ✅ System flux folders working (+inbox, =feed, -outbox)
- ✅ Basic indexing with documents and tasks
- ✅ Workspace selector showing all sections
- ✅ No data loss during operations

### Full Implementation
- ✅ Complete universal indexing schema
- ✅ Full binder system with external paths
- ✅ Advanced search and query capabilities
- ✅ 90%+ test coverage
- ✅ Comprehensive documentation

## Next Steps

1. **Start with Phase 1** - System flux folders (highest priority)
2. **Set up database infrastructure** - For Phase 2 indexing
3. **Update UI components** - In parallel with backend work
4. **Integrate incrementally** - Ensure stability at each step

## Resources Required

- **Development**: 6-8 weeks total
- **Testing**: 2-3 weeks (can overlap with development)
- **Documentation**: 1 week
- **QA**: 1 week final testing

This implementation will provide a solid foundation for Marksmith's vault system that supports current features and enables future enhancements like collaboration, plugins, and mobile support.