#!/bin/bash
cd "$(dirname "$0")"
export NODE_ENV=development
export ELECTRON_ENABLE_LOGGING=1
npm run dev