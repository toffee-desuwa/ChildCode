<!-- Logo placeholder — 替换为实际 logo -->
<!-- <p align="center"><img src="./public/logo.png" width="120" alt="ChildCode logo" /></p> -->

<h1 align="center">ChildCode — AI 时代的 Scratch</h1>

<p align="center">
用积木式交互让孩子玩转 AI。不用写提示词，不用写代码，拖拽即创作。
</p>

<p align="center">
  <a href="https://github.com/toffee-desuwa/ChildCode/stargazers"><img src="https://img.shields.io/github/stars/toffee-desuwa/ChildCode?style=flat-square" alt="Stars" /></a>
  <a href="https://github.com/toffee-desuwa/ChildCode/network/members"><img src="https://img.shields.io/github/forks/toffee-desuwa/ChildCode?style=flat-square" alt="Forks" /></a>
  <a href="https://github.com/toffee-desuwa/ChildCode/blob/main/LICENSE"><img src="https://img.shields.io/github/license/toffee-desuwa/ChildCode?style=flat-square" alt="License" /></a>
  <a href="https://childcode-one.vercel.app"><img src="https://img.shields.io/badge/demo-在线体验-indigo?style=flat-square" alt="在线体验" /></a>
  <a href="https://huggingface.co/spaces/toffee-desuwa/ChildCode"><img src="https://img.shields.io/badge/%F0%9F%A4%97-HF%20Space-yellow?style=flat-square" alt="HF Space" /></a>
</p>

<p align="center">
  <a href="https://childcode-one.vercel.app">
    <img src="./public/demo-images/demo-005.png" width="256" alt="机器人跳舞 - 卡通风" />
    <img src="./public/demo-images/demo-006.png" width="256" alt="机器人跳舞 - 油画风" />
  </a>
  <br/>
  <em>同样的积木，换个风格 — 改一个积木，看效果怎么变</em>
</p>

---

## ChildCode 是什么？

ChildCode 让孩子通过拖拽可视化积木来创作 AI 生成的图片 — 不需要打字，不需要学提示词工程。孩子会发现：**我对 AI 说的话，真的会改变结果。**

## 为什么选 ChildCode？

孩子在使用中自然经历三个成长阶段：

| 阶段 | 年龄 | 学到什么 |
|------|------|---------|
| **提示直觉** | 8–12 | "我说的话会影响结果" — 拖积木，看变化 |
| **技能思维** | 12–16 | "我可以保存和复用模式" — 模板、历史记录 |
| **驾驭思维** | 14+ | "我可以把目标拆成步骤" — 多步骤故事板 |

## 在线体验

**试试看：** [childcode-one.vercel.app](https://childcode-one.vercel.app) | [HF Space](https://huggingface.co/spaces/toffee-desuwa/ChildCode)

## 快速开始

```bash
git clone https://github.com/toffee-desuwa/ChildCode.git
cd ChildCode
npm install
npm run dev
```

打开 [http://localhost:5173](http://localhost:5173) 即可使用。

## 架构

```
┌─────────────┐     ┌──────────────────┐     ┌───────────────────┐     ┌─────────────┐
│   Blockly    │────▶│  JSON 真相层      │────▶│   提示词派生       │────▶│  图像 API    │
│  (可视化界面) │     │  (结构化数据)      │     │  (自然语言)        │     │  (输出)      │
└─────────────┘     └──────────────────┘     └───────────────────┘     └─────────────┘
     拖拽积木            唯一数据源              确定性文本生成           OpenAI /
                                                                     兼容 API
```

**为什么要分两层？** 大多数儿童 AI 工具直接把用户输入发给 AI。ChildCode 将*结构*（JSON）和*执行*（提示词）分离，让孩子理解 AI 的输出是**确定性的、可控的**，而不是魔法。

**技术栈：** React 19 · Vite 8 · Blockly 12 · Tailwind CSS · 纯前端（无后端）

## 参与贡献

欢迎贡献！步骤：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feat/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送分支 (`git push origin feat/amazing-feature`)
5. 发起 Pull Request

## 许可证

MIT

---

<p align="center">
  <a href="./README.md">English</a>
</p>
