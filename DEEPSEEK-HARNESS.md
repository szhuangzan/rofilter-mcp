# 在 DeepSeek Harness 里安装 ROFilter

本仓库除了描述托管的 MCP 端点，还包含一个**只含配置的 DeepSeek Harness 组合包**
（`package.json`、`cordis.patch.yml`、`locale/`、`icon.svg`）。它不含任何计算代码，
只是把 Harness 自带的 `@deepseek-ai/dsh-mcp-client` 挂到 `https://rofilter.cn/mcp`。

装好之后，Agent 就会用 `mcp__rofilter__*` 这一组工具，和网页端同一个计算引擎。

## 安装（30 秒）

侧栏 **插件** → **添加插件** → 粘贴下面任意一种 → **安装** → **立即启用**：

| 方式 | 粘贴内容 | 说明 |
|---|---|---|
| npm 包名 | `rofilter` | 最短，升级方便 |
| Git 地址 | `github:szhuangzan/rofilter-mcp` | 需要能访问 GitHub |
| 安装包直链（tarball） | `https://rofilter.cn/npm/rofilter/-/rofilter-2.1.0.tgz` | rofilter.cn 自托管，不依赖任何 npm 源；版本号可换 |
| npmmirror 直链 | `https://registry.npmmirror.com/rofilter/-/rofilter-2.1.0.tgz` | 国内镜像直装 |
| 本地目录 | `D:\dsh\rofilter` | 离线分发，粘贴绝对路径 |

装完建议**重启一次** DeepSeek Harness，让 Loader 完整重载。

## 装好后能做什么

| 工具 | 作用 |
|---|---|
| `mcp__rofilter__list_elements` | 查膜元件库（733 件 / 8 个品牌） |
| `mcp__rofilter__get_element` | 单支膜完整参数与极限值 |
| `mcp__rofilter__analyze_water` | 进水水质分析：TDS、渗透压、LSI/CCPP |
| `mcp__rofilter__run_design` | 完整系统设计：进水压力、产水 TDS、能耗、逐段通量 |
| `mcp__rofilter__list_schemes` | 行业方案模板 |

直接这样问：

> ESPA2-LD，100 支膜壳 × 6 支，回收率 75%，产水 100 m³/h，进水压力和产水 TDS 是多少？

## 令牌

安装包默认带**公共试用令牌**：全站共享 1000 次/天，次日恢复，可能随时被换。
查询类工具不消耗额度，只有 `run_design` 计费。

要独立、稳定的额度：到 [rofilter.cn](https://rofilter.cn) 注册 →「个人设置 → MCP 接入」生成令牌，
然后在自己的 profile 补丁层覆盖这一行（不用改已安装的包）：

`~/.dsh/profiles/<profile>/cordis.patch.yml`

```yaml
- id: rofilter-mcp
  config:
    headers:
      Authorization: 'Bearer rfmcp_你的令牌'
```

保存后重启 DeepSeek Harness。

## 常见问题

**装完没看到 `mcp__rofilter__*` 工具？**

确认组合包是「已启用」状态；工具列表在会话建立时确定，开一个新会话再看。

**提示连接失败或 401？**

公共试用令牌可能被换过。换成自己的令牌，或升级到最新版本。

**要重启吗？**

首次启用新组合包后建议重启一次。

**怎么升级？**

- Git 地址：卸载后重新安装，会拉取仓库最新提交
- npm：卸载后重新安装，或点「更新」
- 直链 / 本地目录：换新版本的链接或目录重新安装

**这个包会执行代码吗？**

在 DeepSeek Harness 里不会——DSH 只读 `cordis.patch.yml`，挂载的是 Harness 自带的
`@deepseek-ai/dsh-mcp-client`。包里的 `bin/rofilter-mcp.js` 是给**其他**客户端
（豆包/扣子、通义千问、WorkBuddy、Claude、Cursor 等）用的零依赖 stdio 服务器，
DSH 不会运行它。其他平台的接入办法见 [README.md](README.md)。

## 版本

- 2.1.0（2026-11-01）：新增 stdio 服务器供其他 Agent 使用；包内附 Agent Skills 双布局 zip；全平台接入指南
- 2.0.0：首个 stdio 版本
- 1.0.0：纯 DSH 配置组合包

## English

The package is now published to npm as **`rofilter`** (v2.1.0+): a configuration-only
DeepSeek Harness bundle (`cordis.patch.yml` mounts the built-in `@deepseek-ai/dsh-mcp-client`
against `https://rofilter.cn/mcp`), plus a zero-dependency **stdio MCP server**
(`bin/rofilter-mcp.js`) for every other client (Coze/Doubao, Qwen, WorkBuddy, Claude,
Cursor — see README.md).

Install from the **Plugins** sidebar: **Add plugin** → `rofilter` · `github:szhuangzan/rofilter-mcp`
· `https://rofilter.cn/npm/rofilter/-/rofilter-2.1.0.tgz` · or a local path → **Install** →
**Enable now**, then restart Harness once.

The bundle pre-fills a shared trial token (1,000 calculations/day); generate your own at
rofilter.cn and override the `Authorization` header under row id `rofilter-mcp` in your
profile's `cordis.patch.yml`. For stdio clients set the `ROFILTER_TOKEN` env var.

Tools: `mcp__rofilter__list_elements`, `get_element`, `analyze_water`, `run_design`, `list_schemes`.
