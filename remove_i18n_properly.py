#!/usr/bin/env python3

import os
import re
import glob

def remove_i18n_from_file(filepath):
    """Remove i18n imports and replace t() calls with strings"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Remove i18n imports
    content = re.sub(r'import\s+.*useTranslation.*from\s+.*react-i18next.*\n?', '', content)
    content = re.sub(r'import\s+.*i18n.*from\s+.*react-i18next.*\n?', '', content)
    content = re.sub(r'import\s+.*i18n.*from\s+.*i18next.*\n?', '', content)
    content = re.sub(r'import\s+.*Trans.*from\s+.*react-i18next.*\n?', '', content)
    content = re.sub(r'import\s+.*withTranslation.*from\s+.*react-i18next.*\n?', '', content)
    
    # Remove useTranslation hook calls
    content = re.sub(r'const\s*\{.*t.*\}\s*=\s*useTranslation\(\).*\n?', '', content)
    content = re.sub(r'const\s*\{.*t,.*\}\s*=\s*useTranslation\(\).*\n?', '', content)
    content = re.sub(r'useTranslation\(\).*\n?', '', content)
    
    # Replace t('key') with "key" (but be careful not to break existing strings)
    # This regex matches t('...') and replaces with the content as a string
    content = re.sub(r't\(\s*[\'\"]([^\'\"]+)[\'\"]\s*\)', r'"\1"', content)
    
    # Also handle t("key") pattern
    content = re.sub(r't\(\s*"([^"]+)"\s*\)', r'"\1"', content)
    content = re.sub(r't\(\s*\'([^\']+)\'\s*\)', r'"\1"', content)
    
    # Replace i18next."key" with "key"
    content = re.sub(r'i18next\."([^"]+)"', r'"\1"', content)
    content = re.sub(r'i18next\.\'([^\']+)\'', r'"\1"', content)
    
    # Replace i18next.t('key') with "key"
    content = re.sub(r'i18next\.t\(\s*[\'\"]([^\'\"]+)[\'\"]\s*\)', r'"\1"', content)
    
    # Remove i18next.changeLanguage calls
    content = re.sub(r'i18next\.changeLanguage\(.*\)\s*\n?', '', content)
    
    # Clean up any empty lines or trailing commas
    content = re.sub(r',\s*\n\s*\n', '\n\n', content)
    content = re.sub(r',\s*\n\s*}', '\n}', content)
    content = re.sub(r',\s*\n\s*\)', '\n)', content)
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    # Find all TypeScript/JSX files
    files = []
    for pattern in ['src/renderer/src/**/*.tsx', 'src/renderer/src/**/*.ts', 
                   'src/renderer/src/**/*.jsx', 'src/renderer/src/**/*.js']:
        files.extend(glob.glob(pattern, recursive=True))
    
    modified_count = 0
    for filepath in files:
        if remove_i18n_from_file(filepath):
            modified_count += 1
            print(f"Modified: {filepath}")
    
    print(f"\nProcessed {len(files)} files, modified {modified_count} files")
    print("i18n removal complete!")

if __name__ == "__main__":
    main()