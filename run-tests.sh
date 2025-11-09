#!/usr/bin/env bash

# Unified test runner for backend + frontend suites with colorized output.

set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GREEN="\033[32m"
RED="\033[31m"
BLUE="\033[34m"
YELLOW="\033[33m"
RESET="\033[0m"
BAR="══════════════════════════════════════════════════════════════"

declare -a SUMMARY=()
FAILURES=0

print_section() {
  local title="$1"
  echo -e "\n${BLUE}${BAR}${RESET}"
  echo -e "${BLUE}▶ ${title}${RESET}"
  echo -e "${BLUE}${BAR}${RESET}\n"
}

run_suite() {
  local title="$1"
  local workdir="$2"
  shift 2

  print_section "$title"

  if (cd "${ROOT_DIR}/${workdir}" && "$@"); then
    echo -e "\n${GREEN}✔ ${title} passed${RESET}"
    SUMMARY+=("✔ ${title}")
  else
    echo -e "\n${RED}✘ ${title} failed${RESET}"
    SUMMARY+=("✘ ${title}")
    FAILURES=$((FAILURES + 1))
  fi
}

run_suite "Backend • Jest" "backend" npm test
run_suite "Frontend • Vitest" "frontend" npm test

echo -e "\n${YELLOW}${BAR}${RESET}"
echo -e "${YELLOW}Test Summary${RESET}"
echo -e "${YELLOW}${BAR}${RESET}"
for entry in "${SUMMARY[@]}"; do
  if [[ "$entry" == ✔* ]]; then
    echo -e "${GREEN}${entry}${RESET}"
  else
    echo -e "${RED}${entry}${RESET}"
  fi
done
echo -e "${YELLOW}${BAR}${RESET}\n"

if [[ $FAILURES -gt 0 ]]; then
  exit 1
fi
