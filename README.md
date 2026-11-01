# rofilter

ROFilter 反渗透膜系统设计 **MCP 服务器**（[rofilter.cn](https://rofilter.cn)）：膜元件库（733 件 / 8 品牌）、进水水质分析（TDS / 渗透压 / LSI / 碳酸平衡）、完整系统设计设计计算（进水压力 / 产水 TDS / 能耗 / 逐段通量）。

一个包，三种接法：**stdio MCP 服务器**（Coze / Claude Desktop / Cursor 一键添加）、**Streamable HTTP 直连**、**DeepSeek Harness 一键插件**。

## 工具

| 工具 | 作用 |
|---|---|
| `list_elements` | 查膜元件库（733 件，8 个品牌，支持筛选） |
| `get_element` | 取单支膜完整参数与极限值 |
| `analyze_water` | 进水水质分析：TDS、渗透压、LSI/CCPP、碳酸平衡 |
| `run_design` | 完整系统设计：进水压力、产水 TDS、能耗、逐段通量 |
| `list_schemes` | 行业方案模板（电力、制药、电子、食品饮料、海淡） |

查询类工具不消耗额度，只有 `run_design` 计费（每天免费额度内）。

## 1. Coze（扣子）添加

Coze Studio → **插件** → **创建插件** → **MCP** → **npm**：

```
包名: rofilter
命令:  rofilter-mcp
```

安装（必要时）：

```bash
npm i -g rofilter
```

或不预装，直接在 Coze 里填 npm 包名即可（Coze 会自动 `npx` 起 `bin` 命令 `rofilter-mcp`）。

## 2. Claude Desktop / Claude Code

`claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "rofilter": {
      "command": "npx",
      "args": ["-y", "rofilter"]
    }
  }
}
```

或全局安装后：

```json
{
  "mcpServers": {
    "rofilter": {
      "command": "rofilter-mcp"
    }
  }
}
```

Cursor / Zed 等 stdio MCP 客户端同理。

## 3. Streamable HTTP 直连（任何支持 HTTP MCP 的客户端）

```
端点: https://rofilter.cn/mcp
请求头: Authorization: Bearer rfmcp_你的令牌
```

```json
{
  "mcpServers": {
    "rofilter": {
      "type": "http",
      "url": "https://rofilter.cn/mcp",
      "headers": { "Authorization": "Bearer rfmcp_你的令牌" }
    }
  }
}
```

## 4. DeepSeek Harness（DSH）一键插件

左侧栏 **插件** → **添加插件** → 粘贴包名 `rofilter` → **安装** → **立即启用**。
包内 `cordis.patch.yml` 会把自带的 `@deepseek-ai/dsh-mcp-client` 挂到远程端点。

命令行注意：只用 `dsh plugin add rofilter` 不够——那条命令只装依赖，不会把组合包选进 `dsh.profile.bundles`；走界面的「安装」会把两步一起做掉。

## 令牌

包内自带**共享试用令牌**（全站 1000 次/天，次日恢复）。stdio 模式下可用环境变量覆盖：

```bash
ROFILTER_TOKEN=rfmcp_你的令牌 rofilter-mcp
```

正式使用请到 [rofilter.cn](https://rofilter.cn) 免费注册，在「个人设置 → MCP 接入」生成专属令牌。

## 工作原理

stdio MCP 服务器（`bin/rofilter-mcp.js`，零依赖，Node ≥ 18 内置 fetch）把 rofilter.cn 的 Streamable HTTP MCP 端点桥接为 stdio：initialize / tools/list / tools/call 全部转发，自动维护 `Mcp-Session-Id`，兼容 JSON 与 SSE 两种响应。计算引擎与 rofilter.cn 网页端同源同数值；交付前建议用厂商官方软件复核。

## 说明

- 查询（`list_elements` / `get_element` / `analyze_water` / `list_schemes`）免费，`run_design` 计费。
- 服务本体为 rofilter.cn 所有，按该站服务条款提供。

## English

ROFilter reverse-osmosis design **MCP server**: membrane library, feed-water analysis, full system design. One package, three integrations:

- **stdio MCP** (Coze / Claude Desktop / Cursor): package `rofilter`, bin command `rofilter-mcp`, zero dependencies (Node ≥18).
- **Streamable HTTP**: `https://rofilter.cn/mcp` with `Authorization: Bearer rfmcp_…`.
- **DeepSeek Harness bundle**: install package `rofilter` in the Plugins panel.

Ships a shared trial token (1,000 `run_design` calls/day). Generate your own at rofilter.cn → Settings → MCP access; override via `ROFILTER_TOKEN` env var or your profile's `cordis.patch.yml`.

## License

MIT. See [LICENSE](LICENSE).
