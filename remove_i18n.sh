#!/bin/bash

# Script to remove i18n from Marksmith and replace with hardcoded English strings

set -e

echo "Starting i18n removal..."

# Remove i18n imports from all TypeScript/JSX files
find src/renderer/src -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | while read file; do
    # Remove useTranslation imports
    sed -i '' '/import.*useTranslation.*from.*react-i18next/d' "$file"
    
    # Remove i18n imports  
    sed -i '' '/import.*i18n.*from.*react-i18next/d' "$file"
    sed -i '' '/import.*i18n.*from.*i18next/d' "$file"
    
    # Remove Trans component imports
    sed -i '' '/import.*Trans.*from.*react-i18next/d' "$file"
    
    # Remove withTranslation imports
    sed -i '' '/import.*withTranslation.*from.*react-i18next/d' "$file"
    
    echo "Processed imports in: $file"
done

# Replace common translation patterns with hardcoded English strings
echo "Replacing translation calls with hardcoded strings..."

# TreeEmpty.tsx
sed -i '' 's/{t('"'"'noDocuments'"'"')}/{"No documents"}/g' src/renderer/src/ui/sidebar/tree/TreeEmpty.tsx

# EditFolderDialog.tsx
sed -i '' 's/{t('"'"'specialCharError'"'"')}/{"Special characters are not allowed"}/g' src/renderer/src/ui/sidebar/tree/EditFolderDialog.tsx
sed -i '' 's/{t('"'"'folderExists'"'"')}/{"Folder already exists"}/g' src/renderer/src/ui/sidebar/tree/EditFolderDialog.tsx
sed -i '' 's/{t('"'"'createNewFolder'"'"')}/{"Create New Folder"}/g' src/renderer/src/ui/sidebar/tree/EditFolderDialog.tsx
sed -i '' 's/{t('"'"'update'"'"')}/{"Update"}/g' src/renderer/src/ui/sidebar/tree/EditFolderDialog.tsx
sed -i '' 's/{t('"'"'folderName'"'"')}/{"Folder Name"}/g' src/renderer/src/ui/sidebar/tree/EditFolderDialog.tsx
sed -i '' 's/{t('"'"'create'"'"')}/{"Create"}/g' src/renderer/src/ui/sidebar/tree/EditFolderDialog.tsx

# Tree.tsx
sed -i '' 's/{t('"'"'search'"'"')}/{"Search"}/g' src/renderer/src/ui/sidebar/tree/Tree.tsx

# ToogleSpace.tsx
sed -i '' 's/{t('"'"'selectWorkspace'"'"')}/{"Select Workspace"}/g' src/renderer/src/ui/sidebar/tree/ToogleSpace.tsx
sed -i '' 's/{t('"'"'workspaceSettings'"'"')}/{"Workspace Settings"}/g' src/renderer/src/ui/sidebar/tree/ToogleSpace.tsx
sed -i '' 's/{t('"'"'createWorkspace'"'"')}/{"Create Workspace"}/g' src/renderer/src/ui/sidebar/tree/ToogleSpace.tsx

# FullSearch.tsx
sed -i '' 's/{t('"'"'back'"'"')}/{"Back"}/g' src/renderer/src/ui/sidebar/tree/FullSearch.tsx
sed -i '' 's/{t('"'"'semanticSearch'"'"')}/{"Semantic Search"}/g' src/renderer/src/ui/sidebar/tree/FullSearch.tsx
sed -i '' 's/{t('"'"'noResults'"'"')}/{"No results for"}/g' src/renderer/src/ui/sidebar/tree/FullSearch.tsx

# TreeRender.tsx
sed -i '' 's/{t('"'"'folders'"'"')}/{"Folders"}/g' src/renderer/src/ui/sidebar/tree/TreeRender.tsx
sed -i '' 's/{t('"'"'noSpaceDocuments'"'"')}/{"No documents in this space"}/g' src/renderer/src/ui/sidebar/tree/TreeRender.tsx
sed -i '' 's/{t('"'"'newDoc'"'"')}/{"New Document"}/g' src/renderer/src/ui/sidebar/tree/TreeRender.tsx

# Trash.tsx
sed -i '' 's/{t('"'"'tip'"'"')}/{"Tip"}/g' src/renderer/src/ui/sidebar/tree/Trash.tsx

# Settings.tsx
sed -i '' 's/{t('"'"'settings.tabs.editor'"'"')}/{"Editor"}/g' src/renderer/src/ui/settings/Settings.tsx
sed -i '' 's/{t('"'"'settings.tabs.model'"'"')}/{"Model"}/g' src/renderer/src/ui/settings/Settings.tsx
sed -i '' 's/{t('"'"'settings.tabs.keyboard'"'"')}/{"Keyboard"}/g' src/renderer/src/ui/settings/Settings.tsx

# Remove useTranslation hook calls
find src/renderer/src -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | while read file; do
    # Remove const { t } = useTranslation() lines
    sed -i '' '/const.*{ t }.*=.*useTranslation/d' "$file"
    sed -i '' '/const.*{ t,.*}.*=.*useTranslation/d' "$file"
    
    # Remove unused useTranslation calls
    sed -i '' '/useTranslation()/d' "$file"
    
    echo "Processed useTranslation in: $file"
done

echo "i18n removal complete!"
echo "Please review the changes and test the application."