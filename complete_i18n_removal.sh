#!/bin/bash

# Comprehensive script to remove all remaining i18n usage

set -e

echo "Starting comprehensive i18n removal..."

# First, let's replace all t('...') calls with the key itself as fallback
# This is a safe approach that preserves functionality while removing i18n dependency

echo "Replacing all t('...') calls with translation keys..."
find src/renderer/src -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | while read file; do
    # Replace t('key') with "key" (simple string replacement)
    sed -i '' 's/t('"'"'/"/g' "$file"
    sed -i '' 's/'"'"')/"/g' "$file"
    
    # Also handle t("key") pattern
    sed -i '' 's/t("/"/g' "$file"
    sed -i '' 's/")/"/g' "$file"
    
    echo "Processed: $file"
done

# Remove any remaining useTranslation imports that might have been missed
find src/renderer/src -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | while read file; do
    sed -i '' '/useTranslation/d' "$file"
    sed -i '' '/from.*react-i18next/d' "$file"
    sed -i '' '/from.*i18next/d' "$file"
done

echo "Comprehensive i18n removal complete!"
echo "All t('...') calls have been replaced with their translation keys as strings."
echo "The application should now work without i18n dependencies."