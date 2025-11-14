# FlowPhotos

现代化的照片展示应用，具备智能的图像处理和EXIF信息提取功能。

## 功能特性

### 📸 智能图像处理
- **自动尺寸检测**：无需指定图片尺寸，系统自动识别
- **自适应瀑布流**：根据屏幕宽度智能调整列数（1-5列）
- **最短列算法**：确保布局平衡美观

### 🔍 专业EXIF工具
- **实时提取**：从图片文件自动提取完整EXIF数据
- **多格式支持**：JPG、PNG、HEIC等常见格式
- **本地处理**：浏览器端处理，无需上传服务器
- **详细信息**：相机型号、镜头参数、拍摄参数等

### 🎯 用户体验
- **多视图模式**：网格、时间轴、相册三种浏览方式
- **高级筛选**：按相册、日期、相机型号等筛选
- **灯箱查看**：全屏浏览，带可滚动EXIF信息面板
- **响应式设计**：完美适配移动端和桌面端

## 技术栈

- **框架**：Next.js 16 + React 19
- **语言**：TypeScript
- **样式**：Tailwind CSS v4
- **EXIF处理**：exifr 7.1.3
- **图标**：Lucide Icons
- **组件库**：Radix UI

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 项目结构

```
├── app/                    # 页面路由
│   ├── page.tsx           # 主画廊页面
│   └── exif-reader/       # EXIF工具页面
├── components/            # React组件
│   ├── photo-grid.tsx     # 瀑布流网格
│   ├── photo-card.tsx     # 照片卡片
│   └── lightbox.tsx       # 灯箱查看器
├── lib/                   # 工具函数
│   ├── photo-data.ts      # 数据类型定义
│   ├── image-utils.ts     # 图片处理工具
│   └── exif-extractor.ts  # EXIF提取工具
└── hooks/                 # 自定义Hooks
    └── use-layout-settings.ts
```

## 核心功能

### 自动EXIF提取

系统自动从图片中提取以下信息：
- 相机型号和制造商
- 镜头型号和焦距
- 光圈、快门速度、ISO
- 拍摄时间、曝光模式、白平衡
- 文件尺寸和元数据

### 多种输入方式

1. **拖拽上传**：直接拖放图片到指定区域
2. **文件选择**：点击选择本地图片文件
3. **URL链接**：输入图片URL在线读取

### 智能布局

- 自适应列数调整
- 自动检测图片方向
- 移动端优化显示
- 可自定义间距和圆角

## 浏览器兼容性

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- 移动端浏览器完全支持

## 开发指南

### 添加新照片

```typescript
const photo: Photo = {
  id: 1,
  url: "/path/to/image.jpg",
  title: "照片标题",
  // 尺寸和EXIF信息可选，系统会自动检测
}
```

### 自定义布局

通过 `useLayoutSettings` Hook 可调整：
- 网格列数（1-10）
- 图片间距
- 圆角弧度

## 性能优化

- 图片懒加载
- EXIF按需提取
- 尺寸检测缓存
- 对象URL自动清理
- 无限滚动分页 

## 许可证

MIT License