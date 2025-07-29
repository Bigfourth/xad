/**
 * Khởi tạo cấu hình toàn cục cho thư viện Xad.
 * @param {Object|string} config - Object cấu hình hoặc URL tới file JSON.
 * @param {string} [config.adUnit] - Đơn vị quảng cáo mặc định cho AdX.
 * @param {string} [config.adClient] - ID client AdSense mặc định.
 * @param {string} [config.adSlot] - ID slot AdSense mặc định.
 * @param {Array<number>} [config.adSize] - Kích thước quảng cáo mặc định.
 * @example
 * // Cấu hình trực tiếp
 * init({
 *   adUnit: '/123456/adunit',
 *   adClient: 'ca-pub-123456789',
 *   adSlot: '1234567890',
 *   adSize: [300, 250]
 * });
 * // Hoặc từ file JSON
 * init('config.json');
 */
export async function init(config) {
  if (typeof config === 'string') {
    try {
      const response = await fetch(config);
      window.XadConfig = await response.json();
    } catch (error) {
      console.warn('Xad: Failed to load config from JSON', error);
    }
  } else {
    window.XadConfig = config || {};
  }
}

/**
 * Kiểm tra và tải script GPT.js nếu chưa tồn tại.
 * @returns {boolean} - True nếu script đã tồn tại, False nếu tải mới.
 */
export function checkGPTExists() {
  const scripts = document.head.querySelectorAll('script[src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"]');
  if (scripts.length > 0) {
    return true;
  } else {
    const gpt_script = document.createElement("script");
    gpt_script.src = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";
    gpt_script.async = true;
    document.head.appendChild(gpt_script);
    return false;
  }
}

/**
 * Tạo ID ngẫu nhiên cho slot quảng cáo.
 * @returns {string} - ID duy nhất dạng 'xad-gpt-ad-xxx-0'.
 */
export const ar = [];
export function randomID() {
  let r = Math.random().toString().substring(2);
  while (ar.includes(r)) {
    r = Math.random().toString().substring(2);
  }
  ar.push(r);
  return "xad-gpt-ad-" + r + "-0";
}

/**
 * Kiểm tra và tải script AdSense nếu chưa tồn tại.
 * @param {string} client_id - ID client AdSense.
 * @returns {boolean} - True nếu script đã tồn tại, False nếu tải mới.
 */
export function checkAdsenseJSExists(client_id) {
  const scripts = document.head.querySelectorAll(`script[src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client_id}"]`);
  if (scripts.length > 0) {
    return true;
  } else {
    const adsense_script = document.createElement("script");
    adsense_script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client_id}`;
    adsense_script.async = true;
    adsense_script.crossOrigin = "anonymous";
    document.head.appendChild(adsense_script);
    return false;
  }
}
