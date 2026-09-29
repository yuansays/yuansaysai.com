import { ParticleField } from "./ParticleField";
import { importedNotes } from "./notes/generated";
import vibeStyles from "./vibe-hub/VibeHub.module.css";

const notes = [
  {
    index: "01",
    column: "ai-basics",
    title: "不会写提示词？先别背公式",
    description:
      "先说清楚你要什么、给谁用、什么算做好。三个问题，比套万能模板更有用。",
    meta: "教程 / 5 min",
    href: "/notes/prompt-basics",
  },
  {
    index: "02",
    column: "ai-basics",
    title: "AI 总是答非所问，怎么治",
    description:
      "从补上下文、拆小任务到要求自检，逐步找到模型跑偏的原因。",
    meta: "急诊 / 6 min",
    href: "/notes/ai-off-topic",
  },
  {
    index: "03",
    column: "ai-basics",
    title: "普通人最值得先学的 5 个 AI 功能",
    description:
      "总结资料、整理思路、改写表达、分析表格、生成初稿，从每天都用得上的地方开始。",
    meta: "清单 / 7 min",
    href: "/notes/five-ai-functions",
  },
  {
    index: "16",
    column: "knowledge-workflows",
    title: "Obsidian + AI：把本地笔记库变成可调用的知识库",
    description:
      "从本地 Markdown 笔记、基础插件到 AI 接入和跨设备同步，搭一套可持续维护的知识库。",
    meta: "工作流 / 10 min",
    href: "/notes/obsidian-ai-workflow",
  },
  {
    index: "34",
    column: "ai-creation",
    title: "个人 IP 插图工作流：先固定人物，再建立画风",
    description:
      "用两层参考资料让 AI 保持人物一致，并让配图真正服务于文章观点。",
    meta: "视觉工作流 / 8 min",
    href: "/notes/ip-illustration-skills",
  },
  {
    index: "35",
    column: "ai-creation",
    title: "视频制作 Skills 资源清单：先确认仓库、许可和可运行性",
    description:
      "整理一批视频制作相关的开源 Skill 入口，使用前先检查 README、许可证、依赖和输出质量。",
    meta: "资源 / 5 min",
    href: "/notes/video-workflow-skills",
  },
  {
    index: "104",
    column: "product-development",
    title: "Vibe Coding 视觉词典：滚动、反馈、风格与高级效果",
    description:
      "把模糊的“高级感”拆成可描述的网页行为、视觉语言和可复制提示词。",
    meta: "网页设计 / 12 min",
    href: "/notes/vibe-coding-visual-dictionary",
  },
  {
    index: "105",
    column: "product-development",
    title: "FDE 是什么：把 AI 工具接到真实业务流程",
    description:
      "从业务观察、最小 Demo 到上线交付，理解前置部署工程师如何解决企业 AI 落地问题。",
    meta: "AI 落地 / 9 min",
    href: "/notes/fde-ai-implementation",
  },
  {
    index: "106",
    column: "product-development",
    title: "GitHub 从零入门：把代码保存、同步和协作起来",
    description:
      "理解 Git 与 GitHub 的区别，完成仓库、分支、提交、推送和 Pull Request 的基本操作。",
    meta: "开发入门 / 10 min",
    href: "/notes/github-zero-to-one",
  },
  {
    index: "117",
    column: "content-operations",
    title: "把小红书和抖音选题监控做成可复盘的工作流",
    description:
      "从关键词、对标账号到去重、评分和人工反馈，把重复刷平台变成可运行的内容监控系统。",
    meta: "内容系统 / 12 min",
    href: "/notes/content-boom-monitor",
  },
];

const allNotes = [
  ...notes,
  ...importedNotes.map((note) => ({
    index: note.index,
    column: note.column,
    title: note.title,
    description: note.description,
    meta: `${note.category} / ${note.readTime}`,
    href: `/notes/${note.slug}`,
  })),
];

const columns = [
  {
    id: "ai-basics",
    number: "01",
    english: "FOUNDATIONS",
    title: "AI 基础",
    description: "先把 AI 用顺：提示词、沟通方式和每天都能用上的基础功能。",
  },
  {
    id: "knowledge-workflows",
    number: "02",
    english: "KNOWLEDGE",
    title: "知识与工作流",
    description: "把零散信息沉淀成自己的知识库，再接入可以调用它的 AI 工作流。",
  },
  {
    id: "ai-creation",
    number: "03",
    english: "CREATION",
    title: "AI 创作",
    description: "从视觉、视频到表达，把创意拆成可复用、可检查的制作步骤。",
  },
  {
    id: "product-development",
    number: "04",
    english: "BUILD",
    title: "产品与开发",
    description: "理解网页、代码和 AI 落地，做出能运行、能协作、能交付的东西。",
  },
  {
    id: "content-operations",
    number: "05",
    english: "OPERATIONS",
    title: "内容运营",
    description: "把选题发现、平台观察和复盘反馈变成一套可持续的内容系统。",
  },
].map((column) => ({
  ...column,
  notes: allNotes.filter((note) => note.column === column.id),
}));

