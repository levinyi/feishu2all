/**
 * URL检测和处理工具
 */

// 支持的文档平台配置
export const SUPPORTED_PLATFORMS = {
  feishu: {
    name: '飞书文档',
    patterns: [
      /https?:\/\/[^.]+\.feishu\.cn\/wiki\/[^?]+/,
      /https?:\/\/[^.]+\.feishu\.cn\/docx\/[^?]+/,
      /https?:\/\/[^.]+\.feishu\.cn\/docs\/[^?]+/,
      /https?:\/\/[^.]+\.feishu\.cn\/base\/[^?]+/
    ],
    icon: '📄'
  },
  notion: {
    name: 'Notion',
    patterns: [
      /https?:\/\/[^.]+\.notion\.so\/[^?]+/,
      /https?:\/\/notion\.so\/[^?]+/
    ],
    icon: '📝'
  },
  yuque: {
    name: '语雀',
    patterns: [
      /https?:\/\/[^.]+\.yuque\.com\/[^?]+/
    ],
    icon: '📚'
  },
  googledocs: {
    name: 'Google Docs',
    patterns: [
      /https?:\/\/docs\.google\.com\/document\/[^?]+/
    ],
    icon: '📄'
  }
};

/**
 * 检测URL是否为支持的文档链接
 * @param {string} url - 要检测的URL
 * @returns {Object|null} 返回匹配的平台信息或null
 */
export function detectDocumentPlatform(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  for (const [key, platform] of Object.entries(SUPPORTED_PLATFORMS)) {
    for (const pattern of platform.patterns) {
      if (pattern.test(url)) {
        return {
          platform: key,
          name: platform.name,
          icon: platform.icon,
          url: url
        };
      }
    }
  }

  return null;
}

/**
 * 清理和标准化URL
 * @param {string} url - 原始URL
 * @returns {string} 清理后的URL
 */
export function cleanUrl(url) {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    
    // 移除一些常见的跟踪参数
    const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'from_copylink', 'from'];
    
    paramsToRemove.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    
    return urlObj.toString();
  } catch (error) {
    // 如果URL格式不正确，返回原始URL
    return url;
  }
}

/**
 * 验证URL格式
 * @param {string} url - 要验证的URL
 * @returns {boolean} URL是否有效
 */
export function isValidUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 从URL中提取文档标题（如果可能）
 * @param {string} url - 文档URL
 * @returns {string|null} 提取的标题或null
 */
export function extractTitleFromUrl(url) {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // 飞书文档标题提取
    if (url.includes('feishu.cn')) {
      // 从路径中提取可能的标题部分
      const pathParts = pathname.split('/');
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && lastPart.length > 10) {
        return decodeURIComponent(lastPart);
      }
    }
    
    // Notion标题提取
    if (url.includes('notion.so')) {
      const pathParts = pathname.split('/');
      const titlePart = pathParts.find(part => part.includes('-') && part.length > 10);
      if (titlePart) {
        return titlePart.split('-').slice(0, -1).join('-').replace(/-/g, ' ');
      }
    }
    
    return null;
  } catch {
    return null;
  }
}