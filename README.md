# FlowPhotos - 自适应照片画廊

一个现代化的摄影作品展示应用，支持自动识别图片尺寸和EXIF信息。

## 核心特性

### 🔄 自动识别功能

#### 1. 自适应瀑布流布局
- **自动检测图片尺寸**：无需手动指定width和height
- **智能列数调整**：根据屏幕宽度自动调整列数（1-5列）
- **最短列算法**：确保瀑布流布局平衡美观

#### 2. EXIF信息自动提取
- **实时提取**：从图片文件中自动提取完整EXIF数据
- **相机参数**：相机型号、镜头、焦距、光圈、快门速度、ISO等
- **拍摄信息**：拍摄时间、闪光灯、曝光模式、白平衡
- **维度自动检测**：图片宽度、高度、宽高比
- **无需预配置**：所有EXIF信息均从图片文件动态提取

#### 3. EXIF读取器 (NEW)
- **独立工具页面**：专门的EXIF信息读取工具
- **多种输入方式**：拖拽上传、点击选择、输入URL链接
- **本地处理**：所有数据在浏览器本地处理，无需上传
- **完整信息展示**：相机、镜头、拍摄参数、文件元数据

### 📱 功能模块

- **多视图模式**：瀑布流、时间轴、相册
- **图片灯箱**：全屏查看，顶部对齐的可滚动EXIF面板
- **无限滚动**：自动加载更多照片
- **筛选排序**：按相册、日期
- **响应式设计**：完美支持移动端和桌面端
- **布局自定义**：可调整列数、间距、圆角弧度

## 如何测试EXIF自动识别

### 使用EXIF读取器工具 ✨

1. 点击顶部导航栏的**"EXIF读取"**按钮
2. 选择输入方式：
   - 拖拽照片到虚线框内
   - 点击"选择照片"按钮上传
   - 在输入框中粘贴图片URL
3. 系统会自动提取并显示：
   - 照片尺寸（宽×高）和文件大小
   - 完整的EXIF信息（相机、镜头、参数等）
   - 拍摄日期和位置信息（如有）

### 准备测试照片

建议使用以下类型的摄影作品测试：
- 📷 单反/微单相机拍摄的照片（包含完整EXIF）
- 📱 智能手机拍摄的照片（包含基本EXIF）
- 🔄 编辑过的照片（可能保留部分EXIF）

### EXIF信息显示位置

- **EXIF读取器页面**：完整的EXIF信息展示工具
- **灯箱面板**：查看照片时显示完整EXIF信息
  - 顶部对齐，支持滚动
  - 包含相机型号、镜头、光圈、快门、ISO等详细参数

## 技术实现

### 自动尺寸检测

```typescript
// lib/image-utils.ts
export async function detectImageDimensions(url: string): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
    }
    img.src = url
  })
}
```

### EXIF提取（使用exifr库）

```typescript
// lib/exif-extractor.ts
export async function extractExifData(file: File): Promise<Partial<ExifData>> {
  // 使用exifr库动态提取：
  // - 相机型号和制造商
  // - 镜头型号
  // - 焦距、光圈、快门速度、ISO
  // - 拍摄时间
  // - 闪光灯、曝光模式、白平衡等
}
```

## 项目结构

```
├── app/
│   ├── page.tsx              # 主页面
│   └── exif-reader/
│       └── page.tsx          # EXIF读取器页面
├── components/
│   ├── photo-grid.tsx        # 自适应瀑布流网格
│   ├── photo-card.tsx        # 照片卡片（点击打开灯箱）
│   └── lightbox.tsx          # 灯箱查看器（顶部对齐可滚动EXIF面板）
├── lib/
│   ├── photo-data.ts         # 照片数据类型（无硬编码EXIF）
│   ├── image-utils.ts        # 图片尺寸检测工具
│   └── exif-extractor.ts     # EXIF提取工具（exifr集成）
└── hooks/
    └── use-image-upload.ts   # 图片上传Hook
```

## 开发指南

### 添加新照片

照片的 `width`、`height` 和 `exif` 现在都是**可选的**，系统会自动检测和提取：

```typescript
const newPhoto: Photo = {
  id: 1,
  url: "/my-photo.jpg",
  title: "我的照片",
  // width 和 height 可省略，将自动检测
  // exif 数据会在查看时从图片文件自动提取
}
```

### EXIF面板交互

灯箱中的EXIF信息面板：
- 顶部对齐，避免信息被遮挡
- 支持垂直滚动查看所有内容
- 移动端优化的固定标题栏
- 不显示重复信息（尺寸已在状态栏显示）

## 技术栈

- **Next.js 16** - React框架
- **TypeScript** - 类型安全
- **Tailwind CSS v4** - 样式系统
- **Lucide Icons** - 图标库
- **exifr 7.1.3** - 专业的EXIF数据提取库
- **自动化工具** - 图片处理和尺寸检测

## 性能优化

- 🚀 懒加载：图片进入视口才加载
- 📱 响应式图片：根据视口大小加载合适尺寸
- 🔄 无限滚动：分页加载，避免一次性加载过多
- 💾 缓存优化：浏览器缓存已检测的尺寸
- ⚡ 并行处理：批量检测图片尺寸
- 🔍 按需提取：EXIF数据仅在查看时提取
- 🧹 对象URL管理：上传后自动清理内存

## 浏览器兼容性

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- 移动端浏览器完全支持

## 常见问题

**Q: 为什么示例照片没EXIF信息？**
A: 示例照片是生成的占位图，不包含真实的EXIF数据。请访问"EXIF读取"页面上传你自己的照片来测试EXIF自动识别功能。

**Q: 支持哪些图片格式？**
A: 支持所有常见图片格式（JPG/JPEG、PNG、WebP等），EXIF信息通常存在于JPEG格式的照片中。

**Q: EXIF信息被遮挡怎么办？**
A: EXIF面板已优化为顶部对齐并支持滚动，确保所有信息都可以查看。在移动端和桌面端都有良好的显示效果。

**Q: 图片URL识别有限制吗？**
A: 图片URL需要支持CORS跨域访问。对于有域名限制的图片，建议下载后通过本地上传方式使用。