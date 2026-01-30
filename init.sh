#!/bin/bash
# Long-Running Agent Harness - Initialization Script
# Run this at the start of each session to verify baseline functionality

set -e

echo "========================================="
echo "  Agent Harness - Session Initialization"
echo "========================================="

PROJECT_DIR="${1:-.}"
cd "$PROJECT_DIR"

echo ""
echo "[1/5] Checking project structure..."
if [ -f "claude-progress.txt" ]; then
    echo "  ✓ Progress file found"
else
    echo "  ✗ Missing claude-progress.txt"
    exit 1
fi

if [ -f "features.json" ]; then
    echo "  ✓ Features file found"
else
    echo "  ✗ Missing features.json"
    exit 1
fi

echo ""
echo "[2/5] Git status..."
if [ -d ".git" ]; then
    echo "  Recent commits:"
    git log --oneline -5 2>/dev/null || echo "  No commits yet"
    echo ""
    echo "  Working tree status:"
    git status --short 2>/dev/null || echo "  Clean"
else
    echo "  ✗ Not a git repository - initializing..."
    git init
    git add -A
    git commit -m "Initial commit - project setup" 2>/dev/null || echo "  No files to commit"
fi

echo ""
echo "[3/5] Feature progress..."
if command -v jq &> /dev/null; then
    TOTAL=$(jq '.features | length' features.json)
    COMPLETE=$(jq '[.features[] | select(.status == "complete")] | length' features.json)
    IN_PROGRESS=$(jq '[.features[] | select(.status == "in_progress")] | length' features.json)
    PENDING=$(jq '[.features[] | select(.status == "pending")] | length' features.json)
    echo "  Total: $TOTAL | Complete: $COMPLETE | In Progress: $IN_PROGRESS | Pending: $PENDING"
else
    echo "  (install jq for feature statistics)"
fi

echo ""
echo "[4/5] Environment check..."
# Add project-specific checks here
# Examples:
# [ -f "package.json" ] && echo "  Node.js project detected" && npm install
# [ -f "requirements.txt" ] && echo "  Python project detected" && pip install -r requirements.txt
# [ -f "Cargo.toml" ] && echo "  Rust project detected" && cargo build
echo "  (customize environment checks in init.sh)"

echo ""
echo "[5/5] Running smoke tests..."
# Add project-specific smoke tests here
# Examples:
# npm run test:smoke
# pytest tests/smoke/
# cargo test --lib
echo "  (customize smoke tests in init.sh)"

echo ""
echo "========================================="
echo "  Initialization complete"
echo "========================================="
echo ""
echo "Next: Read claude-progress.txt and features.json to continue work"
