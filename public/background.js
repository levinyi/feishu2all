// 创建一个通用的编辑器打开函数
function openEditor(request, editorConfig) {
  const { url, selectors, useIframe, customHandler } = editorConfig;

  // 如果有自定义处理函数，则使用自定义处理
  if (customHandler) {
    return customHandler(request);
  }

  // 默认处理逻辑
  chrome.tabs.create(
    {
      url,
      active: true,
    },
    (tab) => {
      // 2. 等待页面加载完成
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === tab.id && info.status === "complete") {
          // 移除监听器
          chrome.tabs.onUpdated.removeListener(listener);

          // 3. 注入内容到编辑器
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: injectContent,
            args: [request.content, request.title, selectors, useIframe],
          });
        }
      });
    }
  );

  return true; // 保持消息通道打开
}

// 注入内容的通用函数
function injectContent(content, title, selectors, useIframe) {
  const waitForEditor = setInterval(() => {
    const titleInput = document.querySelector(selectors.title);
    const editorElement = document.querySelector(selectors.editor);
    console.log("🚀 ~ waitForEditor ~ editorElement:", editorElement);

    if (!titleInput || !editorElement) return;

    clearInterval(waitForEditor);

    // 设置标题
    titleInput.value = title;
    titleInput.dispatchEvent(new Event("input", { bubbles: true }));

    // 获取编辑器元素
    let editor;
    if (useIframe) {
      // 特别处理CSDN的情况
      if (window.location.hostname.includes("csdn")) {
        const frameDocument =
          editorElement.contentDocument || editorElement.contentWindow.document;
        // 确保iframe内容已加载
        if (!frameDocument.body) {
          clearInterval(waitForEditor);
          // 重新尝试注入
          setTimeout(
            () => injectContent(content, title, selectors, useIframe),
            1000
          );
          return;
        }
        editor = frameDocument.body;
      } else {
        editor = editorElement.contentDocument.body;
      }
    } else {
      editor = editorElement;
    }

    // 根据不同编辑器类型设置内容
    if (useIframe) {
      editor.innerHTML = content;
      editor.dispatchEvent(new Event("input", { bubbles: true }));
    } else {
      editor.focus();
      // 模拟 Ctrl+V / Command+V
      document.execCommand("paste");
      // 模拟键盘事件
      const pasteEvent = new KeyboardEvent("keydown", {
        key: "v",
        code: "KeyV",
        ctrlKey: true,
        metaKey: true,
        bubbles: true,
      });
      editor.dispatchEvent(pasteEvent);
    }
  }, 1000);
}

// 微信公众号的自定义处理函数
function handleWeixinEditor(request) {
  // 1. 先打开公众号首页
  chrome.tabs.create(
    {
      url: "https://mp.weixin.qq.com",
      active: true,
    },
    (tab) => {
      // 2. 等待页面加载完成
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === tab.id && info.status === "complete") {
          // 移除监听器
          chrome.tabs.onUpdated.removeListener(listener);

          // 3. 从当前页面 URL 获取 token
          chrome.scripting.executeScript(
            {
              target: { tabId: tab.id },
              function: () => {
                const tokenMatch =
                  window.location.href.match(/[?&]token=([^&]+)/);
                return tokenMatch ? tokenMatch[1] : null;
              },
            },
            (results) => {
              const token = results?.[0]?.result;

              if (!token) {
                console.error("未能获取到 token");
                return;
              }

              // 4. 构建并打开编辑页面
              const timestamp = Date.now();
              const editorUrl = `https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit_v2&action=edit&isNew=1&type=77&token=${token}&lang=zh_CN&timestamp=${timestamp}`;

              // 5. 更新当前标签页为编辑页面
              chrome.tabs.update(tab.id, { url: editorUrl }, (updatedTab) => {
                // 6. 等待编辑页面加载完成后注入内容
                chrome.tabs.onUpdated.addListener(function contentListener(
                  contentTabId,
                  contentInfo
                ) {
                  if (
                    contentTabId === updatedTab.id &&
                    contentInfo.status === "complete"
                  ) {
                    chrome.tabs.onUpdated.removeListener(contentListener);

                    // 7. 注入内容到编辑器
                    chrome.scripting.executeScript({
                      target: { tabId: updatedTab.id },
                      function: injectContent,
                      args: [
                        request.content,
                        request.title,
                        EDITOR_CONFIGS.weixin.selectors,
                        EDITOR_CONFIGS.weixin.useIframe,
                      ],
                    });
                  }
                });
              });
            }
          );
        }
      });
    }
  );

  return true;
}

