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

静态产物输出到 `out/`。`yuansaysai.com` 由现有 GitHub → Cloudflare Pages 自动部署；主分支构建命令是 `npm run build`。仓库同时保留 `.openai/hosting.json` 中的 Sites/Vinext 项目，运行 `npm run build:sites` 可生成其独立发布包到 `dist/`。

## yuansays words

`/words/` 是基于 TypeWords 的独立 Nuxt/Vue 背词应用，源码在 `apps/yuansays-words/`。保留原版视觉、FSRS 学习流程、词库管理和备份功能，首版使用上游公开的 CET-4 词库。学习记录仅保存在当前浏览器，换设备或清理浏览器前请导出备份。

首次构建建议 Node.js 24。本地可预先安装子应用依赖；`npm run build` 在缺少依赖时也会通过 npm 安装锁定的 pnpm 10.33 和子应用依赖：

```bash
pnpm --dir apps/yuansays-words install --frozen-lockfile
npm run build
npm run build:sites
```

两个父站构建命令都会先构建背词应用，再暂存其静态文件到被 Git 忽略的 `public/words/`。日常开发可分别运行主站 `npm run dev` 和子应用 `pnpm --dir apps/yuansays-words dev`，后者地址为 `http://localhost:5567/words/`。

主站生产发布须推送构建对应的源码提交，并确认 GitHub 的 Cloudflare Pages 检查通过。Sites 项目另需打包 `dist/` 后部署并验证状态；所有静态路径和离线缓存均限制在 `/words/`。Sites Worker 为背词深层页面提供文档回退；Cloudflare Pages 使用静态文件和页面规则。

TypeWords 衍生应用遵循 GNU GPL v3，见其 `LICENSE` 与 `MODIFICATIONS.md`。发布版关于页提供对应提交的源代码链接。本仓库中 `scripts/build-words.mjs` 和 `/words/` Worker 集成的修改也按 GPL v3 提供，以便重现部署构建。
