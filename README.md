# 我的力量日志

现有站点：https://wangrunnan0608-beep.github.io/Training-Log/

手机主屏幕 App 与 Safari 分别保存数据和 AI 设置。在常用入口设置 Worker 地址和访问口令，勾选“在本机记住访问口令”后保存。访问口令属于敏感凭据，保存在网页本地存储中；不要填写 DeepSeek API Key。

升级前导出 JSON；升级后关闭并重新打开应用，必要时刷新一次。不要清除网站数据。遇到相同 ID 内容冲突时导入会停止，原有记录保留。

## 本地验证

运行 `node --check app.js`、`node tests/settings.test.cjs`、`node tests/import.test.cjs`。浏览器测试的运行依赖由本机 Codex 提供，当前脚本使用 Windows Edge。旧备份测试：`node tests/legacy.test.cjs <本地交接包路径>`；训练记录只在内存中读取。

## 发布

GitHub main 根目录发布 Pages。Worker 源码为 worker/worker.mjs，仅部署到 training-log-ai。当前通过已授权 Cloudflare API 部署，保留全部现有绑定和 Secrets；部署不需要读取密钥值。

2026-11-03：移除放弃草稿、共享备份入口；加入本机记住口令、导入冲突保护、历史编辑字段保留与原草稿恢复、悬垂明确字段、疼痛文字保守拦截、55秒请求超时。Worker 新增 elapsedMs 供定位耗时。

限制：疼痛拦截基于文字，可能误判；结构化逐组建议、完整图表回归和真实 iPhone 验收仍待完成。未使用真实口令进行模型计费调用，未测得真实 AI 延迟。
