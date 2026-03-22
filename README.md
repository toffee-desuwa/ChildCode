<!-- Logo placeholder — replace with actual logo -->
<!-- <p align="center"><img src="./public/logo.png" width="120" alt="ChildCode logo" /></p> -->

<h1 align="center">ChildCode — Scratch for the AI Era</h1>

<p align="center">
Block-based AI interaction for kids. No prompts. No code. Just drag, create, and learn.
</p>

<p align="center">
  <a href="https://github.com/toffee-desuwa/ChildCode/stargazers"><img src="https://img.shields.io/github/stars/toffee-desuwa/ChildCode?style=flat-square" alt="Stars" /></a>
  <a href="https://github.com/toffee-desuwa/ChildCode/network/members"><img src="https://img.shields.io/github/forks/toffee-desuwa/ChildCode?style=flat-square" alt="Forks" /></a>
  <a href="https://github.com/toffee-desuwa/ChildCode/blob/main/LICENSE"><img src="https://img.shields.io/github/license/toffee-desuwa/ChildCode?style=flat-square" alt="License" /></a>
  <a href="https://childcode-one.vercel.app"><img src="https://img.shields.io/badge/demo-live-indigo?style=flat-square" alt="Live Demo" /></a>
</p>

<p align="center">
  <em>[Demo GIF coming soon — blocks drag in → generate → change block → image changes]</em>
</p>

---

## What is ChildCode?

ChildCode lets children create AI-generated images by dragging visual blocks — no typing, no prompt engineering. Kids learn that **what they say to AI matters** by seeing how each block change transforms the output.

## Why ChildCode?

Children progress through three levels of AI literacy:

| Level | Age | What They Learn |
|-------|-----|----------------|
| **Prompt Intuition** | 8–12 | "What I say to AI matters" — drag blocks, see results change |
| **Skill Thinking** | 12–16 | "I can save and reuse patterns" — templates, history |
| **Harness Thinking** | 14+ | "I can break goals into steps" — multi-step storyboards |

## Demo

**Live:** [childcode-one.vercel.app](https://childcode-one.vercel.app)

<!-- Screenshots placeholder — replace with actual dark-theme screenshots -->
<!-- <p align="center"><img src="./docs/screenshots/workspace.png" width="720" alt="Workspace" /></p> -->

## Quick Start

```bash
git clone https://github.com/toffee-desuwa/ChildCode.git
cd ChildCode
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — that's it.

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌───────────────────┐     ┌─────────────┐
│   Blockly    │────▶│  JSON Truth Layer │────▶│ Prompt Derivation  │────▶│  Image API  │
│  (Visual UI) │     │  (Structured Data)│     │ (Natural Language) │     │  (Output)   │
└─────────────┘     └──────────────────┘     └───────────────────┘     └─────────────┘
     Drag &               Source of              Deterministic            OpenAI /
     drop blocks          truth                  text generation          Compatible API
```

**Why two layers?** Most kids tools send raw user input to AI. ChildCode separates *structure* (JSON) from *execution* (prompt), so children learn that AI output is **deterministic and controllable**, not magic.

**Tech stack:** React 19 · Vite 8 · Blockly 12 · Tailwind CSS · Pure frontend (no backend)

## Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## License

MIT

---

<p align="center">
  <a href="./README-CN.md">中文版</a>
</p>
