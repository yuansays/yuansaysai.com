# Yuan Says AI

Yuan 的个人网站，记录 AI、产品与独立创造。

首页使用 Canvas 实现可交互粒子场：鼠标靠近会吸引粒子，按下会产生排斥效果，并兼顾触控设备与减少动态效果偏好。

## 本地开发

```bash
npm install
npm run dev
```

访问 `http://localhost:3000`。

## 构建

```bash
npm run build
```

静态产物输出到 `out/`。生产站当前使用 `.openai/hosting.json` 中已绑定的 Sites/Vinext 项目；发布包通过 `npm run build:sites` 生成到 `dist/`，不要另建站点或覆盖 DNS。

## yuansays words

`/words/` 是基于 TypeWords 的独立 Nuxt/Vue 背词应用，源码在 `apps/yuansays-words/`。保留原版视觉、FSRS 学习流程、词库管理和备份功能，首版使用上游公开的 CET-4 词库。学习记录仅保存在当前浏览器，换设备或清理浏览器前请导出备份。

首次构建需要 Node.js 24 和 pnpm 10.33：

```bash
pnpm --dir apps/yuansays-words install --frozen-lockfile
npm run build
npm run build:sites
```

两个父站构建命令都会先构建背词应用，再暂存其静态文件到被 Git 忽略的 `public/words/`。日常开发可分别运行主站 `npm run dev` 和子应用 `pnpm --dir apps/yuansays-words dev`，后者地址为 `http://localhost:5567/words/`。

生产发布须推送构建对应的源码提交，打包 `dist/` 后发布到现有 Sites 项目并验证部署状态；所有静态路径和离线缓存均限制在 `/words/`。Worker 为背词深层页面提供独立文档回退，不接管个人站页面。

TypeWords 衍生应用遵循 GNU GPL v3，见其 `LICENSE` 与 `MODIFICATIONS.md`。发布版关于页提供对应提交的源代码链接。本仓库中 `scripts/build-words.mjs` 和 `/words/` Worker 集成的修改也按 GPL v3 提供，以便重现部署构建。
