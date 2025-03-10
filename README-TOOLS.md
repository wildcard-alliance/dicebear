# Running Tools from Package Directories

This document explains how to use the monorepo tools from within package directories like `packages/dicebear`.

## Overview

Each package in the Smarty Pants monorepo now includes a `run-tool.sh` script that allows you to run any monorepo tool from within that package directory. This script ensures that:

1. The tool runs from the correct monorepo root context
2. The tool has knowledge of which package it was invoked from
3. The tools have access to all necessary files and credentials

## Usage

From any package directory, you can run tools using:

```bash
# Run from the package directory
cd packages/dicebear
./run-tool.sh <tool-name> [arguments]

# Examples:
./run-tool.sh query n8n "How do I create a workflow?"
./run-tool.sh browser-use "Search for DiceBear avatar examples"
./run-tool.sh perplexity "Latest changes to avatar generation libraries"
```

## Available Tools

The main tools available across all packages are:

- `query` - Query documentation and codebase knowledge
- `browser-use` - Automate browser tasks
- `perplexity` - Search the web
- `fetch` - Make HTTP requests

## How It Works

The `run-tool.sh` script:

1. Detects the monorepo root directory
2. Sets the correct package context using environment variables
3. Changes to the monorepo root
4. Invokes the tool with the proper context preserved

This ensures that tools like `browser-use` and others can properly function when invoked from any package in the monorepo.