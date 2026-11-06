# rofilter

ROFilter（[rofilter.cn](https://rofilter.cn)）是一款**反渗透膜系统设计软件**，内置膜元件库（742 件 / 8 品牌）、进水水质分析（TDS / 渗透压 / LSI / 碳酸平衡）、完整系统设计计算（进水压力 / 产水 TDS / 能耗 / 逐段通量）。本包是它的 **MCP 接入能力**，让 AI 助手直接调用同一套计算引擎。

npm 包：[**rofilter**](https://www.npmjs.com/package/rofilter)（`npx -y rofilter` 即用）

## 工具

| 工具 | 作用 |
|---|---|
| `list_elements` | 查膜元件库（742 件，8 个品牌，支持 brand / family / keyword / TDS 筛选；默认前 30 条，支持 offset+limit 分页，all=true 一次取全量） |
| `get_element` | 取单支膜完整参数与运行边界 |
| `analyze_water` | 进水水质分析：TDS、电导率、渗透压、LSI/Ryznar/CCPP、碳酸平衡、盐类饱和度 |
| `analyze_scaling` | 结垢评估与最大可持续回收率：加/不加阻垢剂两档、限制矿物、设计回收率处逐项判定、阻垢剂推荐、pH 扫描给最佳 pH 与加酸/加碱量 |
| `run_design` | 完整多段系统设计：进水压力、产水 TDS、能耗、逐段通量/压差 |
| `list_schemes` | 行业方案模板（电力、制药、电子、食品饮料、海淡） |

查询与评估类工具免费，`run_design` 计费（每天免费额度）。

---

# 各 Agent / 客户端接入指南

统一原理：`rofilter` 包提供 **stdio MCP 服务器**（`rofilter-mcp`）；也可以跳过本地进程直接 **Streamable HTTP** 连 `https://rofilter.cn/mcp`。

| 平台 | 推荐方式 | 见下文 |
|---|---|---|
| 豆包 / 扣子 Coze | 插件 → MCP → npm `rofilter`；或技能导入 Skill zip | §1 |
| 通义千问（Qwen Code / 百炼） | stdio `npx rofilter` / HTTP 直连 | §2 |
| WorkBuddy | MCP 服务器 `npx -y rofilter` | §3 |
| Claude（Desktop / Code） | mcpServers JSON / skill zip | §4 |
| Cursor | `~/.cursor/mcp.json` | §5 |
| Windsurf | `mcp_config.json` | §5 |
| DeepSeek Harness | 插件面板装 `rofilter` | §6 |
| 其他任意 MCP 客户端 | stdio 或 HTTP 二选一 | §7 |

## 1. 豆包 / 扣子（Coze）

### 方式 A：MCP 插件（推荐，工具实时可用）

扣子 / Coze Studio → **插件** → **创建插件** → 选 **MCP** → 选 **npm**：

```
包名: rofilter
命令:  rofilter-mcp
```

Coze 会自动 `npx` 拉起包内 `bin/rofilter-mcp`，无需预装。若平台要求填写启动参数，留空即可；需要令牌时在环境变量里填 `ROFILTER_TOKEN`。

### 方式 B：技能（Skill）导入

扣子 → **技能** → **创建技能** → 导入 zip → 上传：

```
skills/rofilter-mcp-skill-flat.zip
```

> 扁平包（zip 根目录直接是 `SKILL.md` + `references/`）。技能内含完整调用指引；工具调用仍需在空间里配置上面的 MCP 插件。

## 2. 通义千问（Qwen）

### Qwen Code CLI

编辑 `~/.qwen/settings.json`（Linux/macOS）或 `%USERPROFILE%\.qwen\settings.json`（Windows）：

```json
{
  "mcpServers": {
    "rofilter": {
      "command": "npx",
      "args": ["-y", "rofilter"],
      "env": { "ROFILTER_TOKEN": "rfmcp_你的令牌" }
    }
  }
}
```

之后在 Qwen Code 里直接问："用 ROFilter 算一下 ESPA2-LD 100 支容器产水 100 m³/h 的进水压力"。

### 通义 / 百炼平台（应用编排）

应用编辑器 → **插件** / **MCP 服务** → 添加 **MCP 服务** → 填 Streamable HTTP：

```
URL:   https://rofilter.cn/mcp
Header: Authorization: Bearer rfmcp_你的令牌
```

## 3. WorkBuddy

WorkBuddy → **MCP 服务器 / 工具** 设置 → 添加自定义 MCP（stdio）：

```
命令:      npx
参数:      -y rofilter
环境变量:  ROFILTER_TOKEN = rfmcp_你的令牌
```

若 WorkBuddy 支持远程 MCP，可改用 HTTP：`https://rofilter.cn/mcp` + Bearer 头。

## 4. Claude（Desktop / Claude Code）

### Claude Desktop

`claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "rofilter": { "command": "npx", "args": ["-y", "rofilter"] }
  }
}
```

### Claude Code

```bash
claude mcp add rofilter -- npx -y rofilter
```

带令牌：

```bash
claude mcp add rofilter --env ROFILTER_TOKEN=rfmcp_你的令牌 -- npx -y rofilter
```

### 作为技能（Agent Skill）安装

下载 `skills/rofilter-mcp-skill.zip`（标准布局：`rofilter-design/SKILL.md`），放进项目的 `.claude/skills/` 或用户级 skills 目录后重启。

## 5. Cursor / Windsurf / Zed / Gemini CLI 等

**Cursor**（`~/.cursor/mcp.json`）：

```json
{
  "mcpServers": {
    "rofilter": { "command": "npx", "args": ["-y", "rofilter"] }
  }
}
```

**Windsurf**（`~/.codeium/windsurf/mcp_config.json`）：

```json
{
  "mcpServers": {
    "rofilter": {
      "command": "npx",
      "args": ["-y", "rofilter"],
      "env": { "ROFILTER_TOKEN": "rfmcp_你的令牌" }
    }
  }
}
```

**Gemini CLI**（`~/.gemini/settings.json`）：

```json
{
  "mcpServers": {
    "rofilter": { "command": "npx", "args": ["-y", "rofilter"] }
  }
}
```

## 6. DeepSeek Harness（DSH）一键插件

左侧栏 **插件** → **添加插件** → 粘贴包名 `rofilter` → **安装** → **立即启用**。
包内 `cordis.patch.yml` 自动把自带的 `@deepseek-ai/dsh-mcp-client` 挂到远程端点。

命令行注意：只用 `dsh plugin add rofilter` 不够——那条命令只装依赖，不会把组合包选进 `dsh.profile.bundles`；走界面的「安装」会把两步一起做掉。

## 7. 任意 MCP 客户端（stdio / HTTP 二选一）

stdio（本地进程桥接）：

```
命令:  npx -y rofilter        （等价 bin 命令: rofilter-mcp）
env:   ROFILTER_TOKEN = rfmcp_你的令牌 （可选）
```

Streamable HTTP 直连（免本地进程）：

```
端点:   https://rofilter.cn/mcp
请求头: Authorization: Bearer rfmcp_你的令牌
```

---

# Skill 包（技能 zip）

仓库 [`skills/`](skills/) 目录提供两种布局（内容相同：SKILL.md 工作流 + 3 份参考资料 access / design-tuning / water-quality）：

| 文件 | 布局 | 适用 |
|---|---|---|
| `rofilter-mcp-skill.zip` | `rofilter-design/SKILL.md`（一层目录） | Claude Code 等 Agent Skills 标准形态 |
| `rofilter-mcp-skill-flat.zip` | 根目录直接 `SKILL.md` | 扣子/豆包等要求 zip 根含 SKILL.md 的平台 |

> **校验报错排查**：早期版本的 zip 在 Windows 下被打成反斜杠路径（`rofilter-design\SKILL.md`），平台解压后识别不到 SKILL.md。2026-11 起两个 zip 均为 ZIP 规范的正斜杠路径；线上下载（[rofilter.cn/static/downloads/](https://rofilter.cn/static/downloads/rofilter-mcp-skill.zip)）始终是修复后的版本。

# 令牌

包内自带**共享试用令牌**（全站 1000 次/天，次日恢复）。正式使用请到 [rofilter.cn](https://rofilter.cn) 免费注册，在「个人设置 → MCP 接入」生成专属令牌：

```bash
# stdio 模式
ROFILTER_TOKEN=rfmcp_你的令牌 npx -y rofilter        # Linux/macOS
# PowerShell: $env:ROFILTER_TOKEN='rfmcp_…'; npx -y rofilter
```

HTTP 模式直接把令牌放进 `Authorization: Bearer …` 头。

# 工作原理

stdio MCP 服务器（`bin/rofilter-mcp.js`，零依赖，Node ≥ 18 内置 fetch）把 rofilter.cn 托管的 Streamable HTTP MCP 端点桥接为 stdio：initialize / tools/list / tools/call 逐条转发，自动维护 `Mcp-Session-Id`，兼容 JSON 与 SSE 两种响应。

计算引擎与 rofilter.cn 网页端同源同数值；交付前建议用厂商官方软件复核。

# 仓库结构

```
bin/rofilter-mcp.js            stdio MCP 服务器（npm bin 入口）
skills/SKILL.md                skill 源（标准 Agent Skills 格式）
skills/references/             参考资料（接入/调参/水质）
skills/rofilter-mcp-skill*.zip 两种布局的技能包
cordis.patch.yml               DeepSeek Harness 组合包配置
locale/                        DSH 插件元数据（中/英）
icon.svg                       插件图标
server.json / plugin-market.json  MCP 注册表 / DSH 市场索引
docs-mcp-guide*.html           rofilter.cn 端 MCP 接入指南快照
```

# English

ROFilter is a **reverse-osmosis membrane system design software** (rofilter.cn). This package is its MCP integration — one package, many clients:

- **stdio MCP** (Coze/Doubao, Qwen, WorkBuddy, Claude, Cursor, Windsurf, Gemini CLI…): `command: npx`, `args: ["-y", "rofilter"]`, env `ROFILTER_TOKEN`.
- **Streamable HTTP**: `https://rofilter.cn/mcp` with `Authorization: Bearer rfmcp_…`.
- **DeepSeek Harness bundle**: install `rofilter` from the Plugins panel.
- **Agent Skills**: two zips under `skills/` (standard `rofilter-design/SKILL.md` layout and a flat layout whose root is `SKILL.md`) with full workflow references.

Zero dependencies (Node ≥18). Ships a shared trial token (1,000 `run_design` calls/day); generate your own at rofilter.cn → Settings → MCP access.

# License

MIT. See [LICENSE](LICENSE).

> AI生成
