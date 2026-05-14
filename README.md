# 汤晨露 — 个人作品集网站

插画师个人作品集，温润手作感设计风格。

## 技术栈

- **HTML5** — 语义化结构
- **CSS3** — CSS 变量、Grid/Flexbox、有机动画
- **JavaScript (Vanilla)** — GSAP 动画、自定义光标、灯箱画廊
- **CDN** — GSAP 3.12

## 项目结构

```
├── index.html       # 首页（Hero + 精选作品）
├── about.html       # 关于（个人介绍 + 创作技法 + 经历）
├── works.html       # 作品集（分类筛选 + 作品卡片 + 灯箱）
├── contact.html     # 联系（表单 + 联系方式 + 社媒链接）
├── css/
│   └── style.css    # 全局样式表
├── js/
│   └── main.js      # 交互动效脚本
├── images/          # 图片资源目录
└── README.md
```

## 设计特点

- 暖色系配色 + 纸质肌理
- Ma Shan Zheng 书法字体作为展示字体
- Noto Serif SC / Noto Sans SC 正文
- 有机游动色块背景（CSS 动画）
- 自定义跟随光标
- GSAP 流畅页面转场
- 滚动触发淡入动画
- 作品灯箱预览
- 全响应式适配

## 本地预览

直接在浏览器中打开 `index.html`，或使用任意静态服务器：

```bash
npx serve .
```

## 自定义

1. 替换 `images/` 中的占位图片为真实作品照片
2. 更新各页面中的个人信息
3. 修改 `works.html` 中的作品内容
4. 调整 `css/style.css` 中的 CSS 变量以更改主题色
