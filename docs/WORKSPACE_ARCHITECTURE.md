# Marksmith Workspace & Binder Architecture

**Version:** 1.0.0  
**Applies to:** Marksmith v2.0.4+  
**Core Concept:** Two master vaults → each contains workspace folders → external folders become binders

---

## 1. Core Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         MARKSMITH                               │
│                                                                  │
│  ┌─────────────────────────┐    ┌─────────────────────────┐     │
│  │      MD VAULT            │    │     CODE VAULT           │     │
│  │      ~/vault/            │    │    ~/code-vault/         │     │
│  │                          │    │                          │     │
│  │  ┌────────────────────┐  │    │  ┌────────────────────┐  │     │
│  │  │  WORKSPACE FOLDERS  │  │    │  │  WORKSPACE FOLDERS  │  │     │
│  │  │  @toybox           │  │    │  │  @toybox           │  │     │
│  │  │  @inbox            │  │    │  │  @inbox            │  │     │
│  │  │  @sandbox          │  │    │  │  @sandbox          │  │     │
│  │  │  @public           │  │    │  │  @public           │  │     │
│  │  │  @private          │  │    │  │  @private          │  │     │
│  │  │  @outbox           │  │    │  │  @outbox           │  │     │
│  │  └────────────────────┘  │    │  └────────────────────┘  │     │
│  │                          │    │                          │     │
│  │  + Any user folders      │    │  + Any user folders      │     │
│  └─────────────────────────┘    └─────────────────────────┘     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                      BINDERS                              │    │
│  │  (External folders imported, each is a topic workspace)   │    │
│  │                                                          │    │
│  │  ┌─────────────────┐  ┌─────────────────┐               │    │
│  │  │ client-projects │  │  team-docs      │               │    │
│  │  │ → /Documents/   │  │  → /Shared/     │               │    │
│  │  │    clients/     │  │     team/       │               │    │
│  │  └─────────────────┘  └─────────────────┘               │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Workspace Folders (Inside Vault)

These are **special directories** created automatically in each master vault root. They are **not** binders — they are native workspace folders with specific behaviors.

### 2.1 `@toybox` — Experimental Scratch Space

| Property | Value |
|----------|-------|
| Purpose | Drafts, experiments, temporary notes |
| Search indexed | Yes |
| Auto-cleanup | Never (user managed) |
| Export | Included |
| Cross-vault linking | Yes |

**Use case:** Trying out new syntax, drafting ideas, quick notes that may be deleted.

### 2.2 `@inbox` — Uncategorized Incoming

| Property | Value |
|----------|-------|
| Purpose | Default destination for imports, quick captures |
| Search indexed | Yes |
| Auto-cleanup | Optional (user setting: days to keep) |
| Export | Included |
| Special behavior | New notes via `Cmd+N` go here by default |

**Use case:** Imported RSS items, dragged files, quick `Cmd+N` notes.

### 2.3 `@sandbox` — Isolated Testing Area

| Property | Value |
|----------|-------|
| Purpose | Safe testing of syntax, embeds, destructive edits |
| Search indexed | No (by default, configurable) |
| Cross-vault linking | Blocked by default (configurable) |
| Export | Excluded by default |

**Use case:** Testing markdown features, trying dangerous operations.

### 2.4 `@public` — Ready for Sharing

| Property | Value |
|----------|-------|
| Purpose | Polished notes ready for export/publishing |
| Search indexed | Yes |
| Export | Priority (first in export dialogs) |
| Special behavior | Default source for publishing commands |

**Use case:** Blog posts, documentation, notes to share externally.

### 2.5 `@private` — Personal/Restricted

| Property | Value |
|----------|-------|
| Purpose | Sensitive notes, journal, personal reflections |
| Search indexed | Yes (but excluded from some views) |
| Export | Excluded by default |
| Visual indicator | Lock icon, muted color |

**Use case:** Daily journal, personal notes, draft letters.

### 2.6 `@outbox` — Pending Export/Publish

| Property | Value |
|----------|-------|
| Purpose | Notes queued for publishing or processing |
| Search indexed | Yes |
| Auto-cleanup | When published (optional) |
| Special behavior | Publishing reads from here by default |

**Use case:** Notes ready for blog publish, batch export queue.

---

## 3. Workspace Folder Behavior Matrix

| Feature | @toybox | @inbox | @sandbox | @public | @private | @outbox |
|---------|---------|--------|----------|---------|----------|---------|
| Search indexed | ✅ | ✅ | ⚠️ Option | ✅ | ✅ | ✅ |
| Cross-vault links | ✅ | ✅ | ⚠️ Option | ✅ | ❌ | ✅ |
| Export included | ✅ | ✅ | ❌ | ✅ | ❌ | ⚠️ When ready |
| Auto-cleanup | ❌ | ⚠️ Option | ❌ | ❌ | ❌ | ⚠️ On publish |
| Default capture | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Publishing source | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |

---

## 4. Binders — External Topic Workspaces

### 4.1 What is a Binder?

A **Binder** is an external folder (outside `~/vault/` or `~/code-vault/`) that Marksmith imports and treats as a **dedicated topic workspace**.

**Key characteristics:**
- Lives anywhere on your file system
- Fully indexed (search, tasks, contacts, calendar)
- Appears in sidebar under "Binders" section
- Supports `#binder/` syntax for cross-referencing

### 4.2 Binder vs Workspace Folder

| Aspect | Workspace Folder (@toybox, etc.) | Binder |
|--------|--------------------------------|--------|
| Location | Inside master vault | Anywhere on disk |
| Creation | Auto-created by Marksmith | User adds via Settings |
| Purpose | General organization | Dedicated topic/project |
| Cross-linking | Via `[[note]]` | Via `#binder/note` |
| Removal | Delete folder | Remove from Settings (files untouched) |

