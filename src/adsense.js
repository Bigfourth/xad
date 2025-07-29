/**
 * Hiển thị quảng cáo banner AdSense.
 * @param {string} _adClient - ID client AdSense (e.g., 'ca-pub-123456789'). Mặc định lấy từ XadConfig.adClient.
 * @param {string} _adSlot - ID slot quảng cáo. Mặc định lấy từ XadConfig.adSlot.
 * @param {Array<number>} [_adSize=[]] - Kích thước quảng cáo (e.g., [300, 250]). Mặc định lấy từ XadConfig.adSize.
 * @param {number} [_responsive=0] - Kích hoạt responsive ads (1=bật, 0=tắt).
 * @param {string} _element - CSS selector của phần tử để chèn.
 * @param {number} [_insertPosition=0] - Vị trí chèn: 0=beforeend, 1=afterbegin, 2=beforebegin, 3=afterend.
 * @example
 * XadAdsense('ca-pub-123456789', '1234567890', [300, 250], 0, '#ad-container');
 */
export function XadAdsense(_adClient, _adSlot, _adSize = [], _responsive = 0, _element, _insertPosition = 0) {
  const config = window.XadConfig || {};
  _adClient = _adClient || config.adClient;
  _adSlot = _adSlot || config.adSlot;
  _adSize = _adSize || config.adSize || [300, 250];

  const element = document.body.querySelector(_element);
  if (!element) return;

  checkAdsenseJSExists(_adClient);

  const ad_width = _adSize[0];
  const ad_height = _adSize[1];

  let html;
  if (_responsive == 0) {
    html = `
      <div class="xad-banner-ad">
        <center>
          <ins class="adsbygoogle"
            style="display:inline-block;width:${ad_width}px;height:${ad_height}px"
            data-ad-client="${_adClient}"
            data-ad-slot="${_adSlot}"
          ></ins>
        </center>
      </div>
    `;
  } else {
    html = `
      <div class="xad-banner-ad">
        <center>
          <ins class="adsbygoogle"
            style="display:block"
            data-ad-client="${_adClient}"
            data-ad-slot="${_adSlot}"
            data-ad-format="auto"
            data-full-width-responsive="true">
          </ins>
        </center>
      </div>
    `;
  }

  if (_insertPosition == 1) element.insertAdjacentHTML("afterbegin", html);
  else if (_insertPosition == 2) element.insertAdjacentHTML("beforebegin", html);
  else if (_insertPosition == 3) element.insertAdjacentHTML("afterend", html);
  else element.insertAdjacentHTML("beforeend", html);

  (adsbygoogle = window.adsbygoogle || []).push({});
}

/**
 * Hiển thị quảng cáo in-page AdSense cho mobile.
 * @param {string} _adClient - ID client AdSense. Mặc định lấy từ XadConfig.adClient.
 * @param {string} _adSlot - ID slot quảng cáo. Mặc định lấy từ XadConfig.adSlot.
 * @param {string} _element - CSS selector của phần tử cha.
 * @param {number} [_marginTop=-1] - Khoảng cách từ đỉnh (px). Nếu -1, tự tính giữa màn hình.
 * @example
 * XadAdsenseInPage('ca-pub-123456789', '1234567890', '#content');
 */
