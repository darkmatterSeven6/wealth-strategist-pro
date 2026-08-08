#!/usr/bin/env bash
# ==============================================================================
# DV FINANCIALS - Git Repository Initialization & Sync Script
# ==============================================================================

set -e

echo "======================================================="
echo "   DV FINANCIALS - Repository Initialization & Setup   "
echo "======================================================="

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
  echo "[+] Initializing new Git repository..."
  git init -b main
else
  echo "[✓] Existing Git repository detected."
fi

# Configure remote repository if not set
REMOTE_URL=$(git config --get remote.origin.url || echo "")
if [ -z "$REMOTE_URL" ]; then
  echo "[+] Setting remote origin to https://github.com/darkmatterSeven6/wealth-strategist-pro.git"
  git remote add origin https://github.com/darkmatterSeven6/wealth-strategist-pro.git
fi

# Stash & commit current files
echo "[+] Staging files..."
git add .

echo "[+] Creating commit..."
git commit -m "feat: Initialize DV Financials wealth hub repository and assets" || true

echo "======================================================="
echo "   DV Financials Git repository initialized successfully! "
echo "======================================================="
