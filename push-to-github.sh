#!/bin/sh
# Run this script in your terminal to push Pettagama to GitHub.
# You will be prompted for your GitHub credentials (use a Personal Access Token as password).

cd "$(dirname "$0")"

if ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin https://github.com/GiharaH/Pettagama.git
fi

echo "Pushing to https://github.com/GiharaH/Pettagama ..."
git push -u origin master

if [ $? -eq 0 ]; then
  echo "Done! Check https://github.com/GiharaH/Pettagama"
else
  echo ""
  echo "If push failed:"
  echo "1. Create a Personal Access Token at: https://github.com/settings/tokens"
  echo "   (Scope: repo)"
  echo "2. Run this script again; when asked for password, paste the token."
  echo "Or use SSH: git remote set-url origin git@github.com:GiharaH/Pettagama.git && git push -u origin master"
fi