### 4.3 Binder Example

```bash
# External project folder
/Users/alice/Documents/client-acme/

# Added as binder "acme-project"
# Accessed in Marksmith via: #binder/meeting-notes.md
```

**Sidebar display:**
```
📌 BINDERS
   ├── acme-project → /Documents/client-acme/
   └── team-handbook → /Shared/team-handbook/
```

### 4.4 Binder Configuration

```json
{
  "binders": [
    {
      "id": "acme-project",
      "name": "Acme Project",
      "path": "/Users/alice/Documents/client-acme/",
      "indexed": true,
      "extractTasks": true,
      "extractContacts": true,
      "autoSync": true
    }
  ]
}
```

---

## 5. Default Vault Layout

### 5.1 `~/vault/` (MD Vault) — Same for `~/code-vault/`

```
~/vault/                         # or ~/code-vault/
│
├── @toybox/                     # Experimental scratch space
│   └── README.md
│
├── @inbox/                      # Uncategorized incoming
│   └── README.md
│
├── @sandbox/                    # Isolated testing area
│   └── README.md
│
├── @public/                     # Ready for sharing
│   └── README.md
│
├── @private/                    # Personal/restricted
│   └── README.md
│
├── @outbox/                     # Pending export/publish
│   └── README.md
│
├── assets/                      # Images, attachments
│   └── .gitkeep
│
├── templates/                   # Note templates
│   ├── daily.md
│   ├── contact.md
│   └── project.md
│
├── .marksmith/                  # App state (DO NOT SYNC)
│   ├── index.db
│   ├── settings.json
│   └── binders.json
│
├── WELCOME.md                   # First-time user guide
└── README.md                    # Vault overview
```

### 5.2 Seed README Content

**`@toybox/README.md`:**
```markdown
# Toybox

> Experimental scratch space. Nothing here is permanent.

Use this folder for:
- Drafting ideas
- Testing syntax
- Quick temporary notes

Files here are indexed and searchable.
```

**`@inbox/README.md`:**
```markdown
# Inbox

> Uncategorized incoming notes. Process regularly.

New notes created with `Cmd+N` go here by default.

**Recommended workflow:**
1. Review daily
2. Add tags or frontmatter
3. Move to appropriate folder
4. Delete what's not needed
```

**`@sandbox/README.md`:**
```markdown
# Sandbox

> Isolated testing area. Cross-vault links blocked by default.

Safe for:
- Testing destructive edits
- Trying embeds and queries
- Experimental formatting

**Note:** Content here is excluded from search and export by default.
```

**`@public/README.md`:**
```markdown
# Public

> Notes ready for sharing or publishing.

When you publish, this folder is the default source.

**Requirements for publication:**
- Complete frontmatter (title, date, tags)
- No broken links
- Reviewed for sensitive content
```

**`@private/README.md`:**
```markdown
# Private

> 🔒 Personal notes. Excluded from exports.

Use for:
- Daily journal
- Personal reflections
- Sensitive information

**Note:** These are still plain markdown files. Encrypt at rest if needed.
```

**`@outbox/README.md`:**
```markdown
# Outbox

> Pending export or publishing queue.

Move notes here when they're ready to be:
- Published to a blog
- Exported to PDF/HTML
- Processed by external tools

When publishing completes, files are moved to @public or deleted.
```

---

## 6. Workspace vs Binder Summary

| Concept | Location | Created By | Purpose | Syntax |
|---------|----------|------------|---------|--------|
| **@toybox** | Inside vault | Auto | Experiments | `[[note]]` |
| **@inbox** | Inside vault | Auto | Incoming | `[[note]]` |
| **@sandbox** | Inside vault | Auto | Testing | `[[note]]` (blocked) |
| **@public** | Inside vault | Auto | Publishing | `[[note]]` |
| **@private** | Inside vault | Auto | Personal | `[[note]]` |
| **@outbox** | Inside vault | Auto | Export queue | `[[note]]` |
| **Binder** | Anywhere | User | Topic/project | `#binder/note` |

---

## 7. User Workflow Examples

### 7.1 Daily Capture
1. `Cmd+N` → creates note in `@inbox/`
2. Write content, add tags
3. Move to `@toybox/` (experiment) or `@public/` (ready)
4. Or delete if not needed

### 7.2 Publishing Workflow
1. Polish note in `@public/`
2. Move to `@outbox/` when ready
3. Run `File → Publish`
4. Note moves to `@public/archive/` or is deleted

### 7.3 External Project (Binder)
1. `Settings → Binders → Add Binder`
2. Select `/Users/alice/Documents/client-project/`
3. Name binder "Acme Client"
4. Access via `#binder/meeting-notes.md`
5. Tasks and contacts in binder appear in global views

---

## 8. Quick Reference

```markdown
# Marksmith Workspace Quick Reference

## Master Vaults
| Vault | Path | Use |
|-------|------|-----|
| MD | ~/vault/ | Writing, notes, personal |
| CODE | ~/code-vault/ | Technical, code, projects |

## Workspace Folders (inside vault)
| Folder | Purpose | Search | Export |
|--------|---------|--------|--------|
| @toybox | Experiments | ✅ | ✅ |
| @inbox | Incoming | ✅ | ✅ |
| @sandbox | Testing | ❌ | ❌ |
| @public | Publishing | ✅ | Priority |
| @private | Personal | ✅ | ❌ |
| @outbox | Export queue | ✅ | When ready |

## Binders (external)
- Any folder on disk
- Added via Settings
- Accessed with `#binder/`
- Fully indexed
```

---

**End of Marksmith Workspace & Binder Architecture**

*For implementation: Seed both vaults with identical structure. Auto-create on first launch. Binders require user action.*