import { eventBus } from "@/utils/eventBus";

// 添加常量定义
export const FREE_USAGE_LIMIT = 5;
const STORAGE_KEYS = {
  USAGE_COUNT: btoa("usage_count_v1"),
  LAST_RESET_MONTH: "lastResetMonth",
  TOKEN: "token",
  USER_INFO: "userInfo",
};

export class AuthService {
  constructor() {
    this.token = null;
    this.userInfo = null;
    this.usageCount = 0;
    this.lastResetMonth = null;
  }

  async init() {
    try {
      const currentMonth = new Date().getMonth();
      const data = await chrome.storage.local.get([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.USER_INFO,
        STORAGE_KEYS.USAGE_COUNT,
        STORAGE_KEYS.LAST_RESET_MONTH,
      ]);

      if (data.lastResetMonth !== currentMonth) {
        await chrome.storage.local.set({
          [STORAGE_KEYS.USAGE_COUNT]: 0,
          [STORAGE_KEYS.LAST_RESET_MONTH]: currentMonth,
        });
        this.usageCount = 0;
        this.lastResetMonth = currentMonth;
      } else {
        this.usageCount = data[STORAGE_KEYS.USAGE_COUNT] || 0;
        console.log(
          "🚀 ~ AuthService ~ init ~ data[STORAGE_KEYS.USAGE_COUNT]:",
          data,
          data[STORAGE_KEYS.USAGE_COUNT]
        );
        this.lastResetMonth = data.lastResetMonth;
      }

      if (data.token && data.userInfo) {
        this.token = data.token;
        this.userInfo = data.userInfo;
        return true;
      }
    } catch (error) {
      console.warn("读取存储的登录状态失败:", error);
    }
    return false;
  }

  async incrementUsage() {
    if (this.userInfo?.membershipStatus === "active") {
      return true;
    }

    this.usageCount++;
    await chrome.storage.local.set({
      [STORAGE_KEYS.USAGE_COUNT]: this.usageCount,
    });
    // 触发使用次数更新事件
    eventBus.emit("usage-updated", this.usageCount);
    return this.usageCount <= FREE_USAGE_LIMIT;
  }

  async getLatestUsageCount() {
    try {
      const data = await chrome.storage.local.get([STORAGE_KEYS.USAGE_COUNT]);
      this.usageCount = data[STORAGE_KEYS.USAGE_COUNT] || 0;
      return this.usageCount;
    } catch (error) {
      console.warn("获取使用次数失败:", error);
      return this.usageCount;
    }
  }

  canUseService() {
    if (this.userInfo?.membershipStatus === "active") {
      return true;
    }
    return this.usageCount < FREE_USAGE_LIMIT;
  }

  async getUsageCount() {
    return await this.getLatestUsageCount();
  }

  async login() {
    return new Promise((resolve, reject) => {
      if (!chrome?.identity) {
        console.warn("未在 Chrome 扩展环境中运行，使用模拟登录");
        // 开发环境模拟登录代码保持不变...
        return;
      }

      // 先清除现有的token
      chrome.identity.clearAllCachedAuthTokens(() => {
        // 然后请求新的token
        chrome.identity.getAuthToken({ 
          interactive: true,
          scopes: [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
          ]
        }, async (token) => {
          if (chrome.runtime.lastError) {
            console.error('Auth error:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
            return;
          }

          this.token = token;
          try {
            const response = await fetch(
              "https://www.googleapis.com/oauth2/v2/userinfo",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            this.userInfo = await response.json();
            // userInfo的数据格式
            //   {
            //     "id": "114388284352453174541",
            //     "email": "martin.zq.sun@gmail.com",
            //     "verified_email": true,
            //     "name": "Martin sun",
            //     "given_name": "Martin",
            //     "family_name": "sun",
            //     "picture": "https://lh3.googleusercontent.com/a/ACg8ocLVxRLa_K3e80W4mFktbP0DCmrQky5FtD5A1WI9oNFVbC9LcQ=s96-c"
            // }

            // 保存登录状态到 storage
            await chrome.storage.local.set({
              token: this.token,
              userInfo: this.userInfo,
            });

            resolve(this.userInfo);
          } catch (error) {
            reject(error);
          }
        });
      });
    });
  }

  async logout() {
    if (!chrome?.identity) {
      this.token = null;
      this.userInfo = null;
      return;
    }

    return new Promise((resolve) => {
      if (!this.token) {
        resolve();
        return;
      }

      chrome.identity.removeCachedAuthToken({ token: this.token }, () => {
        this.token = null;
        this.userInfo = null;
        // 清除存储的状态
        chrome.storage.local.remove(["token", "userInfo"]);
        resolve();
      });
    });
  }

  isLoggedIn() {
    return !!this.token;
  }

  getUserInfo() {
    return this.userInfo;
  }
}

export const authService = new AuthService();
