# Instagram 图片下载助手

轻量 Chrome / Edge 电脑版扩展。支持悬停下载、右键下载、页面最大尺寸优先，以及每次选择保存位置。

下载方式：点击仓库页面的 **Code → Download ZIP**，解压后按下面步骤安装。

用户已反馈当前版本可使用。

## v1.0

## 安装（Chrome 电脑版 / Edge 电脑版）
1. 解压整个 ZIP 到一个固定文件夹。不要删除或移动这个文件夹，否则插件下次可能失效。
2. Chrome 地址栏输入 `chrome://extensions` 并回车（Edge 用 `edge://extensions`）。
3. 打开右上角「开发者模式」。
4. 点击「加载已解压的扩展程序」。选择包含 manifest.json 的 instagram-image-downloader 文件夹，不要选 ZIP 文件或 icons 子文件夹。
5. 打开或刷新 Instagram 网页。可在浏览器右上角的拼图菜单中固定插件。

## 下载
- 鼠标移到已加载的帖子图片上，点击「↓ 下载图片」。页面上的遮罩通常也能识别。
- 如果按钮没出现：打开帖子详情，等大图加载，再试；或右键图片选择下载。
- 轮播帖手动切换后逐张下载。本版没有「下载整组」和视频下载。
- 默认保存到浏览器默认下载目录下的 Instagram 文件夹。Chrome 本身开启「下载前询问保存位置」时，仍可能弹出选择窗口。
- 插件弹窗可设置悬停按钮、优先最大尺寸、命名和每次选择保存位置。
- 优先最大尺寸只使用 img.srcset 当前已公开给页面的资源地址。不会修改签名链接，也不能保证拿到上传前原文件。主页缩略图请点开帖子后再下载。
- 文件名中的时间是保存时的 UTC 时间；用户名能从帖子链接识别时使用，否则用 instagram。序号来自页面图片顺序，不保证等于轮播页码。重名自动添加后缀。
- 右键下载使用点击的图片资源地址，命名信息可能使用默认值。头像、视频封面等也可能被识别，下载前确认目标图片。

## 故障排查
- 安装或更新插件后必须刷新已打开的 Instagram 页面。
- 悬停按钮关闭后仍可右键下载。按钮太靠近屏幕边缘时会向内移动。
- 下载是否完成以 Chrome 下载列表（Ctrl+J，Mac 可从菜单打开）为准，弹窗会显示最近状态。
- 提示 NETWORK_FAILED / SERVER_FORBIDDEN：刷新帖子后重试；确认浏览器仍能正常打开该图片，网络可访问 Instagram。
- 若下载成了非图片文件或图片不匹配，请删除该文件，并在帖子详情重新选择图片。
- 本包针对 Chrome Manifest V3；未在你的登录账号和当前 Instagram 实站页面验证。Instagram 页面结构变化可能需要适配。

## 权限与数据
仅使用 downloads（保存文件）、storage（本机设置及临时下载状态）、contextMenus（右键菜单），内容脚本只在 Instagram 网页运行。没有统计服务、账号密码输入、远程代码或批量爬取。图片请求直接发送到 Instagram/Meta 的图片服务器，不经过第三方下载网站。下载记录仍由浏览器管理。

## 验证范围
打包前检查了 JavaScript 语法、清晰度地址排序、文件名安全处理、地址域名限制，以及模拟 Chrome 消息/下载的流程。未完成真实 Instagram 登录页面端到端验证。

官方参考：
- https://developer.chrome.com/docs/extensions/reference/api/downloads
- https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts
- https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked
