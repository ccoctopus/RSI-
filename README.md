# RSI 研究工作台

一个关于**递归自我改进（Recursive Self-Improvement, RSI）**的中文静态研究站点。它把定义、思想史、机制、公开经验证据、加速论战、安全治理与批评拆成可分别核查的部分，并为每个观点标注可信度与主张者。

- 纯 HTML + CSS + 原生 JavaScript（ES6）
- 无框架、无 npm、无打包器、无后端
- 图表使用 Chart.js 4.4.7（jsDelivr CDN），带加载失败降级与重试
- 最后核查日期：`2026-11-10`

## 快速启动

在项目目录运行：

```powershell
cd D:\opencode
python -m http.server 8000
```

然后打开：

```text
http://localhost:8000/
```

> 必须通过本地 HTTP 服务访问。证据库与阅读清单由 `fetch` 读取 JSON；直接双击 `index.html`（`file://`）会因浏览器安全策略无法加载数据。

如果 8000 端口被占用，可换一个端口：

```powershell
python -m http.server 8080
```

## 公网临时访问

本地服务默认只监听本机。要让不在同一台电脑上的人访问，可用反向隧道把 `localhost:8000` 映射成一个临时 https 地址。

> 当前已开启的临时地址（2026-11-10，Cloudflare Quick Tunnel）：
> `https://improved-restored-univ-downloaded.trycloudflare.com`
> 重启隧道后域名会变化，以命令窗口新打印的地址为准。

任选一种：

**方式 A：Cloudflare Quick Tunnel（推荐，无需账号）**

```powershell
cloudflared tunnel --url http://localhost:8000 --no-autoupdate
```

命令窗口会打印形如 `https://随机词-随机词.trycloudflare.com` 的地址，把它发给对方即可。

**方式 B：localhost.run（只需 OpenSSH，无需安装额外程序）**

```powershell
ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -R 80:localhost:8000 nokey@localhost.run
```

终端会打印形如 `https://随机串.lhr.life` 的地址。

注意事项：

- 链接是**公开**的：没有登录、密码或访问控制，拿到 URL 的任何人都能打开。本站只包含公开资料综述，没有敏感数据。
- 链接是**临时**的：关闭命令窗口、结束隧道进程或停止 `python -m http.server` 后立即失效；`localhost.run` 的免费域名还会周期性轮换。
- 需要本机保持开机、联网，且上述两个进程都在运行。
- 校园网、公司网络或部分运营商可能拦截 22 端口；此时用方式 A，或让 SSH 走 443 端口。

## 目录结构

```text
D:\opencode\
├─ index.html              # 页面骨架、10 个章节与所有无障碍标签
├─ css\
│  └─ style.css            # 设计变量、深浅色、布局、组件、响应式、打印
├─ js\
│  ├─ content.js           # 时间轴、论证、机制、立场、矩阵、术语、自评问题
│  └─ app.js               # 所有渲染、筛选、排序、交互、模拟器与降级
├─ data\
│  ├─ evidence.json        # 11 张经验证据卡
│  └─ papers.json          # 4 组共 36 条阅读清单
├─ README.md
└─ install_w64devkit_skill.md  # 原有环境文件，与本项目无关
```

## 已实现功能

### 阅读与导航

- 固定侧栏目录、滚动高亮、顶部阅读进度条
- 移动端汉堡菜单、遮罩、Esc 关闭、焦点管理
- 深色 / 浅色主题切换，写入 `localStorage`（键名 `rsi-theme`）
- 中英术语对照、正文术语悬浮解释、点击跳转术语表并高亮
- 打印前自动展开全部 `<details>`，打印后恢复原状态

### 内容模块

