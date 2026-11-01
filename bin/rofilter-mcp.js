#!/usr/bin/env node
/* ============================================================
 * rofilter — ROFilter 反渗透膜系统设计 MCP 服务器（stdio 桥接）
 *
 * 零依赖 stdio MCP 服务器：把 rofilter.cn 托管的 Streamable HTTP MCP
 * 端点（https://rofilter.cn/mcp）桥接为 stdio，供 Coze、Claude Desktop、
 * Cursor 等支持 stdio MCP 的客户端一键接入。
 *
 *   Coze:            插件 → MCP → npm 包 → rofilter（命令 rofilter-mcp）
 *   Claude Desktop:  npx -y rofilter / npm i -g rofilter && rofilter-mcp
 *
 * 环境变量：
 *   ROFILTER_TOKEN   令牌（rfmcp_…，rofilter.cn「个人设置 → MCP 接入」生成；
 *                    不设则使用包内共享试用令牌，全站 1000 次/天）
 *   ROFILTER_URL     自定义端点（默认 https://rofilter.cn/mcp）
 * ============================================================ */
'use strict';

const DEFAULT_ENDPOINT = process.env.ROFILTER_URL || 'https://rofilter.cn/mcp';
const TRIAL_TOKEN = 'rfmcp_1603bb7f5749b0f01f2828ecb43fa1662a8ee8a9';
const TOKEN = process.env.ROFILTER_TOKEN || TRIAL_TOKEN;

const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, terminal: false });
let nextId = 1;

function send(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n');
}

const log = (...a) => { try { process.stderr.write(a.map(String).join(' ') + '\n'); } catch (e) { /* ignore */ } };

/* ---------- 端点转发（Streamable HTTP） ---------- */

let endpointSessionId = null; // 服务器返回的 Mcp-Session-Id

async function postRemote(body) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/event-stream',
    'Authorization': 'Bearer ' + TOKEN,
  };
  if (endpointSessionId) headers['Mcp-Session-Id'] = endpointSessionId;

  const res = await fetch(DEFAULT_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const sid = res.headers.get('mcp-session-id');
  if (sid) endpointSessionId = sid;

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error('ROFilter endpoint HTTP ' + res.status + (text ? ': ' + text.slice(0, 300) : ''));
  }

  // Streamable HTTP 响应可能是 JSON，也可能是 SSE 流；两种都处理
  const ct = (res.headers.get('content-type') || '').toLowerCase();
  if (ct.includes('text/event-stream')) {
    const raw = await res.text();
    const dataLines = raw.split('\n')
      .filter(l => l.startsWith('data:'))
      .map(l => l.slice(5).trim());
    for (const line of dataLines) {
      if (!line) continue;
      try { return JSON.parse(line); } catch (e) { /* 非 JSON 行跳过 */ }
    }
    return undefined; // SSE 里没有消息
  }
  const text = await res.text();
  if (!text) return undefined; // 202 Accepted 空 body
  return JSON.parse(text);
}

async function handleRequest(req) {
  const method = req.method;

  try {
    if (method === 'initialize') {
      // 转发到远端拿真实能力，回落本地描述
      let remote = null;
      try { remote = await postRemote({ jsonrpc: '2.0', id: nextId++, method: 'initialize', params: req.params }); } catch (e) { log('remote init failed:', e.message); }
      const result = (remote && remote.result) || {};
      const pkg = require('../package.json');
      send({
        jsonrpc: '2.0',
        id: req.id,
        result: {
          protocolVersion: result.protocolVersion || (req.params && req.params.protocolVersion) || '2025-03-26',
          capabilities: result.capabilities || { tools: {} },
          serverInfo: result.serverInfo || { name: 'rofilter', version: pkg.version },
          instructions: result.instructions || 'ROFilter reverse-osmosis design: membrane library, water analysis, full system design. Hosted by rofilter.cn.',
        },
      });
      return;
    }

    if (method === 'notifications/initialized') {
      try { await postRemote({ jsonrpc: '2.0', method: 'notifications/initialized' }); } catch (e) { /* 服务器可能不要求 */ }
      return;
    }

    if (method === 'tools/list') {
      let remote = null;
      try { remote = await postRemote({ jsonrpc: '2.0', id: nextId++, method: 'tools/list', params: req.params || {} }); }
      catch (e) { send({ jsonrpc: '2.0', id: req.id, error: { code: -32603, message: 'ROFilter remote error: ' + e.message } }); return; }
      send({ jsonrpc: '2.0', id: req.id, result: (remote && remote.result) || { tools: [] } });
      return;
    }

    if (method === 'tools/call') {
      let remote = null;
      try { remote = await postRemote({ jsonrpc: '2.0', id: nextId++, method: 'tools/call', params: req.params }); }
      catch (e) {
        send({ jsonrpc: '2.0', id: req.id, result: { content: [{ type: 'text', text: '❌ ROFilter 调用失败: ' + e.message }], isError: true } });
        return;
      }
      send({ jsonrpc: '2.0', id: req.id, result: (remote && remote.result) || { content: [{ type: 'text', text: '(empty)' }] } });
      return;
    }

    if (method === 'ping') { send({ jsonrpc: '2.0', id: req.id, result: {} }); return; }

    if (method === 'prompts/list') { send({ jsonrpc: '2.0', id: req.id, result: { prompts: [] } }); return; }
    if (method === 'resources/list') { send({ jsonrpc: '2.0', id: req.id, result: { resources: [] } }); return; }

    // 其他请求原样转发
    let remote = null;
    try { remote = await postRemote(req); }
    catch (e) { send({ jsonrpc: '2.0', id: req.id, error: { code: -32603, message: 'ROFilter remote error: ' + e.message } }); return; }
    if (remote && (remote.result !== undefined || remote.error)) send(remote);
    else if (req.id !== undefined) send({ jsonrpc: '2.0', id: req.id, result: {} });
  } catch (e) {
    log('handler error:', (e && e.stack) || e);
    if (req && req.id !== undefined) send({ jsonrpc: '2.0', id: req.id, error: { code: -32603, message: String((e && e.message) || e) } });
  }
}

rl.on('line', (line) => {
  const s = line.trim();
  if (!s) return;
  let req;
  try { req = JSON.parse(s); } catch (e) { log('bad json:', s.slice(0, 120)); return; }
  handleRequest(req);
});

rl.on('close', () => { log('stdin closed, exiting'); process.exit(0); });
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

log('rofilter MCP stdio bridge →', DEFAULT_ENDPOINT, '(token:', TOKEN.slice(0, 12) + '…)');
