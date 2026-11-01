# ROFilter MCP Server

> Reverse osmosis (RO) membrane system design for AI agents: feed pressure, permeate TDS, energy use, flux distribution and per-stage results — from the same engine that powers [rofilter.cn](https://rofilter.cn).

[![MCP Registry](https://img.shields.io/badge/MCP%20Registry-cn.rofilter%2Frofilter--mcp-2ED9A8)](https://registry.modelcontextprotocol.io/?q=rofilter)
[![Website](https://img.shields.io/badge/website-rofilter.cn-0B8F92)](https://rofilter.cn)
[![Transport](https://img.shields.io/badge/transport-streamable--http-blue)](https://rofilter.cn/mcp)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-plugin%20bundle-2ED9A8)](DEEPSEEK-HARNESS.md)

ROFilter is an engineering tool for membrane-based water treatment. It ships with measured parameters for 733 membrane elements across 8 manufacturers (Hydranautics, DuPont, Toray, CSM, LG, Veolia, Vontron, Ovay), analyzes feed water chemistry, and runs full system designs. This repository documents the hosted MCP endpoint that exposes that engine to MCP-capable AI clients.

## Why an agent needs it

Membrane design is full of repeated data entry: looking up an element's active area and salt rejection, typing in a dozen ions, re-running at another recovery to see what happens to the feed pressure. Those are exactly the steps an AI client can do for you — as long as it can call a real calculation engine rather than guess numbers.

The MCP server returns structured results from the production engine, identical to what the web application produces for the same inputs.

## Tools

| Tool | What it does |
|---|---|
| `list_elements` | Search the membrane library by brand, family, keyword or applicable TDS range. Returns area, permeate flow, rejection and test conditions. |
| `get_element` | Full parameter set for one element: dimensions, performance, test conditions, operating limits (max temperature, pH range, max pressure drop). |
| `analyze_water` | Feed water analysis from ion concentrations: TDS, osmotic pressure, conductivity, LSI / CCPP scaling indices, carbonate balance (CO2 / HCO3 / CO3) and alkalinity. |
| `run_design` | Full system design: given water analysis, recovery, permeate flow and array configuration, returns feed pressure, permeate TDS, concentrate concentration, specific energy, average and per-stage flux, interstage pressure drop, per-stage breakdown. |
| `list_schemes` | Industry configuration templates (power, pharmaceutical, electronics, food & beverage, seawater desalination) as starting points. |

## Quick start

Endpoint: `https://rofilter.cn/mcp` (Streamable HTTP, JSON-RPC 2.0)

A token is required. A **shared trial token** is pre-filled in the examples below: 1,000 calculations per day in total, shared by all users, reset daily — good enough to try the server right away.

For your own independent quota, create a free account at [rofilter.cn](https://rofilter.cn) → **MCP service** panel in the top bar (self-service, instant).

> The trial token may be rotated or revoked at any time. If it stops working, generate a personal token with the steps above.

### DeepSeek Harness

One line, no JSON: sidebar **Plugins** → **Add plugin** → paste this → **Install** → **Enable now**.

```
github:szhuangzan/rofilter-mcp
```

The npm name `rofilter` becomes the shorter alternative once it is published to the registry.

The bundle ships no code — it mounts DeepSeek Harness's built-in `@deepseek-ai/dsh-mcp-client` against this endpoint and pre-fills the shared trial token. Tools appear as `mcp__rofilter__list_elements`, `mcp__rofilter__run_design`, `mcp__rofilter__analyze_water`, `mcp__rofilter__get_element`, `mcp__rofilter__list_schemes`.

For your own quota, generate a token at [rofilter.cn](https://rofilter.cn) and override one row in `~/.dsh/profiles/<profile>/cordis.patch.yml` — the installed bundle stays untouched:

```yaml
- id: rofilter-mcp
  config:
    headers:
      Authorization: 'Bearer rfmcp_<your-token>'
```

Restart DeepSeek Harness afterwards. Full guide (install methods, token, troubleshooting): [DEEPSEEK-HARNESS.md](DEEPSEEK-HARNESS.md).

### Claude Desktop / Claude Code

```json
{
  "mcpServers": {
    "rofilter": {
      "type": "http",
      "url": "https://rofilter.cn/mcp",
      "headers": {
        "Authorization": "Bearer rfmcp_1603bb7f5749b0f01f2828ecb43fa1662a8ee8a9"
      }
    }
  }
}
```

### Cursor

`~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "rofilter": {
      "url": "https://rofilter.cn/mcp",
      "headers": {
        "Authorization": "Bearer rfmcp_1603bb7f5749b0f01f2828ecb43fa1662a8ee8a9"
      }
    }
  }
}
```

### Python (official SDK)

```python
from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client

async with streamablehttp_client(
    "https://rofilter.cn/mcp",
    headers={"Authorization": "Bearer rfmcp_1603bb7f5749b0f01f2828ecb43fa1662a8ee8a9"},
) as (read, write, _):
    async with ClientSession(read, write) as session:
        await session.initialize()
        tools = await session.list_tools()
        print([t.name for t in tools.tools])
```

## Example prompts

- "With ESPA2-LD, 100 vessels × 6 elements, 75% recovery and 100 m³/h permeate — what are the feed pressure and permeate TDS?"
- "Feed TDS 2500, Ca 200, Mg 60, HCO3 300, pH 7.4 at 25 °C. Will it scale? Do I need acid dosing or softening?"
- "Pick 3 brackish water elements with average flux between 15 and 20 lmh."

## Limits

- Results are for design drafts and option comparison, not a performance guarantee. Deliverables that require a vendor warranty normally need the manufacturer's own software.
- MCP calls are metered per token (1,000 calculations per day by default). Query-only tools do not consume quota.
- Missing water quality items are treated as zero — always start from a real lab report.

## Chinese summary

ROFilter 是膜法水处理设计工具，本仓库是它对外提供的 MCP 服务说明。远程端点 `https://rofilter.cn/mcp`，在网站顶栏「MCP服务」面板自助生成令牌后即可在 Claude Desktop、Cursor 等客户端接入。工具覆盖元件库查询、单支膜完整参数、进水水质与结垢分析（LSI/CCPP）、系统设计计算与行业方案模板；结果与网页端同引擎同数值。计算结果用于方案阶段比选与校核，交付前建议用厂商官方软件复核。

DeepSeek Harness 用户不用手写配置：侧栏「插件 → 添加插件」，粘贴 `github:szhuangzan/rofilter-mcp` 即可安装（npm 包名 `rofilter` 发布后可用更短的写法）。详见 [DEEPSEEK-HARNESS.md](DEEPSEEK-HARNESS.md)。

## Links

- Website: https://rofilter.cn
- MCP documentation: https://rofilter.cn/static/docs/help.html#mcp
- Official MCP Registry entry: `cn.rofilter/rofilter-mcp`
- Machine-readable site summary: https://rofilter.cn/llms.txt

## License

The MCP service is proprietary and provided under the terms of service of rofilter.cn. The DeepSeek Harness bundle in this repository (`package.json`, `cordis.patch.yml`, `locale/`, `icon.svg`) is a configuration-only wrapper with no service code, released under the MIT license.
