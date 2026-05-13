# Personal Website — Lin

个人作品集网站，采用 brutalist-editorial 设计风格。

## 技术栈

- **HTML5** — 语义化结构
- **CSS3** — CSS 变量、Grid/Flexbox、动画
- **JavaScript (Vanilla)** — GSAP 动画、tsParticles 粒子效果
- **CDN 库** — GSAP 3.12、tsParticles 2.12

## 项目结构

```
personal-website/
├── index.html       # 首页（Hero + 精选作品 + 数据统计）
├── about.html       # 关于我（个人介绍 + 技能 + 职业旅程）
├── works.html       # 作品集（分类筛选 + 项目卡片网格）
├── contact.html     # 联系我（表单 + 联系方式 + 社媒链接）
├── css/
│   └── style.css    # 全局样式表
├── js/
│   └── main.js      # 交互动效脚本
├── images/          # 图片资源目录（待添加）
└── README.md
```

## 设计特点

- 暗色主题 + 电光青强调色
- 马山正书法字体作为展示字体
- ZCOOL XiaoWei / Noto Sans SC 正文
- 噪声纹理叠加层
- tsParticles 粒子背景
- GSAP 入场动画 & 页面转场
- 滚动触发淡入动画
- 全响应式适配（桌面/平板/手机）

## 本地预览

直接在浏览器中打开 `index.html`，或使用任意静态服务器：

```bash
npx serve .
```

## 自定义

1. 替换 `images/` 中的占位图片为真实照片
2. 更新各页面中的个人信息（姓名、邮箱、社交链接等）
3. 修改 `works.html` 中的项目内容
4. 调整 `css/style.css` 中的 CSS 变量以更改主题色
