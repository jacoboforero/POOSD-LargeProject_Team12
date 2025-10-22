#!/bin/bash

echo "🧹 Removing credentials from Git history..."

# Remove the specific commit that contains credentials
git rebase -i fea7460~1

echo ""
echo "📋 Instructions for interactive rebase:"
echo "1. Change 'pick' to 'drop' for commit fea7460"
echo "2. Save and exit (Ctrl+X, then Y, then Enter)"
echo "3. Force push: git push --force-with-lease origin main"
echo ""
echo "⚠️  WARNING: This will rewrite Git history!"
echo "Make sure your team knows about this change."
