# Markdown Component - Quick Reference Guide

## 📦 Installation

Already installed! The `marked` library is included in the project.

```bash
npm install marked  # Already done
```

## 🎯 Usage

### Basic Usage

```astro
---
import MarkdownContent from '../components/MarkdownContent.astro';
---

<MarkdownContent content={yourMarkdownText} />
```

### With Options

```astro
<MarkdownContent 
  content={yourMarkdownText}
  maxLength={1500}
  showToggle={true}
/>
```

## ⚙️ Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | *required* | Markdown content to render |
| `maxLength` | `number` | `1000` | Character limit before showing "Show More" |
| `showToggle` | `boolean` | `true` | Enable/disable Show More button |

## 📝 Examples

### Example 1: App Description
```astro
<MarkdownContent 
  content={app.description} 
  maxLength={1500} 
/>
```

### Example 2: Changelog
```astro
<MarkdownContent 
  content={app.changelog} 
  maxLength={1200} 
/>
```

### Example 3: Short Content (No Toggle)
```astro
<MarkdownContent 
  content={shortDescription} 
  showToggle={false}
/>
```

### Example 4: Very Long Content
```astro
<MarkdownContent 
  content={documentation} 
  maxLength={2000}
/>
```

## 🎨 Supported Markdown

### Headings
```markdown
# H1 Heading
## H2 Heading
### H3 Heading
#### H4 Heading
```

### Text Formatting
```markdown
**Bold text**
*Italic text*
`Inline code`
```

### Lists
```markdown
- Unordered item 1
- Unordered item 2
  - Nested item

1. Ordered item 1
2. Ordered item 2
```

### Links
```markdown
[Link text](https://example.com)
https://auto-link.com
```

### Code Blocks
````markdown
```javascript
const hello = "world";
```
````

### Blockquotes
```markdown
> This is a quote
> Multiple lines
```

### Horizontal Rule
```markdown
---
```

### Tables
```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
```

## 🎨 Styling

### Colors (Light Mode)
- **Text**: `rgb(55, 65, 81)` (gray-700)
- **Headings**: `rgb(17, 24, 39)` (gray-900)
- **Links**: `rgb(37, 99, 235)` (blue-600)
- **Code BG**: `rgb(243, 244, 246)` (gray-100)

### Colors (Dark Mode)
- **Text**: `rgb(209, 213, 219)` (gray-300)
- **Headings**: `rgb(243, 244, 246)` (gray-100)
- **Links**: `rgb(96, 165, 250)` (blue-400)
- **Code BG**: `rgb(55, 65, 81)` (gray-700)

## 🔧 Customization

### Modify Max Length
Change the default collapse threshold:

```astro
<MarkdownContent 
  content={content}
  maxLength={2000}  <!-- Collapse after 2000 chars -->
/>
```

### Disable Show More
For short content that doesn't need collapsing:

```astro
<MarkdownContent 
  content={content}
  showToggle={false}
/>
```

### Custom Styling
The component uses scoped CSS. To override:

```astro
<style is:global>
  .markdown-content {
    /* Your custom styles */
  }
  
  .prose-content h2 {
    color: red; /* Custom heading color */
  }
</style>
```

## 🐛 Troubleshooting

### Issue: Markdown not rendering
**Solution**: Check that content is a string, not null/undefined

```astro
{app.description && (
  <MarkdownContent content={app.description} />
)}
```

### Issue: Show More not working
**Solution**: Ensure content length > maxLength

```astro
<!-- This won't show toggle (too short) -->
<MarkdownContent content="Short text" maxLength={1000} />

<!-- This will show toggle -->
<MarkdownContent content={longText} maxLength={100} />
```

### Issue: Links not clickable
**Solution**: Links are automatically clickable. Check browser console for errors.

### Issue: Dark mode colors wrong
**Solution**: Ensure parent has `dark` class:

```html
<html class="dark">
```

## 📊 Performance Tips

### 1. Server-Side Rendering
Markdown is parsed on the server, not client:
```astro
---
// This runs on server
import MarkdownContent from '../components/MarkdownContent.astro';
---
```

### 2. Limit Content Length
For very long content, consider pagination:
```astro
<MarkdownContent 
  content={content.substring(0, 5000)}
  maxLength={2000}
/>
```

### 3. Cache Parsed Content
For frequently accessed content, consider caching.

## 🎯 Best Practices

### 1. Always Provide Fallback
```astro
<MarkdownContent 
  content={app.description || 'No description available'} 
/>
```

### 2. Use Appropriate Max Length
- **Short descriptions**: 500-800 chars
- **Medium content**: 1000-1500 chars
- **Long documentation**: 2000+ chars

### 3. Consistent Styling
Use the same maxLength across similar content types:
```astro
<!-- All descriptions -->
<MarkdownContent content={desc1} maxLength={1500} />
<MarkdownContent content={desc2} maxLength={1500} />

<!-- All changelogs -->
<MarkdownContent content={log1} maxLength={1200} />
<MarkdownContent content={log2} maxLength={1200} />
```

### 4. Accessibility
The component uses semantic HTML. Ensure:
- Proper heading hierarchy (H2 → H3 → H4)
- Descriptive link text
- Alt text for images

## 🔍 Testing

### Test Markdown Rendering
```markdown
## Test Heading

This is a **bold** and *italic* text.

- List item 1
- List item 2

[Test Link](https://example.com)

`inline code`
```

### Test Show More
```astro
<MarkdownContent 
  content={longText}  <!-- > 1000 chars -->
  maxLength={500}     <!-- Will show toggle -->
/>
```

### Test Dark Mode
Toggle dark mode in browser and verify colors.

## 📚 Resources

- **Marked Docs**: https://marked.js.org/
- **GitHub Markdown**: https://guides.github.com/features/mastering-markdown/
- **Component File**: `src/components/MarkdownContent.astro`

## 🎉 Quick Start Checklist

- [x] Install `marked` library
- [x] Create `MarkdownContent.astro` component
- [x] Import in page: `import MarkdownContent from '...'`
- [x] Use component: `<MarkdownContent content={text} />`
- [x] Test rendering
- [x] Test dark mode
- [x] Test Show More feature
- [x] Deploy to production

## 💡 Tips

1. **Preview Markdown**: Use GitHub's markdown preview before deploying
2. **Test Long Content**: Always test with real, long content
3. **Mobile Testing**: Check on mobile devices
4. **Link Testing**: Verify all links are clickable
5. **Performance**: Monitor page load times

## 🚀 Next Steps

1. ✅ Component created and working
2. ✅ Deployed to production
3. ✅ Tested on live site
4. 🎯 Optional: Add syntax highlighting
5. 🎯 Optional: Add table of contents
6. 🎯 Optional: Add copy code button

---

**Component Location**: `src/components/MarkdownContent.astro`
**Status**: ✅ Production Ready
**Last Updated**: April 29, 2026
