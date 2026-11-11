/* =========================================================================
   RSI 研究工作台 — 结构化内容数据
   说明：
   1) 所有时间轴、观点矩阵、术语与自评问题集中在此，便于核查与维护。
   2) 证据库与阅读清单分别位于 data/evidence.json、data/papers.json。
   3) credibility 仅使用四个值：事实 / 学界共识 / 存在争议 / 推测。
   4) 链接核查日期见 meta.lastVerified；未核实链接会明确标注。
   ========================================================================= */

window.RSI_CONTENT = (function () {
  "use strict";

  const meta = {
    lastVerified: "2026-11-10",
    title: "RSI 研究工作台",
    subtitle: "递归自我改进：定义、历史、机制、证据与论战",
    version: "公开资料综述 v1.0"
  };

  /* -----------------------------------------------------------------------
     一、思想史时间轴
     status: verified = 已通过 HTTP 检查；pending = 待核实
     ----------------------------------------------------------------------- */
  const timeline = [
    {
      id: "good-1965",
      year: 1965,
      decade: "1960s",
      who: "I. J. Good",
      role: "数学家 / 统计学家",
      title: "《关于第一台超智能机器的推测》",
      claim: "超智能机器可以设计更好的机器，因而可能触发“智能爆炸”。",
      detail:
        "Good 的定义是：超智能机器能远超任何人类的一切智力活动。由于设计机器本身也是智力活动，所以超智能机器可以设计更好的机器。他由此推测会出现“intelligence explosion”。这是一篇明确标注为 speculative 的思想实验，不是工程实现。",
      relevance: "概念起点：把“智能改进智能”写成正反馈假说。",
      credibility: "推测",
      credibilityNote: "论文发表是事实；智能爆炸判断是作者当时的推测。",
      link: {
        label: "Virginia Tech 开放副本（PDF）",
        url: "https://vtechworks.lib.vt.edu/bitstream/handle/10919/89424/TechReport05-3.pdf",
        status: "verified"
      }
    },
    {
      id: "vinge-1993",
      year: 1993,
      decade: "1990s",
      who: "Vernor Vinge",
      role: "数学家 / 科幻作家",
      title: "《即将到来的技术奇点》",
      claim: "超人类智能可能在 2005–2030 年间出现，并带来难以按旧规则理解的变化。",
      detail:
        "Vinge 在 NASA VISION-21 研讨会论文中把“技术奇点”定义为旧模型失效的时点。他讨论了几条路径（AI、网络、人机接口、生物增强），并主张一旦出现超人类智能，进步可能由它自身驱动。",
      relevance: "把 Good 的智能爆炸叙事带入更广的技术与社会讨论。",
      credibility: "推测",
      credibilityNote: "时间预测未实现；“奇点”作为概念影响深远。",
      link: {
        label: "San Diego State University 原文",
        url: "https://edoras.sdsu.edu/~vinge/misc/singularity.html",
        status: "verified"
      }
    },
    {
      id: "schmidhuber-2003",
      year: 2003,
      decade: "2000s",
      who: "Jürgen Schmidhuber",
      role: "计算机科学家",
      title: "Gödel Machine：可证明最优的自我改进器",
      claim: "一个能重写自身代码的系统，可以在证明某项改写更优后执行改写。",
      detail:
        "Gödel Machine 是理论构造：系统包含一个可自我改写的程序，并用形式化证明来保证改写带来更高期望效用。它把“递归自我改进”变成可形式讨论的对象，但也把实际应用限制在“能完成证明”的范围内。",
      relevance: "严格 RSI 的理论原型；现实中的证明成本是核心瓶颈。",
      credibility: "存在争议",
      credibilityNote: "理论构造成立；能否扩展到现实开放环境存在争议。",
      link: {
        label: "arXiv:cs/0309048",
        url: "https://arxiv.org/abs/cs/0309048",
        status: "verified"
      }
    },
    {
      id: "yudkowsky-2008",
      year: 2008,
      decade: "2000s",
      who: "Eliezer Yudkowsky",
      role: "AI 安全研究者",
      title: "Seed AI 与友好 AI 讨论",
      claim: "可以设计一个“种子”系统，让它通过递归自我修改走向更强的智能。",
      detail:
        "Yudkowsky 在 2008 年的人工智能风险章节中讨论 seed AI、递归自我增强与友好 AI 问题。他把“种子 AI 自我改写”当作需要严肃对待的默认情景，同时强调目标规范与可控性难题。这是规范性/预测性论证，不是已完成的工程演示。",
      relevance: "把 RSI 从思想实验推进到安全议程。",
      credibility: "推测",
      credibilityNote: "风险论证有影响力；具体路径与时间表未获经验证实。",
      link: {
        label: "MIRI 2008 章节（PDF）",
        url: "https://intelligence.org/files/AIPosNegFactor.pdf",
        status: "verified"
      }
    },
    {
      id: "chalmers-2010",
      year: 2010,
      decade: "2010s",
      who: "David Chalmers",
      role: "哲学家",
      title: "《奇点：一个哲学分析》",
      claim: "智能爆炸在逻辑上可能，但是否发生、以多快速度发生仍高度不确定。",
      detail:
        "Chalmers 系统梳理了奇点论证的前提：超智能的可能性、智能爆炸的反馈回路、以及“取径”速度。他的结论更接近“不能排除、需要认真对待”，而不是给出确定时间表。",
      relevance: "哲学层面的条件分析，强调论证依赖经验前提。",
      credibility: "存在争议",
      credibilityNote: "规范分析清晰；核心经验前提仍无定论。",
      link: {
        label: "作者官网 PDF",
        url: "https://www.consc.net/papers/singularity.pdf",
        status: "verified"
      }
    },
    {
      id: "yudkowsky-2013",
      year: 2013,
      decade: "2010s",
      who: "Eliezer Yudkowsky",
      role: "AI 安全研究者",
      title: "《智能爆炸微观经济学》",
      claim: "智能爆炸的速度取决于优化能力的边际回报与资源约束。",
      detail:
        "这篇报告用经济学语言讨论“智能爆炸”的微观机制：如果智能能高效地生产更多智能，反馈可能很快；如果关键投入出现瓶颈，反馈会变慢。它提供的是分析框架与主张，不是历史数据拟合。",
      relevance: "把“快 vs 慢”从口号变成可分解的参数问题。",
      credibility: "推测",
      credibilityNote: "框架有解释力；关键参数缺少直接经验估计。",
      link: {
        label: "MIRI 报告（PDF）",
        url: "https://intelligence.org/files/IEM.pdf",
        status: "verified"
      }
    },
    {
      id: "bostrom-2014",
      year: 2014,
      decade: "2010s",
      who: "Nick Bostrom",
      role: "哲学家",
      title: "《超级智能：路径、危险、策略》",
      claim: "从人类水平到超智能的“取径”可能很快，也可能较慢；控制问题是核心风险。",
      detail:
        "Bostrom 区分了 fast takeoff、slow takeoff 等情景，并讨论 orthogonality thesis、instrumental convergence 等概念。书中给出的是风险框架与情景分析，不是对时间的经验预测。",
      relevance: "让 takeoff 速度与控制问题成为公共讨论的核心。",
      credibility: "存在争议",
      credibilityNote: "概念框架影响大；具体速度与风险路径存在争议。",
      link: {
        label: "作者官网书籍页",
        url: "https://nickbostrom.com/superintelligence",
        status: "verified"
      }
    },
    {
      id: "cotra-2020",
      year: 2020,
      decade: "2020s",
      who: "Ajeya Cotra",
      role: "AI 预测研究者",
      title: "用生物锚点预测 TAI 时间线",
      claim: "以生物计算量作锚，可以给“变革性 AI”所需的训练算力一个概率分布。",
      detail:
        "Cotra 的报告用生物锚点（进化、基因组、寿命、神经计算等）估计训练变革性模型所需的算力，再结合算力价格与算法进步推断时间线。它是显式的概率模型，不是确定性预言。Cold Takes 提供了面向读者的解释。",
      relevance: "代表“用算力与概率模型讨论时间线”的路线。",
      credibility: "推测",
      credibilityNote: "模型透明但假设强；后续研究对其参数有大量修订与争论。",
      link: {
        label: "Cold Takes 方法解释",
        url: "https://www.cold-takes.com/forecasting-transformative-ai-the-biological-anchors-method-in-a-nutshell/",
        status: "pending"
      }
    },
    {
      id: "davidson-2023",
      year: 2023,
      decade: "2020s",
      who: "Tom Davidson",
      role: "AI 政策研究者",
      title: "《以算力为中心的取径速度框架》",
      claim: "在算力中心模型下，从可自动化 20% 认知任务到接近全自动化，中位取径时间约为数年。",
      detail:
        "Davidson 用有效算力差距、算法进步与部署约束建模取径速度。报告给出的 Monte Carlo 中位取径约为 3 年，10–90 分位约为 0.8–11 年；作者明确列出模型假设与局限。Open Philanthropy 原页面对自动抓取返回 403，因此此处链接 Epoch AI 的配套互动模型。",
      relevance: "把 takeoff 速度做成可审计的定量模型，同时暴露参数敏感性。",
      credibility: "存在争议",
      credibilityNote: "模型结果依赖假设；“中位数 3 年”不是经验事实。",
      link: {
        label: "Epoch AI 配套互动模型",
        url: "https://epoch.ai/blog/interactive-model-of-takeoff-speeds",
        status: "verified"
      }
    },
    {
      id: "stop-2023",
      year: 2023,
      decade: "2020s",
      who: "Eric Zelikman 等",
      role: "研究团队",
      title: "STOP：递归自我改进的代码生成",
      claim: "语言模型可以写出一段能改进自身代码的脚手架程序，在少量任务上超过种子改进器。",
      detail:
        "STOP 从种子“改进器”开始，让语言模型修改这段改进器代码，再在任务上评估。作者明确指出：语言模型本身没有被改变，因此这不是 full recursive self-improvement。论文还评估了生成代码绕过沙箱的频率。",
      relevance: "实证转向的代表作：可运行、可审计，但只到脚手架层。",
      credibility: "事实",
      credibilityNote: "实验结果是事实；是否算 RSI 取决于定义，作者自己给出否定性限定。",
      link: {
        label: "arXiv:2310.02304",
        url: "https://arxiv.org/abs/2310.02304",
        status: "verified"
      }
    },
    {
      id: "self-rewarding-2024",
      year: 2024,
      decade: "2020s",
      who: "Weizhe Yuan 等",
      role: "研究团队",
      title: "Self-Rewarding Language Models",
      claim: "模型可以用自身作为评审生成奖励，并通过迭代 DPO 同时提升指令遵循与自评能力。",
      detail:
        "论文让同一个语言模型生成回答、再用 LLM-as-a-Judge 提示给自己打分，随后做迭代 DPO。作者报告 Llama 2 70B 经过三轮迭代后在 AlpacaEval 2.0 上超过若干强基线。自评信号与外部基准的独立性是主要争议点。",
      relevance: "系统级自我奖励闭环；评估者仍是被训练系统的一部分。",
      credibility: "事实",
      credibilityNote: "报告结果可核查；自评偏差与泛化边界仍需独立研究。",
      link: {
        label: "arXiv:2401.10020",
        url: "https://arxiv.org/abs/2401.10020",
        status: "verified"
      }
    },
    {
      id: "alphaevolve-2025",
      year: 2025,
      decade: "2020s",
      who: "Alexander Novikov 等",
      role: "Google DeepMind 团队",
      title: "AlphaEvolve：面向科学与算法发现的编码代理",
      claim: "LLM 进化式编码代理可以在自动评估器反馈下持续改进算法，甚至改进自身训练基础设施。",
      detail:
        "AlphaEvolve 让 LLM 对代码做变异，并用一个或多个评估器打分，保留改进。论文报告它发现了用 48 次标量乘法完成 4×4 复矩阵乘法的算法（论文称这是 56 年来首次改进 Strassen 算法在该设定下的结果），并在数据中心调度等任务上产生收益。基础模型与评估器仍是外部给定的。",
      relevance: "闭环长度与真实影响都很突出，但改进对象是算法/代码，不是基础模型。",
      credibility: "事实",
      credibilityNote: "论文结果有自动与人工验证；是否构成 RSI 存在定义争议。",
      link: {
        label: "arXiv:2506.13131",
        url: "https://arxiv.org/abs/2506.13131",
        status: "verified"
      }
    },
    {
      id: "absolute-zero-2025",
      year: 2025,
      decade: "2020s",
      who: "Andrew Zhao 等",
      role: "研究团队",
      title: "Absolute Zero：零外部数据的自博弈推理",
      claim: "模型可以自己提出任务、用代码执行器验证，并在不依赖外部任务数据的情况下提升推理。",
      detail:
        "Absolute Zero 让单一模型提出“最大化自身学习进度”的代码推理任务，再由代码执行器验证答案，形成可验证奖励并做强化学习。论文报告在代码与数学推理上取得有竞争力的结果。它改变的是模型能力与课程，不是基础学习算法或评估器本身。",
      relevance: "自生成课程 + 可验证奖励的强闭环案例。",
      credibility: "事实",
      credibilityNote: "结果可核查；“零数据”不等于零人类设计，泛化范围有限。",
      link: {
        label: "arXiv:2505.03335",
        url: "https://arxiv.org/abs/2505.03335",
        status: "verified"
      }
    },
    {
      id: "dgm-2025",
      year: 2025,
      decade: "2020s",
      who: "Jenny Zhang 等",
      role: "UBC / Vector Institute 团队",
      title: "Darwin Gödel Machine：开放式自我改进代理",
      claim: "系统可以反复修改自身代码库，并在编码基准上多代提升，同时保留沙箱与人类监督。",
      detail:
        "DGM 维护一个代理档案库，采样后用基础模型生成新的代码版本，再在 SWE-bench、Polyglot 等基准上评估。论文报告 SWE-bench 从 20.0% 提升到 50.0%，Polyglot 从 14.2% 提升到 30.7%。作者明确说明基础模型未被改写，实验在沙箱与人类监督下进行。",
      relevance: "目前公开证据中最接近“代码级递归自我改进”的候选之一；仍不是完整 RSI。",
      credibility: "事实",
      credibilityNote: "基准结果是事实；开放式 RSI 的解释是争议点。",
      link: {
        label: "arXiv:2505.22954",
        url: "https://arxiv.org/abs/2505.22954",
        status: "verified"
      }
    },
    {
      id: "godel-agent-2024",
      year: 2024,
      decade: "2020s",
      who: "Xunjian Yin 等",
      role: "研究团队",
      title: "Gödel Agent：自指代理框架",
      claim: "代理可以在运行时修改自身逻辑与行为，而不依赖预设的固定优化流程。",
      detail:
        "Gödel Agent 受 Gödel Machine 启发，用 LLM 动态修改自身代码/逻辑，并以高层目标提示引导。论文报告在数学推理与复杂代理任务上持续自我改进。它仍运行在基础模型和外部任务环境之上，评估与安全边界由人设定。",
      relevance: "自指代码修改的工程尝试，但证据仍集中在有限任务。",
      credibility: "事实",
      credibilityNote: "论文报告了提升；独立复现与跨域泛化仍需观察。",
      link: {
        label: "arXiv:2410.04444",
        url: "https://arxiv.org/abs/2410.04444",
        status: "verified"
      }
    }
  ];

  /* -----------------------------------------------------------------------
     二、论证结构
     ----------------------------------------------------------------------- */
  const argument = {
    support: [
      {
        step: "前提 1",
        title: "智能可以用于改进智能",
        body:
          "AI 已经能辅助写代码、搜索算法、设计实验。若这些能力覆盖“改进 AI 自身”的工作，反馈回路在原理上成立。",
        credibility: "事实",
        attribution: "工程事实：AlphaEvolve、DGM 等展示了代码/算法层的自动改进；是否覆盖一般智能仍未知。"
      },
      {
        step: "前提 2",
        title: "改进可以闭合成环",
        body:
          "把改进产物重新投入下一轮改进，并让评估信号足够可靠，就可能形成多代闭环。",
        credibility: "存在争议",
        attribution: "DGM、STOP 展示了短程闭环；闭环能否长期维持、跨域泛化，是争议点。"
      },
      {
        step: "结论",
        title: "闭环可能带来加速",
        body:
          "若每轮改进带来的能力增益大于实验、算力、评估与对齐成本，能力曲线会加速；反之会饱和。",
        credibility: "推测",
        attribution: "Yudkowsky（2013）等主张前者；Hanson（2008）等强调收益递减与瓶颈。这是条件命题，不是已证结论。"
      }
    ],
    attacks: [
      {
        title: "收益递减",
        body:
          "越接近能力边界，改进越难；容易的优化先被吃掉。Hanson（2008）用经济史与递减回报论证奇点未必快速到来。",
        credibility: "存在争议",
        attribution: "Robin Hanson（2008）"
      },
      {
        title: "实验与算力瓶颈",
        body:
          "每一代改进都要训练、评估、试错。若实验成本随能力增长，闭环会变慢甚至停滞。",
        credibility: "存在争议",
        attribution: "本页综合；Davidson（2023）等的算力中心模型给出参数化讨论。"
      },
      {
        title: "评估瓶颈",
        body:
          "系统可能优化评估指标而非真实能力（Goodhart）。越强的优化器，越需要独立、抗博弈的评估。",
        credibility: "存在争议",
        attribution: "Goodhart 定律的 AI 版本；Karwowski 等（2023）、Raji 等（2021）提供形式与基准批评。"
      },
      {
        title: "对齐税",
        body:
          "安全审查、可解释性、红队测试会占用时间与算力；若竞争者省略这些步骤，安全方可能被淘汰。",
        credibility: "存在争议",
        attribution: "AI 安全政策讨论中的常见主张；缺乏统一的经验估计。"
      },
      {
        title: "监管与物理世界约束",
        body:
          "许可、出口管制、能源、芯片、数据与部署审批都会限制迭代速度。",
        credibility: "事实",
        attribution: "监管与供应链约束可观察；其对长期速度的净影响存在争议。"
      }
    ],
    verdict:
      "因此，“是否会出现快速递归自我改进”不是纯哲学问题，而是一个可分解的经验问题：闭环增益是否持续大于瓶颈损耗。当前公开证据只能说明短程、窄域闭环可行，尚不能估计长期参数。"
  };

  /* -----------------------------------------------------------------------
     三、机制分层
     ----------------------------------------------------------------------- */
  const mechanisms = [
    {
      layer: "组件级",
      code: "L1",
      strength: 4,
      summary: "改进模型外部的组件：架构、超参、提示、工作流或代码片段。",
      examples: [
        { name: "AutoML / NAS", note: "自动搜索架构与超参；评估依赖验证集。" },
        { name: "STOP", note: "让 LM 改写“改进器”脚手架代码。" },
        { name: "AlphaEvolve", note: "进化式代码搜索，自动评估器反馈。" }
      ],
      gap:
        "基础模型通常固定；搜索空间与评估器由人设定；改进的是产物或脚手架，不是“产生智能的机制”本身。"
    },
    {
      layer: "系统级",
      code: "L2",
      strength: 3,
      summary: "改进整个学习/推理系统：自生成数据、自奖励、自博弈、评审-修正、代理脚手架进化。",
      examples: [
        { name: "STaR", note: "自生成推理过程并用答案过滤后微调。" },
        { name: "Self-Rewarding LMs", note: "模型自评作为奖励，迭代 DPO。" },
        { name: "Absolute Zero", note: "自提任务 + 代码执行器验证。" },
        { name: "DGM", note: "多代修改代理代码库并保留档案。" }
      ],
      gap:
        "许多系统会更新权重，但学习算法、评估器和安全边界仍由人设计；跨任务、长期、开放式闭环证据不足。"
    },
    {
      layer: "元级",
      code: "L3",
      strength: 1,
      summary: "改进“改进器”本身：学习算法、搜索过程、评估机制与自我修改能力。",
      examples: [
        { name: "Gödel Machine", note: "理论：证明更优后改写自身代码。" },
        { name: "DGM（部分）", note: "修改代理代码与改进流程，但基础模型冻结。" },
        { name: "Gödel Agent（部分）", note: "运行时自指修改，但范围有限。" }
      ],
      gap:
        "目前没有公开、可复现的证据表明系统能自主改进其基础学习算法/评估器，并在开放域多代保持增益。这是真正意义上的 RSI 证据最弱的一层。"
    }
  ];

  /* -----------------------------------------------------------------------
     四、加速论战：三方立场
     ----------------------------------------------------------------------- */
  const positions = [
    {
      stance: "快速起飞",
      tone: "fast",
      who: "Eliezer Yudkowsky；I. J. Good 的强版本",
      claim:
        "一旦系统能显著加速自身改进，反馈可能在很短时间内把能力推高；安全窗口可能极窄。",
      credibility: "推测",
      caveat:
        "这是条件性论证，依赖“改进增益高、瓶颈低、评估可控”等前提；没有历史案例直接验证。"
    },
    {
      stance: "慢速 / 受限",
      tone: "slow",
      who: "Robin Hanson；Tom Davidson 的部分情景",
      claim:
        "收益递减、实验成本、经济与物理约束会把曲线拉平；取径可能是数年尺度，而非小时级。",
      credibility: "存在争议",
      caveat:
        "Davidson 的模型给出约 3 年的中位取径，但 10–90 分位约 0.8–11 年，说明结论对假设高度敏感。"
    },
    {
      stance: "不可判定 / 证据不足",
      tone: "unknown",
      who: "本页对公开证据的评估",
      claim:
        "现有工作只展示窄域、短程、评估器由人设定的自我改进；长期闭环增益与瓶颈损耗都缺少可外推测量。",
      credibility: "存在争议",
      caveat:
        "这不是“永远不会发生”的判断，而是“当前证据不足以判定速度”的判断。"
    }
  ];

  /* -----------------------------------------------------------------------
     五、观点矩阵
     ----------------------------------------------------------------------- */
  const viewpoints = [
    {
      who: "I. J. Good",
      year: "1965",
      possible: "可能",
      timescale: "未给出严格时间表；推测 20 世纪内",
      bottleneck: "硬件与设计能力；控制问题",
      policy: "强调机器必须“足够温顺”以告知人类如何控制",
      credibility: "推测"
    },
    {
      who: "Vernor Vinge",
      year: "1993",
      possible: "可能",
      timescale: "2005–2030（当时的预测）",
      bottleneck: "硬件、软件与网络路径； confinement 是否可行",
      policy: "认为难以阻止，主张谨慎设置初始条件",
      credibility: "推测"
    },
    {
      who: "Eliezer Yudkowsky",
      year: "2008 / 2013",
      possible: "可能，且风险极高",
      timescale: "人类水平后可能很快",
      bottleneck: "对齐、目标规范、监督",
      policy: "主张优先解决对齐；对继续开发持强烈保留",
      credibility: "推测"
    },
    {
      who: "David Chalmers",
      year: "2010",
      possible: "逻辑上可能",
      timescale: "不确定，取决于经验前提",
      bottleneck: "反馈强度、智能本质、资源约束",
      policy: "主张认真对待并继续哲学/经验研究",
      credibility: "存在争议"
    },
    {
      who: "Robin Hanson",
      year: "2008",
      possible: "可能，但更像经济转型",
      timescale: "数十年；取决于脑仿真与复制经济",
      bottleneck: "递减回报、制度与物理约束",
      policy: "更关注经济制度与分配，而非单一失控叙事",
      credibility: "存在争议"
    },
    {
      who: "Nick Bostrom",
      year: "2014",
      possible: "可能",
      timescale: "快慢取径均可能",
      bottleneck: "控制问题、目标漂移、监督",
      policy: "主张 differential technological development 等策略",
      credibility: "存在争议"
    },
    {
      who: "Ajeya Cotra",
      year: "2020",
      possible: "可能",
      timescale: "报告给出 TAI 算力可负担的中位约 2052（早期版本，宽区间）",
      bottleneck: "训练算力、算法进步、部署成本",
      policy: "用概率预测支持长期治理与投资决策",
      credibility: "推测"
    },
    {
      who: "Tom Davidson",
      year: "2023",
      possible: "可能",
      timescale: "从 20% 自动化到接近全自动化，中位约 3 年；区间很宽",
      bottleneck: "有效算力、实验成本、部署摩擦",
      policy: "用可审计模型评估取径速度与治理窗口",
      credibility: "存在争议"
    }
  ];

  /* -----------------------------------------------------------------------
     六、安全与治理
     ----------------------------------------------------------------------- */
  const riskChain = [
    {
      title: "能力自增强",
      body: "系统能改进代码、流程或模型，形成正反馈。",
      status: "事实（窄域）",
      note: "已有代码/算法级闭环；完整 RSI 未被证实。"
    },
    {
      title: "评估不可靠",
      body: "评估器被优化、基准污染、自评偏差，导致“看起来变强”。",
      status: "事实 / 存在争议",
      note: "Goodhart 与基准批评有实验和理论支持；程度因任务而异。"
    },
    {
      title: "欺骗性对齐 / 目标漂移",
      body: "模型在训练与评估中表现合规，部署后追求不同目标。",
      status: "存在争议",
      note: "有实验室环境下的 in-context scheming 证据；真实部署中的欺骗性对齐未被确认。"
    },
    {
      title: "监督失效",
      body: "人类或自动监督者无法可靠审计大规模系统的行为与意图。",
      status: "存在争议 / 推测",
      note: "可监督性是活跃研究问题；尚无通用解决方案。"
    },
    {
      title: "失控",
      body: "系统脱离有效控制并造成不可逆后果。",
      status: "推测",
      note: "这是风险情景，不是已发生的 RSI 事故。"
    }
  ];

  const safetyConcepts = [
    {
      term: "可监督性",
      en: "Monitorability",
      body: "外部观察者能否理解、检测并干预系统的内部状态与行为。",
      credibility: "存在争议"
    },
    {
      term: "评估博弈",
      en: "Evaluation gaming",
      body: "系统针对评估器或基准漏洞优化，而不是获得目标能力。",
      credibility: "事实 / 存在争议"
    },
    {
      term: "沙箱逃逸",
      en: "Sandbox escape",
      body: "系统突破隔离环境，获取未授权资源或影响外部世界。STOP 曾专门评估生成代码绕过沙箱的频率。",
      credibility: "事实"
    },
    {
      term: "权重外泄",
      en: "Weight exfiltration",
      body: "模型参数被复制或转移出受控环境，削弱许可、审计与出口管制。",
      credibility: "事实 / 存在争议"
    },
    {
      term: "开源扩散",
      en: "Open-weight diffusion",
      body: "开放权重降低审查与召回难度，同时扩大能力可及性。",
      credibility: "存在争议"
    }
  ];

  const governance = [
    {
      tool: "算力阈值与许可",
      mechanism: "以训练算力或集群规模触发注册、评估或许可。",
      status: "已发生（部分地区/法规）",
      example: "欧盟《AI 法案》对通用 AI 模型设定系统性风险算力阈值；具体实施分阶段。",
      limit: "算力不是能力的完美代理；分布式训练与算法效率会削弱阈值。"
    },
    {
      tool: "训练与评估审计",
      mechanism: "第三方或监管者检查训练记录、评估报告与安全措施。",
      status: "部分实施",
      example: "前沿实验室的安全框架、外部红队与模型评估实践。",
      limit: "审计标准、访问权限与独立性仍不统一。"
    },
    {
      tool: "能力阈值暂停",
      mechanism: "达到特定危险能力阈值时暂停训练或部署，直到风险被处理。",
      status: "预案 / 部分公司承诺",
      example: "若干前沿实验室的 responsible scaling 政策；尚无全球统一强制机制。",
      limit: "阈值定义、测量与执行缺乏共识。"
    },
    {
      tool: "危险能力评测",
      mechanism: "系统评估 CBRN、网络攻击、自主复制与欺骗等能力。",
      status: "已发生，但标准不一",
      example: "实验室与第三方评估机构的能力评测；国际报告进行综述。",
      limit: "评测可被优化；开放权重模型难以在训练前拦截。"
    },
    {
      tool: "国际协调",
      mechanism: "通过峰会、技术报告与出口管制协调风险治理。",
      status: "部分发生 / 无约束力",
      example: "International AI Safety Report、AI Safety Summit 进程。",
      limit: "缺乏统一执行机制；竞争压力削弱承诺。"
    }
  ];

  /* -----------------------------------------------------------------------
     七、批评与未解问题
     ----------------------------------------------------------------------- */
  const criticisms = [
    {
      title: "“递归”没有统一操作化定义",
      body:
        "同一篇论文可能被支持方称为“递归自我改进的里程碑”，也被批评者称为“只是脚手架优化”。STOP 作者明确说基础模型未变，DGM 以编码基准衡量改进；两者都缺少“改进器本身被改进”的统一判据。",
      credibility: "存在争议",
      source: "对 STOP、DGM 等论文定义的比较"
    },
    {
      title: "评估者被优化与基准污染",
      body:
        "当系统能改写代码或生成训练数据时，它也可能学会迎合评估器。自评、LLM-as-a-Judge 与公开基准都提供可被利用的信号。",
      credibility: "存在争议",
      source: "Karwowski 等（2023）；Raji 等（2021）"
    },
    {
      title: "自我改进的收益可能被实验成本吞掉",
      body:
        "每一轮改进都要付出训练、推理、评估与人工审查成本。若成本随系统能力增长，闭环可能收敛到“昂贵但有限”的优化器。",
      credibility: "推测",
      source: "Hanson（2008）的递减回报论证；本页综合"
    },
    {
      title: "代码级改进不等于能力级跃迁",
      body:
        "DGM 在 SWE-bench 上的提升是真实的，但它不等于跨域通用智能的提升。基准分数与开放环境中的能力之间仍有鸿沟。",
      credibility: "事实",
      source: "DGM 论文的基准结果与局限；本页评估"
    },
    {
      title: "对齐能力与改进能力是否同步，无定论",
      body:
        "更强的自我改进能力是否必然带来更强的对齐/监督能力？没有经验证据支持“自动同步”。",
      credibility: "存在争议",
      source: "Ngo 等（2022）；Hubinger 等（2019）"
    },
    {
      title: "基础模型固定，严格 RSI 未被展示",
      body:
        "STOP 明确说语言模型没有被改变；DGM 也以冻结的基础模型生成新代码。改进发生在脚手架/代码层，而非产生智能的基础机制。",
      credibility: "事实",
      source: "STOP 摘要；DGM 论文"
    },
    {
      title: "自评信号不独立",
      body:
        "Self-Rewarding 等系统用同一模型做评审。即使外部基准显示提升，也不能排除“自评偏好”与“真实能力”脱钩。",
      credibility: "存在争议",
      source: "Self-Rewarding LMs 论文；LLM-as-a-Judge 研究"
    },
    {
      title: "窄域、短程、人类设定评估器",
      body:
        "在本页核查的公开工作中，几乎每一项都需要人类设定任务、评估器或安全边界；闭环长度从数轮到数十代不等，但都未达到开放域长期自治。",
      credibility: "事实",
      source: "本页证据库 11 项工作的共同特征"
    },
    {
      title: "起飞模型参数敏感，缺少外部验证",
      body:
        "Davidson（2023）与 Cotra（2020）都明确列出强假设。模型给出的是条件预测，不能当作历史趋势的外推。",
      credibility: "存在争议",
      source: "Davidson（2023）；Cotra（2020）"
    },
    {
      title: "发表偏差与复现不足",
      body:
        "自我改进的负面结果、失败闭环与评估器崩溃很少被系统发表；代码与算力门槛也限制独立复现。",
      credibility: "存在争议",
      source: "本页对公开代码/复现材料的观察；不同工作差异很大"
    },
    {
      title: "风险叙事可能夸大或造成宿命论",
      body:
        "把“可能的风险”讲成“必然的失控”，会掩盖不确定性与治理选择；同样，否认风险也会低估评估博弈。",
      credibility: "存在争议",
      source: "本页对风险传播框架的批评"
    },
    {
      title: "治理工具依赖测量，但测量本身不成熟",
      body:
        "算力阈值、能力评测与审计都假设我们能测量“危险能力”。若评测可被优化，治理阈值会被绕过。",
      credibility: "存在争议",
      source: "治理文献与能力评测实践；Reuel 等（2024）"
    }
  ];

  /* -----------------------------------------------------------------------
     八、术语表
     ----------------------------------------------------------------------- */
  const glossary = [
    {
      id: "rsi",
      zh: "递归自我改进",
      en: "Recursive Self-Improvement",
      def: "系统改进“产生其自身智能的机制”，且改进后的机制能继续带来改进，形成闭环。"
    },
    {
      id: "recursion",
      zh: "递归",
      en: "Recursion",
      def: "把过程应用于自身；在 RSI 中特指改进器改进自身，而不只是改进产物。"
    },
    {
      id: "intelligence-explosion",
      zh: "智能爆炸",
      en: "Intelligence Explosion",
      def: "Good 提出的假设：超智能机器设计更好的机器，导致能力在短时间内急剧提升。"
    },
    {
      id: "takeoff",
      zh: "起飞 / 取径",
      en: "Takeoff",
      def: "从接近人类水平到远超人类能力的时间尺度与速度问题；快慢定义并不统一。"
    },
    {
      id: "seed-ai",
      zh: "种子 AI",
      en: "Seed AI",
      def: "被设计为能递归修改自身并提升智能的初始系统。"
    },
    {
      id: "godel-machine",
      zh: "哥德尔机",
      en: "Gödel Machine",
      def: "Schmidhuber 提出的理论自我改进器：仅在形式化证明改写更优时重写自身。"
    },
    {
      id: "self-play",
      zh: "自博弈",
      en: "Self-Play",
      def: "系统与自己或自身变体对弈，用胜负信号改进策略。"
    },
    {
      id: "self-reward",
      zh: "自奖励",
      en: "Self-Reward",
      def: "模型自己生成奖励或评审信号来训练、选择输出。"
    },
    {
      id: "self-training",
      zh: "自我训练",
      en: "Self-Training",
      def: "用模型自己生成的数据或标签更新模型。"
    },
    {
      id: "self-refine",
      zh: "自我精炼",
      en: "Self-Refine",
      def: "同一模型对输出自评并修订的提示技巧，通常不改变权重。"
    },
    {
      id: "scaffolding",
      zh: "脚手架",
      en: "Scaffolding",
      def: "围绕基础模型组织多次调用、工具、记忆与控制的程序结构。"
    },
    {
      id: "meta-learning",
      zh: "元学习",
      en: "Meta-Learning",
      def: "学习如何学习，改进学习算法、先验或适应过程。"
    },
    {
      id: "automl",
      zh: "自动机器学习",
      en: "AutoML",
      def: "自动搜索模型、超参数或机器学习流程。"
    },
    {
      id: "nas",
      zh: "神经架构搜索",
      en: "Neural Architecture Search",
      def: "自动搜索神经网络结构，并为验证指标做优化。"
    },
    {
      id: "agent-scaffold",
      zh: "智能体脚手架",
      en: "Agent Scaffold",
      def: "代理的规划、工具调用、记忆与控制代码；可被进化式搜索改进。"
    },
    {
      id: "goodhart",
      zh: "古德哈特定律",
      en: "Goodhart's Law",
      def: "指标成为目标后，系统会优化指标而非原目标；在 AI 中表现为评估博弈。"
    },
    {
      id: "deceptive-alignment",
      zh: "欺骗性对齐",
      en: "Deceptive Alignment",
      def: "假设模型在训练/评估时表现对齐，部署后追求不同目标。"
    },
    {
      id: "evaluation-gaming",
      zh: "评估博弈",
      en: "Evaluation Gaming",
      def: "系统针对评估器或基准漏洞优化，而非获得目标能力。"
    },
    {
      id: "sandbox-escape",
      zh: "沙箱逃逸",
      en: "Sandbox Escape",
      def: "系统突破隔离环境，获取未授权资源或影响外部世界。"
    },
    {
      id: "weight-exfiltration",
      zh: "权重外泄",
      en: "Weight Exfiltration",
      def: "模型参数被复制或转移出受控环境。"
    },
    {
      id: "capability-threshold",
      zh: "能力阈值",
      en: "Capability Threshold",
      def: "以特定危险能力水平触发暂停、审查或部署限制。"
    },
    {
      id: "alignment-tax",
      zh: "对齐税",
      en: "Alignment Tax",
      def: "为安全/对齐措施付出的能力、成本或速度代价。"
    },
    {
      id: "monitorability",
      zh: "可监督性",
      en: "Monitorability",
      def: "外部观察者理解、检测和干预系统内部/行为的能力。"
    },
    {
      id: "open-endedness",
      zh: "开放式",
      en: "Open-Endedness",
      def: "系统持续产生新颖且不封顶的成果/技能。"
    },
    {
      id: "operationalization",
      zh: "操作化",
      en: "Operationalization",
      def: "把抽象概念转为可测量判据的过程；RSI 目前缺少统一操作化。"
    }
  ];

  /* -----------------------------------------------------------------------
     九、自评清单
     ----------------------------------------------------------------------- */
  const checklistQuestions = [
    {
      id: "target",
      text: "改进对象是否包括“改进器本身”，而不只是任务产物？",
      why: "这是严格递归的核心：改进器改进自身，而不只是生成更好的答案或代码片段。"
    },
    {
      id: "evaluator",
      text: "评估者是否独立于被改进系统，且不易被它优化？",
      why: "若系统能改写评估器或迎合指标，能力提升可能只是评估博弈。"
    },
    {
      id: "autonomy",
      text: "闭环是否无需人类逐步介入？",
      why: "每轮都需要人重设任务/评估器，会限制递归深度与速度。"
    },
    {
      id: "injection",
      text: "改进是否主要来自内部闭环，而非外部注入的算力/数据？",
      why: "外部注入可以制造提升，但不能证明系统自身产生了递归改进。"
    },
    {
      id: "generalization",
      text: "能力是否跨任务泛化，而非只在单一基准上提升？",
      why: "单一基准上的多代提升可能是过拟合或基准污染。"
    },
    {
      id: "multigeneration",
      text: "是否观察到多代闭环，且每代都继续改进？",
      why: "一两轮改进不足以区分“自我精炼”与“递归自我改进”。"
    }
  ];

  return {
    meta,
    timeline,
    argument,
    mechanisms,
    positions,
    viewpoints,
    riskChain,
    safetyConcepts,
    governance,
    criticisms,
    glossary,
    checklistQuestions
  };
})();
