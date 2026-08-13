# vuepress-music-player SSR 构建失败

## 问题现象

VuePress 2 执行 `vuepress build`（Docker 中 `pnpm docs:build`）时，SSR 预渲染阶段报错并退出：

```
ReferenceError: window is not defined
    at file:///build/docs/.vuepress/.temp/.server/app.xxxxx.mjs:1:238570
```

## 复现条件

1. VuePress 2 + SSR 预渲染（默认 build 流程）
2. 启用 `vuepress-music-player`，且 `autoplay: true`（插件全局配置或页面 frontmatter 均可）
3. 插件通过 `rootComponents` 注册 `MusicPlayer`，组件在服务端也会执行 setup

页面 frontmatter 示例（页面级 autoplay 同样会触发）：

```yaml
music:
  autoplay: true
  list:
    - title: 示例
      link: /music/example.mp3
```

## 根因分析

`MusicPlayer.vue` 作为根组件在 **SSR 阶段也会挂载**。组件内有一个 `immediate: true` 的 `watch`：

```typescript
watch(
  () => ({ routePath, pagePath, musicPlayer, music }),
  () => { syncPlaylistWithRoute() },
  { deep: true, immediate: true }  // SSR 时立即执行
)
```

调用链如下：

```
watch (immediate)
  → syncPlaylistWithRoute()
    → applyPlaylist(true)
      → requestPlay()          // autoplay 为 true 时
        → schedulePlay()
          → window.setTimeout()  // Node 环境无 window
```

`mounted` 里虽有 `typeof window` 判断，但 **`watch` 的 immediate 回调在 setup 阶段就会跑**，早于 `onMounted`，因此 SSR 守卫拦不住。

bundle 中约 238570 字符处对应 `schedulePlay` 里的 `window.setTimeout(() => schedulePlay(attempt + 1), 50)`。

## 修复方案

在访问浏览器 API 的函数入口加 SSR 守卫即可，无需 `ClientOnly` 包装。

修改文件：`src/client/MusicPlayer.vue`（发布产物为 `dist/client/MusicPlayer.vue`）

### 1. `schedulePlay`

```typescript
function schedulePlay(attempt = 0) {
  if (typeof window === 'undefined') return  // 新增
  if (!pendingPlay.value) return
  // ...
}
```

### 2. `insertIntoNavbar`

```typescript
function insertIntoNavbar() {
  if (typeof window === 'undefined') return  // 新增
  if (!navbarConfig.insertIntoNav) return
  // ...
}
```

### 3. `scheduleNavbarInsert`

```typescript
function scheduleNavbarInsert(attempt = 0) {
  if (typeof window === 'undefined') return  // 新增
  insertIntoNavbar()
  // ...
}
```

## 修复后行为

| 阶段 | 行为 |
|------|------|
| SSR | 上述函数提前 return，不访问 `window` / `document` |
| 浏览器 | `onMounted` 正常调用 `scheduleNavbarInsert()`、`requestPlay()`，autoplay 不受影响 |

## 验证方式

```bash
vuepress build docs
```

构建应完整通过，且浏览器端 autoplay、导航栏插入功能正常。

## 建议版本

建议发 patch 版本（如 `1.0.2`），changelog 可写：

> fix: guard browser APIs during SSR to prevent build failure when autoplay is enabled

## 本仓库临时方案

在插件发版前，本仓库可通过 `patches/vuepress-music-player@1.0.1.patch` 临时应用上述修改。插件发版后，升级依赖并移除 patch 即可。