const experiments = [
  [
    "01",
    "读懂复杂内容",
    "上传一篇长文或一份报告，让 AI 先讲重点，再解释你没看懂的部分。",
  ],
  [
    "02",
    "把想法变清楚",
    "把零散念头交给 AI 整理成大纲、计划或一段能直接使用的表达。",
  ],
  [
    "03",
    "解决具体问题",
    "遇到报错、不会设置或工具选不对时，用排查步骤一步步找到原因。",
  ],
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="予安的 AI 偏方首页">
          <span className="brand-mark">Y</span>
          <span>予安的 AI 偏方</span>
        </a>
        <nav aria-label="主导航">
          <a href="#notes">专栏</a>
          <a href="/vibe-hub">术语图鉴</a>
          <a href="/words/" aria-label="yuansays words 背单词">背单词</a>
          <a href="#experiments">功能</a>
          <a href="#about">关于</a>
        </nav>
        <a className="header-cta" href="mailto:hi@yuansaysai.com">
          有问题？ <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section className="hero" id="top">
        <ParticleField />
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="status-dot" />
            AI remedies for everyday people
          </p>
          <h1>
            让 AI，
            <br />
            <span>成为每个人的能力。</span>
          </h1>
          <p className="hero-intro">
            这里是予安的 AI 偏方：分享真正好用的 AI 功能、看得懂的使用教程，
            <br className="desktop-break" />
            也专治提示词失灵、工具不会选、结果不靠谱等疑难杂症。
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#notes">
              从教程开始 <span aria-hidden="true">↓</span>
            </a>
            <a className="button button-quiet" href="#experiments">
              查看 AI 工具箱
            </a>
          </div>
        </div>

        <div className="interaction-hint" aria-hidden="true">
          <span className="mouse-icon" />
          移动光标，吸附灵感；点击，打散重来
        </div>
        <div className="hero-number" aria-hidden="true">
          AI / 01
        </div>
      </section>

      <section className="manifesto" aria-label="宣言">
        <p>
          AI should feel useful.
          <br />
          <em>Not intimidating.</em>
        </p>
        <span>AI 不该让人焦虑，它应该帮普通人解决问题。</span>
      </section>

      <section className={`${vibeStyles.homeSpotlight} section-shell`} id="vibe-hub">
        <p className="section-kicker">NEW SECTION / VIBE CODING</p>
        <div className={vibeStyles.homeSpotlightInner}>
          <h2>
            Vibe Coding
            <br />
            <em>术语图鉴</em>
          </h2>
          <div className={vibeStyles.homeSpotlightCopy}>
            <p>
              不知道“那个弹出来的小框”叫什么？把口语描述变成准确术语，
              先亲手操作按钮、输入框和弹窗，再把需求直接交给 Agent。
            </p>
            <div aria-label="板块规模">
              <span>250 个术语</span>
              <span>7 大分类</span>
              <span>50 个可操作示例</span>
            </div>
            <a className="button" href="/vibe-hub">
              打开术语图鉴 <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>

      <section className="notes section-shell" id="notes">
        <div className="section-heading">
          <p className="section-kicker">COLUMNS / 按主题阅读</p>
          <h2>从问题出发</h2>
          <p>把文章分成五个专栏，按你现在要解决的问题开始阅读。</p>
        </div>
        <nav className="column-nav" aria-label="文章专栏">
          {columns.map((column) => (
            <a className="column-chip" href={`#column-${column.id}`} key={column.id}>
              <span className="column-chip-index">{column.number}</span>
              <strong>{column.title}</strong>
              <span className="column-chip-count">{column.notes.length} 篇</span>
            </a>
          ))}
        </nav>
        <div className="column-stack">
          {columns.map((column) => (
            <section
              className="column-section"
              id={`column-${column.id}`}
              key={column.id}
              aria-labelledby={`column-title-${column.id}`}
            >
              <div className="column-section-heading">
                <div>
                  <p className="column-section-kicker">
                    {column.number} / {column.english}
                  </p>
                  <h3 id={`column-title-${column.id}`}>{column.title}</h3>
                </div>
                <p>{column.description}</p>
              </div>
              <div className="notes-list">
                {column.notes.map((note) => (
                  <a className="note-card" href={note.href} key={note.index}>
                    <span className="note-index">{note.index}</span>
                    <div>
                      <h4>{note.title}</h4>
                      <p>{note.description}</p>
                    </div>
                    <div className="note-meta">
                      <span>{note.meta}</span>
                      <span className="round-arrow" aria-hidden="true">
                        ↗
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="experiments section-shell" id="experiments">
        <div className="section-heading experiment-heading">
          <p className="section-kicker">TOOLBOX / 好用功能</p>
          <h2>
            不追热点，
            <br />
            只分享真正有用的 AI。
          </h2>
          <a className="button button-quiet" href="/words/">
            yuansays words · 背单词 <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="experiment-grid">
          {experiments.map(([index, title, copy]) => (
            <article className="experiment-card" key={index}>
              <span>{index}</span>
              <div className="experiment-orbit" aria-hidden="true">
                <i />
              </div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about section-shell" id="about">
        <p className="section-kicker">ABOUT / 关于</p>
        <div className="about-grid">
          <h2>
            不卖焦虑，
            <br />
            <span>只讲人话。</span>
          </h2>
          <div className="about-copy">
            <p>
              我是予安。我会把自己真正用过、验证过的 AI
              方法，拆成普通人看得懂、跟着能做的步骤。
            </p>
            <p>
              这里不堆术语，也不追每一个新模型。只分享好用功能、AI
              使用教程，以及使用过程中那些常见却没人讲清楚的疑难杂症。
            </p>
            <a href="mailto:hi@yuansaysai.com">
              hi@yuansaysai.com <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top">
          <span className="brand-mark">Y</span>
          <span>予安的 AI 偏方</span>
        </a>
        <p>Useful AI, explained simply.</p>
        <div>
          <span>© {new Date().getFullYear()} 予安</span>
          <a href="#top">回到顶部 ↑</a>
        </div>
      </footer>
    </main>
  );
}