export function XadAdsenseInPage(_adClient, _adSlot, _element, _marginTop = -1) {
  if (window.innerWidth >= 768) return;

  const config = window.XadConfig || {};
  _adClient = _adClient || config.adClient;
  _adSlot = _adSlot || config.adSlot;

  const ad_width = 300;
  const ad_height = 600;

  checkAdsenseJSExists(_adClient);

  const midpoint = Math.min(Math.floor(document.querySelectorAll(_element).length / 2), 4);
  document.querySelectorAll(_element)[midpoint - 1].insertAdjacentHTML("afterend", "<div id='xad-inpage-ad'></div>");

  const html = `
    <div id="inpage-content-ad" style="overflow: hidden; position: relative; z-index: 2; width: 100%;">
      <div id="inpage-ad" style="display: none;">
        <ins class="adsbygoogle"
          style="display:inline-block;width:${ad_width}px;height:${ad_height}px"
          data-ad-client="${_adClient}"
          data-ad-slot="${_adSlot}">
        </ins>
      </div>
    </div>
  `;
  document.getElementById("xad-inpage-ad").insertAdjacentHTML("beforeend", html);

  (adsbygoogle = window.adsbygoogle || []).push({});

  window.addEventListener("scroll", function () {
    const inpageContentAds = document.getElementById("inpage-content-ad");
    if (!inpageContentAds) return;

    _marginTop = _marginTop >= 0 ? _marginTop : (window.innerHeight - ad_height) / 2;
    const top = inpageContentAds.getBoundingClientRect().top - _marginTop;
    const bot = top > 0 ? ad_height : ad_height + top;

    if (window.innerWidth < 768) {
      inpageContentAds.style.height = ad_height + "px";
      document.getElementById("inpage-ad").style.cssText = `
        display: block;
        clip: rect(${top}px, ${ad_width}px, ${bot}px, 0px);
        left: ${(window.innerWidth - ad_width) / 2}px;
        top: ${_marginTop}px;
        position: fixed;
        z-index: 10000;
      `;
    }
  });
}

/**
 * Hiển thị quảng cáo first-view AdSense trên mobile.
 * @param {string} _adClient - ID client AdSense. Mặc định lấy từ XadConfig.adClient.
 * @param {string} _adSlot - ID slot quảng cáo. Mặc định lấy từ XadConfig.adSlot.
 * @param {Array<number>} [_adSize=[300, 600]] - Kích thước quảng cáo. Mặc định lấy từ XadConfig.adSize.
 * @example
 * XadAdsenseFirstView('ca-pub-123456789', '1234567890');
 */
export function XadAdsenseFirstView(_adClient, _adSlot, _adSize = [300, 600]) {
  if (window.innerWidth >= 768) return;

  const config = window.XadConfig || {};
  _adClient = _adClient || config.adClient;
  _adSlot = _adSlot || config.adSlot;
  _adSize = _adSize || config.adSize || [300, 600];

  checkAdsenseJSExists(_adClient);

  const ad_width = _adSize[0];
  const ad_height = _adSize[1];

  const html = `
    <div class="xad-firstview" style="display: block; position: fixed; width: 100%; height: 100vh; top: 0px; left: 0px; text-align: center; opacity: 1; background-color: rgba(255, 255, 255, 0.7); visibility: hidden; z-index: 2147483647;">
      <div class="xad-firstview-close" style="display: none; position: absolute; width: 160px !important; height: 30px !important; top: 5% !important; right: 0px !important; cursor: pointer; background: rgba(183, 183, 183, 0.71); padding: 2px; border-radius: 20px 0px 0px 20px; z-index: 9999;">
        <span style="position: absolute; font-size: 20px; top: 50%; left: 50%; transform: translate(-50%, -50%);">Close</span>
      </div>
      <ins class="adsbygoogle"
        style="display:inline-block;width:${ad_width}px;height:${ad_height}px;position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"
        data-ad-client="${_adClient}"
        data-ad-slot="${_adSlot}">
      </ins>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", html);

  (adsbygoogle = window.adsbygoogle || []).push({});

  document.body.querySelector('.xad-firstview-close').addEventListener("click", function () {
    document.body.querySelector('.xad-firstview').style.display = "none";
  });

  let timer = 0;
  const interval = setInterval(() => {
    const ads = document.querySelector(".xad-firstview ins");
    if (ads && ads.getAttribute("data-ad-status") == "filled") {
      document.body.querySelector('.xad-firstview').style.visibility = "visible";
      document.body.querySelector('.xad-firstview-close').style.display = "block";
      clearInterval(interval);
    }

    if (++timer > 600) {
      clearInterval(interval);
    }
  }, 1000);
}
