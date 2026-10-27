# Project Map

## Purpose
Boardroom: teachers write or type C++ (C++17 via g++) or Python on an Excalidraw board, select a region, supply stdin in blue, and run it in Docker locally or Wandbox when hosted; errors show in the editable code panel. Built for the Craft N Code Karnataka 2026 hackathon (AI for Education).

## Requirements
Hackathon submission by PR: README sections, public repo, ~5 min demo video, 8-slide deck, submission.md answers (see root README.md).

## Components (verified from docs/files)
- src/ (React + Excalidraw UI; board.js, capture.js, handwriting.js, lessons.js, libraries.js)
- server/ (Node API: index.mjs, ocr.mjs -> local ocr-service (Qwen2-VL), sandbox.mjs -> Docker, snapshots.mjs -> local git)
- runner/ (Dockerfile, runner.py, lib/*.h teaching headers)
- tests/, scripts/, docs/ under whiteboard-code-verifier/

## Main Flow
typed/handwritten board -> (local Qwen2-VL OCR + teacher confirm, if handwritten) -> POST /api/run -> sandbox.mjs -> Docker container -> runner.py -> GCC (+ASan/UBSan) -> result -> diagnostics highlighted on board

## Data and Trust Boundaries
No database. No AI API key; OCR runs locally. Submitted code runs only in locked-down Docker container. Local-only prototype.

## Build and Deployment
Verified locally: `npm ci`, `npm run runner:build`, `npm run dev` in whiteboard-code-verifier/ (Node 24, Docker Desktop). Hosted: Vercel from main (Wandbox runner); teammates also added Railway config.

## Unknowns
Hackathon submission status (video, slides, submission.md); whether C support should return alongside C++.
