// 自动填充和转换函数
function autoFillAndConvert(title, content, selectors, useIframe) {
  const fillInterval = setInterval(() => {
    const titleInput = document.querySelector(selectors.title);
    const editor = document.querySelector(selectors.editor);
    
    if (!titleInput || !editor) {
      return;
    }
    
    clearInterval(fillInterval);
    
    // 填充标题
    titleInput.value = title;
    titleInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    // 填充内容
    let targetElement;
    if (useIframe) {
      if (window.location.hostname.includes('csdn')) {
        const iframeDoc = editor.contentDocument || editor.contentWindow.document;
        if (!iframeDoc.body) {
          clearInterval(fillInterval);
          setTimeout(() => autoFillAndConvert(title, content, selectors, useIframe), 1000);
          return;
        }
        targetElement = iframeDoc.body;
      } else {
        targetElement = editor.contentDocument.body;
      }
    } else {
      targetElement = editor;
    }
    
    if (useIframe) {
      targetElement.innerHTML = content;
      targetElement.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      targetElement.focus();
      document.execCommand('paste');
      const pasteEvent = new KeyboardEvent('keydown', {
        key: 'v',
        code: 'KeyV',
        ctrlKey: true,
        metaKey: true,
        bubbles: true
      });
      targetElement.dispatchEvent(pasteEvent);
    }
  }, 1000);
}

// 平台配置
const platforms = {
  weixin: {
    url: 'https://mp.weixin.qq.com',
    selectors: {
      title: '#title',
      editor: '.ProseMirror[contenteditable="true"]'
    },
    useIframe: false,
    customHandler: function(data) {
      return chrome.tabs.create({ url: 'https://mp.weixin.qq.com', active: true }, (tab) => {
        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
          if (tabId === tab.id && changeInfo.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(listener);
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              function: () => {
                const tokenMatch = window.location.href.match(/[?&]token=([^&]+)/);
                return tokenMatch ? tokenMatch[1] : null;
              }
            }, (results) => {
              const token = results?.[0]?.result;
              if (!token) return;
              
              const editUrl = `https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit_v2&action=edit&isNew=1&type=77&token=${token}&lang=zh_CN&timestamp=${Date.now()}`;
              chrome.tabs.update(tab.id, { url: editUrl }, (updatedTab) => {
                chrome.tabs.onUpdated.addListener(function editListener(tabId, changeInfo) {
                  if (tabId === updatedTab.id && changeInfo.status === 'complete') {
                    chrome.tabs.onUpdated.removeListener(editListener);
                    chrome.scripting.executeScript({
                      target: { tabId: updatedTab.id },
                      function: autoFillAndConvert,
                      args: [data.content, data.title, platforms.weixin.selectors, platforms.weixin.useIframe]
                    });
                  }
                });
              });
            });
          }
        });
      });
    }
  },
  zhihu: {
    url: 'https://zhuanlan.zhihu.com/write',
    selectors: {
      title: '.WriteIndex-titleInput textarea',
      editor: 'div.public-DraftEditor-content[contenteditable="true"]'
    },
    useIframe: false
  },
  cpjl: {
    url: 'https://www.woshipm.com/writing',
    selectors: {
      title: '#post_title',
      editor: '#post_content_ifr'
    },
    useIframe: true
  },
  juejin: {
    url: 'https://juejin.cn/editor/drafts/new?v=2',
    selectors: {
      title: '.title-input',
      editor: '.CodeMirror textarea'
    },
    useIframe: false
  },
  csdn: {
    url: 'https://mp.csdn.net/mp_blog/creation/editor',
    selectors: {
      title: '#txtTitle',
      editor: '.cke_wysiwyg_frame'
    },
    useIframe: true
  },
  zsxq: {
    url: 'https://wx.zsxq.com/article',
    selectors: {
      title: '.title-container input[placeholder="请在这里输入标题"]',
      editor: '.milkdown .ProseMirror'
    },
    useIframe: false,
    customHandler: function(data) {
      return chrome.tabs.create({ url: platforms.zsxq.url, active: true }, (tab) => {
        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
          if (tabId === tab.id && changeInfo.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(listener);
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              function: (content, title, selectors) => {
                const switchInterval = setInterval(() => {
                  const richTextToggle = document.querySelector('div.toggle-mode.richText');
                  if (!richTextToggle) return;
                  
                  clearInterval(switchInterval);
                  richTextToggle.click();
                  
                  const confirmInterval = setInterval(() => {
                    const confirmBtn = document.querySelector('.dialog-container .confirm');
                    if (confirmBtn) {
                      clearInterval(confirmInterval);
                      confirmBtn.click();
                      
                      setTimeout(() => {
                        const titleInput = document.querySelector(selectors.title);
                        const editor = document.querySelector(selectors.editor);
                        
                        if (!titleInput || !editor) return;
                        
                        titleInput.value = title;
                        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
                        
                        editor.focus();
                        document.execCommand('paste');
                        const pasteEvent = new KeyboardEvent('keydown', {
                          key: 'v',
                          code: 'KeyV',
                          ctrlKey: true,
                          metaKey: true,
                          bubbles: true
                        });
                        editor.dispatchEvent(pasteEvent);
                      }, 1000);
                    }
                  }, 500);
                }, 500);
              },
              args: [data.content, data.title, platforms.zsxq.selectors]
            });
          }
        });
      });
    }
  }
};

// 获取当前页面URL并自动转换
async function getCurrentUrlAndAutoConvert() {
  try {
    // 获取当前活跃标签页
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url) {
      console.log('无法获取当前页面URL');
      return;
    }
    
    const currentUrl = tab.url;
    console.log('当前页面URL:', currentUrl);
    
    // 检查是否是支持的文档链接
    const isSupportedUrl = 
      currentUrl.includes('feishu.cn') || 
      currentUrl.includes('notion.so') ||
      currentUrl.includes('yuque.com') ||
      currentUrl.includes('docs.google.com');
    
    // 创建插件页面并传递URL
    chrome.tabs.create({ 
      url: `index.html${isSupportedUrl ? `?autoUrl=${encodeURIComponent(currentUrl)}` : ''}` 
    });
    
  } catch (error) {
    console.error('获取当前URL失败:', error);
    // 如果获取失败，直接打开插件页面
    chrome.tabs.create({ url: 'index.html' });
  }
}

// 处理平台跳转
function handlePlatformRedirect(data, platform) {
  const { url, selectors, useIframe, customHandler } = platform;
  
  if (customHandler) {
    customHandler(data);
  } else {
    chrome.tabs.create({ url, active: true }, (tab) => {
      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: autoFillAndConvert,
            args: [data.content, data.title, selectors, useIframe]
          });
        }
      });
    });
  }
}

// 监听插件图标点击 - 实现一键自动转换
chrome.action.onClicked.addListener(() => {
  getCurrentUrlAndAutoConvert();
});

// 监听来自插件页面的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const platformKey = message.action.replace('open', '').replace('Editor', '').toLowerCase();
  const platform = platforms[platformKey];
  
  if (platform) {
    handlePlatformRedirect(message, platform);
  }
});