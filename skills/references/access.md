# ROFilter MCP 接入与故障排查

本技能依赖已接入的 ROFilter MCP 服务（工具前缀通常为 `rofilter_` 或 `mcp__rofilter__`）。若当前会话看不到这 5 个工具，按本文引导用户接入。

## 一、服务端点

| 项目 | 内容 |
|---|---|
| 端点 | `https://rofilter.cn/mcp` |
| 传输 | Streamable HTTP（POST + JSON-RPC 2.0），不支持服务端推送流，`GET` 返回 405 属正常 |
| 协议版本 | 2024-11-05 / 2025-03-26 / 2025-06-18 |
| 支持方法 | `initialize`、`tools/list`、`tools/call`、`ping` |
| 鉴权 | `Authorization: Bearer rfmcp_xxx`；不支持自定义头的客户端可用 `https://rofilter.cn/mcp?token=rfmcp_xxx` |
| 配额 | 默认每令牌每日 1000 次 `tools/call`，自然日重置；`initialize`/`tools/list`/`ping` 不计 |

令牌在网站「个人设置 → MCP 接入」生成，前缀 `rfmcp_`，90 天有效，重新生成会立即作废旧令牌，可绑定出口 IP。**不要在任何输出里回显完整令牌。**

## 二、客户端配置

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

- Claude Desktop：`%APPDATA%\Claude\claude_desktop_config.json`，保存后重启客户端
- Cursor：项目根 `.cursor/mcp.json` 或全局 `~/.cursor/mcp.json`
- 其他客户端：按远程 HTTP MCP 方式填写 URL 与头即可

## 三、故障排查

| 现象 | 排查顺序 |
|---|---|
| 工具列表为空 | 客户端是否支持远程 HTTP MCP → 令牌是否过期/被吊销 → 网络能否访问 `https://rofilter.cn/mcp` |
| 401 / 403 | 头是否写成 `Bearer ` 前缀、令牌是否含空格；IP 绑定是否限制了他机 |
| 429 | 当日配额用尽：等待自然日重置，或在网站申请调整上限 |
| 超时 | 客户端是否强依赖 SSE（本服务无推送流）；换 `?token=` 方式试；检查代理 |
| 返回元件缺失 | 与账号权限一致，账号看不到的元件不会通过接口返回 |
| 计算结果与网页端不一致 | 核对是否同一水质输入与同一元件版本；两端共用同一内核，输入一致则结果逐位一致 |

## 四、使用边界（对用户表述时保留）

- 返回结果为设计初稿与方案对比依据，不构成带性能保证值的商务承诺
- 缺项按 0 计入，水质结论需结合实际化验报告
- 公测阶段免费，接口保持向后兼容
- 技术支持：huangzan@rofilter.cn

> AI生成