- **思想史时间轴**：15 个节点，按年代筛选，可展开 / 收起全部
- **论证结构**：支持方三段论、反方五个攻击点、条件性结论
- **机制分类**：组件级 / 系统级 / 元级，附代表工作与证据缺口
- **经验证据库**：11 项公开工作，支持按闭环深度、人类角色、层级筛选，按可信度、深度、年份、可复现性、评估独立性排序，并支持全文搜索
- **六问自评**：回答“是 / 部分 / 否 / 不确定”，给出 0–12 分、条件性判断与优先核查项
- **起飞模拟器**：三个滑杆（每代增益、每代耗时、瓶颈强度），用 logistic 示意模型画出 100 代能力倍数，并在 Chart.js 失败时显示关键代际数据表
- **观点矩阵**：Good、Vinge、Yudkowsky、Chalmers、Hanson、Bostrom、Cotra、Davidson 的主张对照
- **安全与治理**：风险链条、五个关键概念、治理工具箱及局限
- **批评与未解问题**：12 条批评、4 个可推进研究问题
- **阅读清单**：入门 7 条、论文 14 条、批评 8 条、政策 7 条，链接状态逐条标注

## 数据结构

### `js/content.js`

通过 `window.RSI_CONTENT` 暴露一个普通对象，`app.js` 以普通脚本读取，不使用 ES module。主要字段：

| 字段 | 内容 |
| --- | --- |
| `meta` | 标题、版本、最后核查日期 |
| `timeline` | 时间轴节点：年份、年代、人物、主张、细节、可信度、链接 |
| `argument` | 支持方前提、反方攻击点、条件性结论 |
| `mechanisms` | 机制层级、证据强度、代表工作、离真 RSI 的差距 |
| `positions` | 快速 / 慢速 / 证据不足三方立场 |
| `viewpoints` | 人物观点矩阵 |
| `riskChain` | 五步风险情景链 |
| `safetyConcepts` | 可监督性、评估博弈、沙箱逃逸等概念 |
| `governance` | 治理工具、机制、现状、例子、局限 |
| `criticisms` | 批评条目与来源方向 |
| `glossary` | 术语 id、中文、英文、一句话解释 |
| `checklistQuestions` | 六问自评的题干与解释 |

### `data/evidence.json`

每条证据卡包含：

```text
id, name, year, institution, layer, target, loop, loopLength, loopDepth,
evaluator, humanInLoop, injection, result, limits, credibility, verdict,
scores { depth, evaluation, reproducibility, generalization },
sourceTitle, link
```

`humanInLoop` 取值：

- `none`：无需逐轮人类介入
- `oversight`：人类监督 / 设定评估器与边界
- `step`：人类逐轮介入

四项 `scores` 均为 **1–5 分的本页编辑评估**，不是论文报告指标，也不是对研究质量的最终结论。默认排序为“可信度优先；同级按闭环深度降序”。

### `data/papers.json`

```text
groups[] { id, name, description, items[] }
items[]  { title, authors, year, type, link, status, intro }
```

`status` 为 `verified` 或 `pending`。`pending` 会在页面上显示“链接待核实”，不会被伪装成已核查。

## 可信度标注

全站只使用四类标签：

- **【事实】**：可观察、可复现或有公开记录的结果；不等于对长期含义的判断。
- **【学界共识】**：相关研究群体中较广泛支持，但仍可能有边界争议。
- **【存在争议】**：有实质证据或论证支持不同结论；页面写出主张者。
- **【推测】**：条件性预测、思想实验或外推；不当作已发生事实。

## 模拟器说明

模拟器是教学示意，不是预测模型：

```text
C(n+1) = C(n) × (1 + g × (1 − C(n) / K))
K = 10^(9 × (1 − k))
```

- `g`：每代能力增益比例
- `k`：瓶颈强度，越接近 1，承载上限 `K` 越低
- 初始能力倍数固定为 1
- 图表展示 100 代；10 年 / 30 年读数按当前每代耗时换算到最近代际

参数、上限与曲线形状均无经验依据。改变 `k` 会改变上限，因此“拐点”和倍数只是模型内部结果，不能解读为真实 AI 时间线。

## 来源与核查记录

核查日期：`2026-11-10`。

### 已核实

- **arXiv 元数据**：通过 arXiv API 核对标题、作者与日期，并抽查摘要页返回 200。包括：
  - `cs/0309048`、`1712.01815`、`2203.14465`、`2212.08073`
  - `2303.11366`、`2303.17651`、`2305.16291`、`2310.02304`、`2310.09144`
  - `2401.10020`、`2402.08797`、`2407.14981`、`2408.08435`、`2410.04444`、`2412.04984`
  - `2505.03335`、`2505.22954`、`2506.13131`
  - 批评与测量：`1906.01820`、`1911.01547`、`2105.14111`、`2111.15366`、`2209.00626`、`2307.03718`
