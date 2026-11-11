#!/bin/sh
COLOR_INFO='\033[1;30m'
COLOR_SUCCESS='\033[0;32m'
COLOR_ERROR='\033[0;31m'
COLOR_RESET='\033[0m'

echo "${COLOR_INFO}Checking branch name...${COLOR_RESET}\n"

local_branch_name="$(git rev-parse --abbrev-ref HEAD)"
valid_regex='^\b(feat|fix|chore)\b/.+$|^main$'

if ! echo "$local_branch_name" | grep -qE "$valid_regex"; then
    echo "${COLOR_ERROR}Error${COLOR_RESET} Branch name does not match pattern: $valid_regex\n"
    exit 1
fi

echo "${COLOR_SUCCESS}Branch name was validated\n"
