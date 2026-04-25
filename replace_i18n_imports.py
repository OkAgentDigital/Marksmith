#!/usr/bin/env python3

import os
import re
import glob

def replace_i18n_imports(filepath):
    """Replace react-i18next imports with our mock module"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Replace react-i18next imports with our mock module
    content = re.sub(
        r'import\s+.*useTranslation.*from\s+.*react-i18next.*',
        'import { useTranslation } from "/mock-i18n"',
        content
    )
    
    content = re.sub(
        r'import\s+.*i18n.*from\s+.*react-i18next.*',
        'import i18n from "/mock-i18n"',
        content
    )
    
    content = re.sub(
        r'import\s+.*Trans.*from\s+.*react-i18next.*',
        'import { Trans } from "/mock-i18n"',
        content
    )
    
    content = re.sub(
        r'import\s+.*withTranslation.*from\s+.*react-i18next.*',
        'import { withTranslation } from "/mock-i18n"',
        content
    )
    
    # Replace i18next imports
    content = re.sub(
        r'import\s+.*i18next.*from\s+.*i18next.*',
        'import i18n from "/mock-i18n"',
        content
    )
    
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
        if replace_i18n_imports(filepath):
            modified_count += 1
            print(f"Modified: {filepath}")
    
    print(f"\nProcessed {len(files)} files, modified {modified_count} files")
    print("i18n import replacement complete!")

if __name__ == "__main__":
    main()