- **背景与思想史**：Good 1965（Virginia Tech 开放副本）、Vinge 1993（SDSU）、Chalmers 2010（作者官网 PDF）、Bostrom 2014（作者官网）、MIRI 的 IEM 与 AIPosNegFactor、Epoch AI 的 Davidson 配套模型页。
- **政策与治理**：EU AI Act（HTTP 202，可访问）、NIST AI RMF、International AI Safety Report 2025、CAIS Statement on AI Risk。
- **阅读清单**：36 条中 34 条返回 200/202。

### 待核实

- **Robin Hanson, “Economics of the Singularity”（IEEE Spectrum, 2008）**：当前网络环境连接失败（`000`），标为待核实；此前一次检查曾返回 200。
- **Ajeya Cotra / Cold Takes 的生物锚点方法解释页**：当前网络环境连接失败，标为待核实；此前一次检查曾返回 200。

### 替代链接与限制

- Open Philanthropy 的 Davidson 报告原页面对自动抓取返回 403，因此使用 Epoch AI 的配套互动模型页，并在时间轴条目中注明。
- 不抓取付费全文，不使用受版权保护的全文副本；页面只做公开摘要、作者页面与政策文本层面的核查。
- `cdn.jsdelivr.net` 在当前构建环境不可达。页面已实现 Chart.js 等待、失败提示、数据表降级与手动重试；在可访问 jsDelivr 的网络中会自动渲染图表。

## 自测记录

已在 `D:\opencode` 完成：

```powershell
node --check js\content.js
node --check js\app.js
python -m http.server 8000
```

- `http://localhost:8000/index.html` 返回 200。
- 证据库加载 11 张卡；阅读清单加载 4 组 36 条；术语 25 条；时间轴 15 条；自评 6 题。
- 时间轴年代筛选、展开 / 收起、证据筛选 / 搜索 / 排序、空状态、自评计分、模拟器滑杆、术语搜索均已通过浏览器脚本验证。
- Chart.js CDN 失败时：canvas 隐藏、降级提示显示、8 行关键代际数据表生成、重试按钮可用。
- 打印事件测试：26 个 `<details>` 在 `beforeprint` 中全部打开，`afterprint` 后恢复。
- Lighthouse（浅色与深色）：Accessibility 100、Best Practices 100、SEO 100。
- 外链批量探测：38 个唯一链接中 36 个返回 200/202，2 个连接失败并标为待核实；CDN 单独计为当前环境不可达。

## 已知限制与未实现项

**已实现但有限制：**

- 证据评分是本页编辑评估，不是文献计量或同行评议结果。
- 样本是 11 项公开工作，不是对全领域所有未公开工作的断言。
- 时间轴、观点矩阵与术语表是综述性整理，不能替代原论文。
- 模拟器只用于理解参数关系，不能用于预测时间线或风险。
- 深色模式、导航状态与自评答案不跨设备同步；仅主题写入 `localStorage`。
- 打印样式会展开内容，但 Chart.js 图表在无网络时只能打印数据表。

**未实现：**

- 没有后端、数据库、账户、评论或收藏功能。
- 没有自动定时外链巡检；链接状态需人工或外部脚本更新。
- 没有全文检索、PDF 解析或论文元数据自动同步。
- 没有多语言版本；页面主体为中文，关键术语提供英文对照。
- 没有把 Chart.js 打包进本地的计划；当前按需求使用 CDN，并以数据表作为降级路径。

## 维护建议

1. 新增时间轴节点：编辑 `js/content.js` 的 `timeline`，补全 `credibility`、`credibilityNote` 与 `link.status`。
2. 新增证据卡：编辑 `data/evidence.json`，保持四项评分为 1–5，并在 `limits` 写明边界。
3. 新增阅读条目：编辑 `data/papers.json`，只填写可公开访问的入口；无法确认时用 `pending`。
4. 更新核查日期：同步修改 `index.html`、`js/content.js`、`data/evidence.json`、`data/papers.json` 中的 `lastVerified` / 页面日期。
5. 修改后运行 `node --check`，并通过本地 HTTP 服务做一次筛选、排序与移动端检查。