// 知识星球的自定义处理函数
function handleZsxqEditor(request) {
  chrome.tabs.create(
    {
      url: EDITOR_CONFIGS.zsxq.url,
      active: true,
    },
    (tab) => {
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === tab.id && info.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);

          // 先点击切换到 Markdown 模式按钮，然后注入内容
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: (content, title, selectors) => {
              const waitForEditor = setInterval(() => {
                const markdownToggle = document.querySelector(
                  "div.toggle-mode.richText"
                );
                if (!markdownToggle) return;

                clearInterval(waitForEditor);

                // 点击切换按钮
                markdownToggle.click();

                // 等待弹窗出现并点击确定
                const waitForDialog = setInterval(() => {
                  const confirmButton = document.querySelector(
                    ".dialog-container .confirm"
                  );
                  if (!confirmButton) return;

                  clearInterval(waitForDialog);
                  confirmButton.click();

                  // 等待切换完成后注入内容
                  setTimeout(() => {
                    const titleInput = document.querySelector(selectors.title);
                    const editor = document.querySelector(selectors.editor);
                    console.log(
                      "🚀 ~ setTimeout ~ titleInput:",
                      titleInput,
                      editor
                    );

                    if (!titleInput || !editor) return;

                    // 设置标题
                    titleInput.value = title;
                    titleInput.dispatchEvent(
                      new Event("input", { bubbles: true })
                    );

                    // 设置内容
                    editor.focus();
                    document.execCommand("paste");
                    const pasteEvent = new KeyboardEvent("keydown", {
                      key: "v",
                      code: "KeyV",
                      ctrlKey: true,
                      metaKey: true,
                      bubbles: true,
                    });
                    editor.dispatchEvent(pasteEvent);
                  }, 1000); // 等待1秒确保切换完成
                }, 500);
              }, 500);
            },
            args: [
              request.content,
              request.title,
              EDITOR_CONFIGS.zsxq.selectors,
            ],
          });
        }
      });
    }
  );

  return true;
}

// 各编辑器的配置
const EDITOR_CONFIGS = {
  weixin: {
    url: "https://mp.weixin.qq.com",
    selectors: {
      title: "#title",
      editor: '.ProseMirror[contenteditable="true"]',
    },
    useIframe: false,
    customHandler: handleWeixinEditor,
  },
  zhihu: {
    url: "https://zhuanlan.zhihu.com/write",
    selectors: {
      title: ".WriteIndex-titleInput textarea",
      editor: 'div.public-DraftEditor-content[contenteditable="true"]',
    },
    useIframe: false,
  },
  cpjl: {
    url: "https://www.woshipm.com/writing",
    selectors: {
      title: "#post_title",
      editor: "#post_content_ifr",
    },
    useIframe: true,
  },
  juejin: {
    url: "https://juejin.cn/editor/drafts/new?v=2",
    selectors: {
      title: ".title-input",
      editor: ".CodeMirror textarea",
    },
    useIframe: false,
  },
  csdn: {
    url: "https://mp.csdn.net/mp_blog/creation/editor",
    selectors: {
      title: "#txtTitle",
      editor: ".cke_wysiwyg_frame",
    },
    useIframe: true,
  },
  zsxq: {
    url: "https://wx.zsxq.com/article",
    selectors: {
      title: '.title-container input[placeholder="请在这里输入标题"]',
      editor: ".milkdown .ProseMirror",
    },
    useIframe: false,
    customHandler: handleZsxqEditor,
  },
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

// 处理插件图标点击 - 实现一键自动转换
chrome.action.onClicked.addListener(() => {
  getCurrentUrlAndAutoConvert();
});

// 监听来自前端的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const platform = request.action
    .replace("open", "")
    .replace("Editor", "")
    .toLowerCase();
  const config = EDITOR_CONFIGS[platform];
  if (config) {
    openEditor(request, config);
  }
});
