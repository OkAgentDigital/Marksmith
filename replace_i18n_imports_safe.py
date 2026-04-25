#!/usr/bin/env python3

import os
import re
import glob

def replace_i18n_imports(filepath):
    """Safely replace react-i18next and i18next imports with our mock module"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Replace react-i18next imports
    content = re.sub(
        r'import\s+{.*useTranslation.*}\s+from\s+[\'\"](?:react-i18next)[\'\"]',
        'import { useTranslation } from "@/i18n.mock"',
        content
    )
    
    content = re.sub(
        r'import\s+{.*Trans.*}\s+from\s+[\'\"](?:react-i18next)[\'\"]',
        'import { Trans } from "@/i18n.mock"',
        content
    )
    
    content = re.sub(
        r'import\s+{.*withTranslation.*}\s+from\s+[\'\"](?:react-i18next)[\'\"]',
        'import { withTranslation } from "@/i18n.mock"',
        content
    )
    
    # Replace i18next imports
    content = re.sub(
        r'import\s+i18n\s+from\s+[\'\"](?:i18next)[\'\"]',
        'import i18n from "@/i18n.mock"',
        content
    )
    
    # Replace @/utils/i18n imports
    content = re.sub(
        r'import\s+.*from\s+[\'\"](?:@/utils/i18n)[\'\"]',
        'import i18n from "@/i18n.mock"',
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
    for pattern in ['src/renderer/src/**/*.tsx', 'src/renderer/src/**/*.ts']:
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