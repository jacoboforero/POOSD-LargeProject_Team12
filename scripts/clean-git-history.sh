#!/bin/bash

# Script to clean sensitive data from Git history
# WARNING: This will rewrite Git history - use with caution!

echo "🚨 WARNING: This script will rewrite Git history!"
echo "Make sure you have backups and coordinate with your team."
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Operation cancelled."
    exit 1
fi

echo "🧹 Cleaning Git history of sensitive data..."

# Remove sensitive data from all commits
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch scripts/setup-server.sh DEPLOYMENT.md 2>/dev/null || true' \
--prune-empty --tag-name-filter cat -- --all

# Force push to remove from remote (DANGEROUS - coordinate with team)
echo ""
echo "⚠️  Next steps:"
echo "1. Force push to remove from remote: git push --force-with-lease origin main"
echo "2. Notify your team to re-clone the repository"
echo "3. Add the cleaned files back: git add scripts/setup-server.sh DEPLOYMENT.md"
echo "4. Commit the cleaned files: git commit -m 'Add cleaned deployment files'"
echo "5. Push normally: git push origin main"

echo ""
echo "✅ Git history cleaned locally."
echo "⚠️  Remember to coordinate with your team before force pushing!"
