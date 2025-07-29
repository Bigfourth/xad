/**
 * Hiển thị quảng cáo banner Google AdX.
 * @param {string} [_adUnit] - Đơn vị quảng cáo (Ad Unit) từ Google Ad Manager. Mặc định lấy từ XadConfig.adUnit.
 * @param {Array<Array<number>|number>} [_adSize] - Kích thước quảng cáo (e.g., [[300, 250], [728, 90]] hoặc [300, 250]). Mặc định lấy từ XadConfig.adSize.
 * @param {Array<{breakpoint: Array<number>, size: Array<number>|number}>} [_mapping=[]] - Size mapping cho responsive ads.
 * @param {string} _element - CSS selector của phần tử để chèn quảng cáo.
 * @param {number} [_insertPosition=0] - Vị trí chèn: 0=beforeend, 1=afterbegin, 2=beforebegin, 3=afterend.
 * @param {number} [_set_min=0] - Đặt kích thước tối thiểu (1 để bật, 0 để tắt).
 * @param {Array<string>} [_devices=['mobile', 'desktop']] - Thiết bị hiển thị: ['mobile', 'desktop'].
 * @param {Function} [onAdLoaded] - Callback khi quảng cáo tải xong.
 * @example
 * XadAdx('/123456/adunit', [[300, 250]], [], '#ad-container', 0, 0, ['mobile'], () => console.log('Ad loaded'));
 */
export function XadAdx(_adUnit, _adSize, _mapping = [], _element, _insertPosition = 0, _set_min = 0, _devices = ['mobile', 'desktop'], onAdLoaded) {
  const config = window.XadConfig || {};
  _adUnit = _adUnit || config.adUnit;
  _adSize = _adSize || config.adSize || [[300, 250]];

  if (!_adUnit || !_adSize) {
    if (config.debug) console.warn('XadAdx: Missing adUnit or adSize');
    return;
  }

  const isMobile = window.innerWidth < 768;
  if (!_devices.includes(isMobile ? 'mobile' : 'desktop')) return;

  const element = document.body.querySelector(_element);
  if (!element) {
    if (config.debug) console.warn(`XadAdx: Element ${_element} not found`);
    return;
  }

  checkGPTExists();

  const gpt_id = randomID();

  let style_min = "";
  if (_set_min != 0) {
    let min_width = 0;
    let min_height = 0;
    if (!Array.isArray(_adSize[0]) && !Array.isArray(_adSize[1])) {
      min_width = _adSize[0];
      min_height = _adSize[1];
    } else {
      for (let i = 0; i < _adSize.length; i++) {
        min_width = _adSize[i][0] < min_width || min_width == 0 ? _adSize[i][0] : min_width;
        min_height = _adSize[i][1] < min_height || min_height == 0 ? _adSize[i][1] : min_height;
      }
    }
    style_min = `min-width: ${min_width}px; min-height: ${min_height}px;`;
  }

  const html = `
    <div class="xad-banner-ad" data-xad-id="${gpt_id}">
      <center>
        <div id="${gpt_id}" style="${style_min}"></div>
      </center>
    </div>
  `;

  try {
    if (_insertPosition == 1) element.insertAdjacentHTML("afterbegin", html);
    else if (_insertPosition == 2) element.insertAdjacentHTML("beforebegin", html);
    else if (_insertPosition == 3) element.insertAdjacentHTML("afterend", html);
    else element.insertAdjacentHTML("beforeend", html);
  } catch (error) {
    if (config.debug) console.warn(`XadAdx: Failed to insert ad HTML for ${_element}`, error);
    return;
  }

  window.googletag = window.googletag || { cmd: [] };
  googletag.cmd.push(function () {
    try {
      const adSlot = googletag.defineSlot(_adUnit, _adSize, gpt_id).addService(googletag.pubads());

      if (_mapping.length) {
        const mapping = googletag.sizeMapping();
        _mapping.forEach(({ breakpoint, size }) => {
          const sizeArray = Array.isArray(size) ? size : [size];
          mapping.addSize(breakpoint, sizeArray);
        });
        const finalMapping = mapping.build();
        adSlot.defineSizeMapping(finalMapping);
      }

      googletag.pubads().enableSingleRequest();
      googletag.enableServices();
    } catch (error) {
      if (config.debug) console.warn('XadAdx: Failed to define ad slot', error);
    }
  });

  const adElement = document.querySelector(`[data-xad-id="${gpt_id}"]`);
  if (adElement) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            try {
              googletag.cmd.push(() => {
                googletag.display(gpt_id);
                if (onAdLoaded) onAdLoaded(gpt_id);
              });
              observer.unobserve(adElement);
            } catch (error) {
              if (config.debug) console.warn(`XadAdx: Failed to display ad ${gpt_id}`, error);
            }
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(adElement);
  }
}

/**
 * Hiển thị quảng cáo Interstitial Google AdX.
 * @param {string} [_adUnit] - Đơn vị quảng cáo. Mặc định lấy từ XadConfig.adUnit.
 * @param {Array<string>} [_devices=['mobile', 'desktop']] - Thiết bị hiển thị.
 * @param {Function} [onAdLoaded] - Callback khi quảng cáo tải xong.
 * @example
 * XadAdxInterstitial('/123456/interstitial', ['mobile'], () => console.log('Interstitial loaded'));
 */
export function XadAdxInterstitial(_adUnit, _devices = ['mobile', 'desktop'], onAdLoaded) {
  const config = window.XadConfig || {};
  _adUnit = _adUnit || config.adUnit;

  if (!_adUnit) {
    if (config.debug) console.warn('XadAdxInterstitial: Missing adUnit');
    return;
  }

  const isMobile = window.innerWidth < 768;
  if (!_devices.includes(isMobile ? 'mobile' : 'desktop')) return;

  checkGPTExists();
  window.googletag = window.googletag || { cmd: [] };
  let interstitialSlot;
  googletag.cmd.push(function () {
    try {
      interstitialSlot = googletag.defineOutOfPageSlot(_adUnit, googletag.enums.OutOfPageFormat.INTERSTITIAL);
      if (interstitialSlot) {
        interstitialSlot.addService(googletag.pubads());
        googletag.pubads().enableSingleRequest();
        googletag.enableServices();
        googletag.display(interstitialSlot);
        if (onAdLoaded) onAdLoaded(interstitialSlot.getSlotId().getId());
      } else {
        if (config.debug) console.warn('XadAdxInterstitial: Failed to define interstitial slot');
      }
    } catch (error) {
      if (config.debug) console.warn('XadAdxInterstitial: Error in slot definition', error);
    }
  });
}

/**
 * Tự động chèn nhiều quảng cáo banner AdX vào các phần tử DOM.
 * @param {string} [_adUnit] - Đơn vị quảng cáo cơ bản. Mặc định lấy từ XadConfig.adUnit.
 * @param {number} _start - Số thứ tự bắt đầu cho adUnit.
 * @param {number} _end - Số thứ tự kết thúc.
 * @param {Array<Array<number>|number>} [_adSize] - Kích thước quảng cáo. Mặc định lấy từ XadConfig.adSize.
 * @param {Array} [_mapping=[]] - Size mapping cho responsive ads.
 * @param {string} _elements - CSS selector của các phần tử để chèn.
 * @param {number} [_insertPosition=2] - Vị trí chèn: 0=beforeend, 1=afterbegin, 2=beforebegin, 3=afterend.
 * @param {number} [_set_min=0] - Đặt kích thước tối thiểu.
 * @param {number} [_minScreen=1] - Khoảng cách tối thiểu giữa các quảng cáo (theo screen height).
 * @param {number} [_position_start=0] - Vị trí bắt đầu chèn.
 * @param {number} [_position_end=0] - Vị trí kết thúc chèn.
 * @param {Array<string>} [_devices=['mobile', 'desktop']] - Thiết bị hiển thị.
 * @param {Function} [onAdLoaded] - Callback khi quảng cáo tải xong.
 * @example
 * XadAdxAutoAds('/123456/adunit', 1, 3, [[300, 250]], [], 'p', 2, 0, 1, 0, 0, ['mobile']);
 */
export function XadAdxAutoAds(_adUnit, _start, _end, _adSize, _mapping = [], _elements, _insertPosition = 2, _set_min = 0, _minScreen = 1, _position_start = 0, _position_end = 0, _devices = ['mobile', 'desktop'], onAdLoaded) {
  const config = window.XadConfig || {};
  _adUnit = _adUnit || config.adUnit;
  _adSize = _adSize || config.adSize || [[300, 250]];

  if (!_adUnit || !_adSize) {
    if (config.debug) console.warn('XadAdxAutoAds: Missing adUnit or adSize');
    return;
  }

  const isMobile = window.innerWidth < 768;
  if (!_devices.includes(isMobile ? 'mobile' : 'desktop')) return;

  const elements = document.querySelectorAll(_elements);
  if (elements.length == 0) {
    if (config.debug) console.warn(`XadAdxAutoAds: No elements found for selector ${_elements}`);
    return;
  }

  const lastSpaceIndex = _elements.lastIndexOf(' ');
  const _element_str = lastSpaceIndex === -1 ? _elements : _elements.slice(0, lastSpaceIndex).trim() + ' > ' + _elements.slice(lastSpaceIndex + 1).trim();

  let min_ad = 0;
  let position = 1;
  for (let i = 0; i < elements.length; i++) {
    if (_start > _end) break;

    const _element = `${_element_str}:nth-of-type(${i + 1})`;

    if (_insertPosition == 0 || _insertPosition == 3) {
      if (i == 0 || elements[i].offsetTop + elements[i].clientHeight - min_ad - (screen.height * _minScreen) >= 0) {
        if (_position_start <= position++) {
          const adUnit = _adUnit + (_start++);
          XadAdx(adUnit, _adSize, _mapping, _element, _insertPosition, _set_min, _devices, onAdLoaded);

          if (_position_end != 0 && _position_end < position) break;
        }

        if (i < elements.length - 1) min_ad = elements[i + 1].offsetTop;
      }
    } else if (_insertPosition == 1 || _insertPosition == 2) {
      if (i == 0 || elements[i].offsetTop - min_ad - (screen.height * _minScreen) >= 0) {
        if (_position_start <= position++) {
          const adUnit = _adUnit + (_start++);
          XadAdx(adUnit, _adSize, _mapping, _element, _insertPosition, _set_min, _devices, onAdLoaded);

          if (_position_end != 0 && _position_end < position) break;
        }

        min_ad = elements[i].offsetTop;

        if (i < elements.length - 1) continue;
      }

      if (i == elements.length - 1 && elements[i].offsetTop + elements[i].clientHeight - min_ad - (screen.height * _minScreen) >= 0) {
        const adUnit = _adUnit + (_start++);
        XadAdx(adUnit, _adSize, _mapping, _element, _insertPosition == 1 ? 0 : 3, _set_min, _devices, onAdLoaded);
      }
    }
  }
}

/**
 * Hiển thị quảng cáo sticky (anchor) AdX ở đầu hoặc cuối trang.
 * @param {string} [_adUnit] - Đơn vị quảng cáo. Mặc định lấy từ XadConfig.adUnit.
 * @param {number} [_adPosition=0] - Vị trí sticky: 0=bottom, !=0=top (trên mobile).
 * @param {Array<string>} [_devices=['mobile', 'desktop']] - Thiết bị hiển thị.
 * @param {Function} [onAdLoaded] - Callback khi quảng cáo tải xong.
 * @example
 * XadAdxSticky('/123456/sticky', 0, ['mobile']);
 */
export function XadAdxSticky(_adUnit, _adPosition = 0, _devices = ['mobile', 'desktop'], onAdLoaded) {
  const config = window.XadConfig || {};
  _adUnit = _adUnit || config.adUnit;

  if (!_adUnit) {
    if (config.debug) console.warn('XadAdxSticky: Missing adUnit');
    return;
  }

  const isMobile = window.innerWidth < 768;
  if (!_devices.includes(isMobile ? 'mobile' : 'desktop')) return;

  checkGPTExists();

  window.googletag = window.googletag || { cmd: [] };
  let anchorSlot;
  googletag.cmd.push(() => {
    try {
      anchorSlot = googletag.defineOutOfPageSlot(_adUnit, document.body.clientWidth < 768 && _adPosition != 0 ? googletag.enums.OutOfPageFormat.TOP_ANCHOR : googletag.enums.OutOfPageFormat.BOTTOM_ANCHOR);
      googletag.pubads().enableSingleRequest();
      googletag.enableServices();
      googletag.display(anchorSlot);
      if (onAdLoaded && anchorSlot) onAdLoaded(anchorSlot.getSlotId().getId());
    } catch (error) {
      if (config.debug) console.warn('XadAdxSticky: Failed to define anchor slot', error);
    }
  });
}

/**
 * Chèn quảng cáo overlay vào một hình ảnh cụ thể.
 * @param {string} [_adUnit] - Đơn vị quảng cáo. Mặc định lấy từ XadConfig.adUnit.
 * @param {Array<Array<number>|number>} [_adSize] - Kích thước quảng cáo. Mặc định lấy từ XadConfig.adSize.
 * @param {Array} [_mapping=[]] - Size mapping cho responsive ads.
 * @param {string} _element - CSS selector của hình ảnh.
 * @param {number} [_image=1] - Thứ tự hình ảnh (1-based).
 * @param {number} [_marginBottom=0] - Khoảng cách dưới cùng của quảng cáo.
 * @param {Array<string>} [_devices=['mobile', 'desktop']] - Thiết bị hiển thị.
 * @param {Function} [onAdLoaded] - Callback khi quảng cáo tải xong.
 * @example
 * XadAdxInImage('/123456/inimage', [300, 250], [], 'img', 1, 10, ['mobile']);
 */
export function XadAdxInImage(_adUnit, _adSize, _mapping = [], _element, _image = 1, _marginBottom = 0, _devices = ['mobile', 'desktop'], onAdLoaded) {
  const config = window.XadConfig || {};
  _adUnit = _adUnit || config.adUnit;
  _adSize = _adSize || config.adSize || [[300, 250]];

  if (!_adUnit || !_adSize) {
    if (config.debug) console.warn('XadAdxInImage: Missing adUnit or adSize');
    return;
  }

  const isMobile = window.innerWidth < 768;
  if (!_devices.includes(isMobile ? 'mobile' : 'desktop')) return;

  const images = document.body.querySelectorAll(_element);
  const image = images[_image - 1];
  if (!image) {
    if (config.debug) console.warn(`XadAdxInImage: Image ${_element}[${_image - 1}] not found`);
    return;
  }

  checkGPTExists();

  const gpt_id = randomID();

  window.googletag = window.googletag || { cmd: [] };
  googletag.cmd.push(function () {
    try {
      const adSlot = googletag.defineSlot(_adUnit, _adSize, gpt_id).addService(googletag.pubads());

      if (_mapping.length) {
        const mapping = googletag.sizeMapping();
        _mapping.forEach(({ breakpoint, size }) => {
          const sizeArray = Array.isArray(size) ? size : [size];
          mapping.addSize(breakpoint, sizeArray);
        });
        const finalMapping = mapping.build();
        adSlot.defineSizeMapping(finalMapping);
      }

      googletag.pubads().enableSingleRequest();
      googletag.enableServices();
    } catch (error) {
      if (config.debug) console.warn('XadAdxInImage: Failed to define ad slot', error);
    }
  });

  const xad_inImage = document.createElement("div");
  xad_inImage.className = "xad-inimage-ad";
  xad_inImage.style.cssText = "position: relative;";
  xad_inImage.setAttribute('data-xad-id', gpt_id);

  const inImage_Ad = document.createElement("div");
  inImage_Ad.style.cssText = `position: absolute; bottom: ${_marginBottom}px; z-index: 10; width: 100%;`;

  const divAdsCenter = document.createElement("center");

  const divAds = document.createElement("div");
  divAds.id = gpt_id;

  const inImage_Close = document.createElement("span");
  inImage_Close.innerHTML = "×";
  inImage_Close.style.cssText = "position: absolute; display: none; z-index: 1; width: 25px !important; height: 25px !important; right: 2px !important; top: -27px !important; cursor: pointer; font-size: 20px; text-align: center; background: white; padding: 2px; border-radius: 20px; line-height: 1;";

  divAdsCenter.appendChild(divAds);
  inImage_Ad.appendChild(divAdsCenter);
  inImage_Ad.appendChild(inImage_Close);

  xad_inImage.appendChild(inImage_Ad);

  try {
    image.insertAdjacentElement("afterend", xad_inImage);
  } catch (error) {
    if (config.debug) console.warn('XadAdxInImage: Failed to insert ad element', error);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          try {
            googletag.cmd.push(function () {
              googletag.display(gpt_id);
              if (onAdLoaded) onAdLoaded(gpt_id);
            });

            let timeout = 0;
            const interval = setInterval(function () {
              const iframeAdx = divAds.querySelector("iframe");
              if (iframeAdx && iframeAdx.getAttribute("data-load-complete") == "true") {
                inImage_Close.style.display = "block";
                clearInterval(interval);
              }
              if (++timeout > 600) clearInterval(interval);
            }, 1000);

            inImage_Close.addEventListener("click", function () {
              xad_inImage.style.visibility = "hidden";
            });
          } catch (error) {
            if (config.debug) console.warn(`XadAdxInImage: Failed to display ad ${gpt_id}`, error);
          }
          observer.unobserve(xad_inImage);
        }
      });
    },
    { threshold: 0.1 }
  );
  observer.observe(xad_inImage);
}

/**
 * Chèn quảng cáo overlay vào nhiều hình ảnh.
 * @param {string} [_adUnit] - Đơn vị quảng cáo cơ bản. Mặc định lấy từ XadConfig.adUnit.
 * @param {number} _start - Số thứ tự bắt đầu cho adUnit.
 * @param {number} _end - Số thứ tự kết thúc.
 * @param {Array<Array<number>|number>} [_adSize] - Kích thước quảng cáo. Mặc định lấy từ XadConfig.adSize.
 * @param {Array} [_mapping=[]] - Size mapping cho responsive ads.
 * @param {string} _element - CSS selector của hình ảnh.
 * @param {Array<number>} [_image=[]] - Danh sách thứ tự hình ảnh (1-based).
 * @param {number} [_marginBottom=0] - Khoảng cách dưới cùng của quảng cáo.
 * @param {Array<string>} [_devices=['mobile', 'desktop']] - Thiết bị hiển thị.
 * @param {Function} [onAdLoaded] - Callback khi quảng cáo tải xong.
 * @example
 * XadAdxInImages('/123456/inimage', 1, 3, [300, 250], [], 'img', [1, 2], 0, ['mobile']);
 */
export function XadAdxInImages(_adUnit, _start, _end, _adSize, _mapping = [], _element, _image = [], _marginBottom = 0, _devices = ['mobile', 'desktop'], onAdLoaded) {
  const config = window.XadConfig || {};
  _adUnit = _adUnit || config.adUnit;
  _adSize = _adSize || config.adSize || [[300, 250]];

  if (!_adUnit || !_adSize) {
    if (config.debug) console.warn('XadAdxInImages: Missing adUnit or adSize');
    return;
  }

  const isMobile = window.innerWidth < 768;
  if (!_devices.includes(isMobile ? 'mobile' : 'desktop')) return;

  const images = document.body.querySelectorAll(_element);
  if (images.length == 0) {
    if (config.debug) console.warn(`XadAdxInImages: No images found for selector ${_element}`);
    return;
  }

  for (let i = 1; i <= images.length; i++) {
    if (_start > _end) break;

    if (_image.length > 0 && !_image.includes(i)) continue;

    const adUnit = _adUnit + (_start++);
    XadAdxInImage(adUnit, _adSize, _mapping, _element, i, _marginBottom, _devices, onAdLoaded);
  }
}

/**
 * Hiển thị quảng cáo in-page AdX cho mobile.
 * @param {string} [_adUnit] - Đơn vị quảng cáo. Mặc định lấy từ XadConfig.adUnit.
 * @param {string} _element - CSS selector của phần tử cha.
 * @param {number} [_marginTop=-1] - Khoảng cách từ đỉnh (px). Nếu -1, tự tính giữa màn hình.
 * @param {Array<string>} [_devices=['mobile']] - Thiết bị hiển thị.
 * @param {Function} [onAdLoaded] - Callback khi quảng cáo tải xong.
 * @example
 * XadAdxInPage('/123456/inpage', '#content', -1, ['mobile']);
 */
export function XadAdxInPage(_adUnit, _element, _marginTop = -1, _devices = ['mobile'], onAdLoaded) {
  const isMobile = window.innerWidth < 768;
  if (!_devices.includes(isMobile ? 'mobile' : 'desktop') || window.innerWidth >= 768) return;

  const config = window.XadConfig || {};
  _adUnit = _adUnit || config.adUnit;

  if (!_adUnit) {
    if (config.debug) console.warn('XadAdxInPage: Missing adUnit');
    return;
  }

  const ad_width = 300;
  const ad_height = 600;
  const gpt_id = randomID();

  checkGPTExists();

  window.googletag = window.googletag || { cmd: [] };
  googletag.cmd.push(function () {
    try {
      googletag.defineSlot(_adUnit, [ad_width, ad_height], gpt_id).addService(googletag.pubads());
      googletag.pubads().enableSingleRequest();
      googletag.enableServices();
    } catch (error) {
      if (config.debug) console.warn('XadAdxInPage: Failed to define ad slot', error);
    }
  });

  const parent = document.querySelectorAll(_element)[0];
  if (!parent) {
    if (config.debug) console.warn(`XadAdxInPage: Parent element ${_element} not found`);
    return;
  }
  const midpoint = Math.min(Math.floor(parent.childElementCount / 2), 4);
  try {
    parent.children[midpoint - 1].insertAdjacentHTML("afterend", `<div id="xad-inpage-ad" data-xad-id="${gpt_id}"></div>`);
  } catch (error) {
    if (config.debug) console.warn('XadAdxInPage: Failed to insert ad container', error);
    return;
  }

  const html = `
    <div id="inpage-content-ad" style="overflow: hidden; position: relative; z-index: 2; width: 100%;">
      <div id="inpage-ad" style="display: none;">
        <div id="${gpt_id}" style="min-width: ${ad_width}px; min-height: ${ad_height}px;"></div>
      </div>
    </div>
  `;
  try {
    document.getElementById("xad-inpage-ad").insertAdjacentHTML("beforeend", html);
  } catch (error) {
    if (config.debug) console.warn('XadAdxInPage: Failed to insert ad HTML', error);
    return;
  }

  const adElement = document.querySelector(`[data-xad-id="${gpt_id}"]`);
  if (adElement) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            try {
              googletag.cmd.push(() => {
                googletag.display(gpt_id);
                if (onAdLoaded) onAdLoaded(gpt_id);
              });
              observer.unobserve(adElement);
            } catch (error) {
              if (config.debug) console.warn(`XadAdxInPage: Failed to display ad ${gpt_id}`, error);
            }
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(adElement);
  }

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
 * Hiển thị quảng cáo multiple-size AdX cho mobile.
 * @param {string} [_adUnit] - Đơn vị quảng cáo. Mặc định lấy từ XadConfig.adUnit.
 * @param {string} _element - CSS selector của phần tử để chèn.
 * @param {number} [_insertPosition=0] - Vị trí chèn: 0=beforeend, 1=afterbegin, 2=beforebegin, 3=afterend.
 * @param {number} [_marginTop=0] - Khoảng cách từ đỉnh (px).
 * @param {Array<string>} [_devices=['mobile']] - Thiết bị hiển thị.
 * @param {Function} [onAdLoaded] - Callback khi quảng cáo tải xong.
 * @example
 * XadAdxMultipleSize('/123456/multisize', '#ad-container', 0, 0, ['mobile']);
 */
export function XadAdxMultipleSize(_adUnit, _element, _insertPosition = 0, _marginTop = 0, _devices = ['mobile'], onAdLoaded) {
  const isMobile = window.innerWidth < 768;
  if (!_devices.includes(isMobile ? 'mobile' : 'desktop') || window.innerWidth >= 768) return;

  const config = window.XadConfig || {};
  _adUnit = _adUnit || config.adUnit;

  if (!_adUnit) {
    if (config.debug) console.warn('XadAdxMultipleSize: Missing adUnit');
    return;
  }

  MultipleSizeAdd(_adUnit, _element, _insertPosition, onAdLoaded);
  MultipleSizeScroll(_marginTop);
}

/**
 * Tự động chèn nhiều quảng cáo multiple-size AdX cho mobile.
 * @param {string} [_adUnit] - Đơn vị quảng cáo cơ bản. Mặc định lấy từ XadConfig.adUnit.
 * @param {number} _start - Số thứ tự bắt đầu cho adUnit.
 * @param {number} _end - Số thứ tự kết thúc.
 * @param {string} _elements - CSS selector của các phần tử để chèn.
 * @param {number} [_insertPosition=2] - Vị trí chèn: 0=beforeend, 1=afterbegin, 2=beforebegin, 3=afterend.
 * @param {number} [_marginTop=0] - Khoảng cách từ đỉnh (px).
 * @param {number} [_minScreen=1] - Khoảng cách tối thiểu giữa các quảng cáo.
 * @param {number} [_position_start=0] - Vị trí bắt đầu chèn.
 * @param {number} [_position_end=0] - Vị trí kết thúc chèn.
 * @param {Array<string>} [_devices=['mobile']] - Thiết bị hiển thị.
 * @param {Function} [onAdLoaded] - Callback khi quảng cáo tải xong.
 * @example
 * XadAdxMultipleSizes('/123456/multisize', 1, 3, 'p', 2, 0, 1, 0, 0, ['mobile']);
 */
export function XadAdxMultipleSizes(_adUnit, _start, _end, _elements, _insertPosition = 2, _marginTop = 0, _minScreen = 1, _position_start = 0, _position_end = 0, _devices = ['mobile'], onAdLoaded) {
  const isMobile = window.innerWidth < 768;
  if (!_devices.includes(isMobile ? 'mobile' : 'desktop') || window.innerWidth >= 768) return;

  const config = window.XadConfig || {};
  _adUnit = _adUnit || config.adUnit;

  if (!_adUnit) {
    if (config.debug) console.warn('XadAdxMultipleSizes: Missing adUnit');
    return;
  }

  const elements = document.querySelectorAll(_elements);
  if (elements.length == 0) {
    if (config.debug) console.warn(`XadAdxMultipleSizes: No elements found for selector ${_elements}`);
    return;
  }

  const lastSpaceIndex = _elements.lastIndexOf(' ');
  const _element_str = lastSpaceIndex === -1 ? _elements : _elements.slice(0, lastSpaceIndex).trim() + ' > ' + _elements.slice(lastSpaceIndex + 1).trim();

  let min_ad = 0;
  let position = 1;
  for (let i = 0; i < elements.length; i++) {
    if (_start > _end) break;

    const _element = `${_element_str}:nth-of-type(${i + 1})`;

    if (_insertPosition == 0 || _insertPosition == 3) {
      if (i == 0 || elements[i].offsetTop + elements[i].clientHeight - min_ad - (screen.height * _minScreen) >= 0) {
        if (_position_start <= position++) {
          const adUnit = _adUnit + (_start++);
          MultipleSizeAdd(adUnit, _element, _insertPosition, onAdLoaded);

          if (_position_end != 0 && _position_end < position) break;
        }

        if (i < elements.length - 1) min_ad = elements[i + 1].offsetTop;
      }
    } else if (_insertPosition == 1 || _insertPosition == 2) {
      if (i == 0 || elements[i].offsetTop - min_ad - (screen.height * _minScreen) >= 0) {
        if (_position_start <= position++) {
          const adUnit = _adUnit + (_start++);
          MultipleSizeAdd(adUnit, _element, _insertPosition, onAdLoaded);

          if (_position_end != 0 && _position_end < position) break;
        }

        min_ad = elements[i].offsetTop;

        if (i < elements.length - 1) continue;
      }

      if (i == elements.length - 1 && elements[i].offsetTop + elements[i].clientHeight - min_ad - (screen.height * _minScreen) >= 0) {
        const adUnit = _adUnit + (_start++);
        MultipleSizeAdd(adUnit, _element, _insertPosition == 1 ? 0 : 3, onAdLoaded);
      }
    }
  }

  MultipleSizeScroll(_marginTop);
}

/**
 * Hàm nội bộ: Thêm quảng cáo multiple-size AdX.
 * @param {string} _adUnit - Đơn vị quảng cáo.
 * @param {string} _element - CSS selector của phần tử.
 * @param {number} [_insertPosition=0] - Vị trí chèn.
 * @param {Function} [onAdLoaded] - Callback khi quảng cáo tải xong.
 */
export function MultipleSizeAdd(_adUnit, _element, _insertPosition = 0, onAdLoaded) {
  const element = document.body.querySelector(_element);
  if (!element) {
    if (window.XadConfig?.debug) console.warn(`MultipleSizeAdd: Element ${_element} not found`);
    return;
  }

  checkGPTExists();

  const gpt_id = randomID();
  const adSize = [[300, 250], [300, 600]];

  window.googletag = window.googletag || { cmd: [] };
  googletag.cmd.push(function () {
    try {
      googletag.defineSlot(_adUnit, adSize, gpt_id).addService(googletag.pubads());
      googletag.pubads().enableSingleRequest();
      googletag.enableServices();
    } catch (error) {
      if (window.XadConfig?.debug) console.warn('MultipleSizeAdd: Failed to define ad slot', error);
    }
  });

  const html = `
    <div class="xad-multiplesize" style="margin-top:10px;margin-bottom:10px;margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw);" data-xad-id="${gpt_id}">
      <span style="display: inline-block;width: 100%;font-size: 14px;text-align: center;color: #9e9e9e;background-color: #f1f1f1;">Ads By Xad</span>
      <div class="ms-content-ad" style="position: relative;min-height: 600px;">
        <center class="ms-ad">
          <div id="${gpt_id}"></div>
        </center>
      </div>
      <span style="display: inline-block;width: 100%;font-size: 14px;text-align: center;color: #9e9e9e;background-color: #f1f1f1;">Scroll to Continue</span>
    </div>
  `;

  try {
    if (_insertPosition == 1) element.insertAdjacentHTML("afterbegin", html);
    else if (_insertPosition == 2) element.insertAdjacentHTML("beforebegin", html);
    else if (_insertPosition == 3) element.insertAdjacentHTML("afterend", html);
    else element.insertAdjacentHTML("beforeend", html);
  } catch (error) {
    if (window.XadConfig?.debug) console.warn(`MultipleSizeAdd: Failed to insert ad HTML for ${_element}`, error);
    return;
  }

  const adElement = document.querySelector(`[data-xad-id="${gpt_id}"]`);
  if (adElement) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            try {
              googletag.cmd.push(function () {
                googletag.display(gpt_id);
                if (onAdLoaded) onAdLoaded(gpt_id);
              });
              observer.unobserve(adElement);
            } catch (error) {
              if (window.XadConfig?.debug) console.warn(`MultipleSizeAdd: Failed to display ad ${gpt_id}`, error);
            }
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(adElement);
  }
}

/**
 * Hàm nội bộ: Xử lý scroll cho quảng cáo multiple-size.
 * @param {number} _marginTop - Khoảng cách từ đỉnh (px).
 */
export function MultipleSizeScroll(_marginTop) {
  document.addEventListener("scroll", function () {
    const elements = document.getElementsByClassName("xad-multiplesize");
    for (let i = 0; i < elements.length; i++) {
      const e = elements[i];

      const div = e.querySelector(".ms-ad");
      const h = e.querySelector(".ms-content-ad").clientHeight;
      const ch = e.querySelector(".ms-ad").clientHeight;

      const ap = e.querySelector(".ms-content-ad").getBoundingClientRect().top;
      if (ch < h) {
        if (ap >= _marginTop) {
          div.style.position = "";
          div.style.top = "";
          div.style.bottom = "";
          div.style.left = "";
          div.style.transform = "";
        } else if (ap < _marginTop && Math.abs(ap) + ch < h - _marginTop) {
          div.style.position = "fixed";
          div.style.top = _marginTop + "px";
          div.style.bottom = "";
          div.style.left = "50%";
          div.style.transform = "translateX(-50%)";
        } else if (Math.abs(ap) + ch >= h - _marginTop) {
          div.style.position = "absolute";
          div.style.top = "";
          div.style.bottom = "0";
          div.style.left = "50%";
          div.style.transform = "translateX(-50%)";
        }
      } else {
        div.style.position = "";
        div.style.top = "";
        div.style.bottom = "";
        div.style.left = "";
        div.style.transform = "";
      }
    }
  });
}

/**
 * Hiển thị quảng cáo first-view AdX trên mobile.
 * @param {string} [_adUnit] - Đơn vị quảng cáo. Mặc định lấy từ XadConfig.adUnit.
 * @param {Array<number>} [_adSize=[300, 600]] - Kích thước quảng cáo. Mặc định lấy từ XadConfig.adSize.
 * @param {Array<string>} [_devices=['mobile']] - Thiết bị hiển thị.
 * @param {Function} [onAdLoaded] - Callback khi quảng cáo tải xong.
 * @example
 * XadAdxFirstView('/123456/firstview', [300, 600], ['mobile']);
 */
export function XadAdxFirstView(_adUnit, _adSize = [300, 600], _devices = ['mobile'], onAdLoaded) {
  const isMobile = window.innerWidth < 768;
  if (!_devices.includes(isMobile ? 'mobile' : 'desktop') || window.innerWidth >= 768) return;

  const config = window.XadConfig || {};
  _adUnit = _adUnit || config.adUnit;
  _adSize = _adSize || config.adSize || [300, 600];

  if (!_adUnit) {
    if (config.debug) console.warn('XadAdxFirstView: Missing adUnit');
    return;
  }

  checkGPTExists();

  const gpt_id = randomID();

  window.googletag = window.googletag || { cmd: [] };
  googletag.cmd.push(function () {
    try {
      googletag.defineSlot(_adUnit, _adSize, gpt_id).addService(googletag.pubads());
      googletag.pubads().enableSingleRequest();
      googletag.enableServices();
    } catch (error) {
      if (config.debug) console.warn('XadAdxFirstView: Failed to define ad slot', error);
    }
  });

  const html = `
    <div class="xad-firstview" style="display: block; position: fixed; width: 100%; height: 100vh; top: 0px; left: 0px; text-align: center; opacity: 1; background-color: rgba(255, 255, 255, 0.7); visibility: hidden; z-index: 2147483647;" data-xad-id="${gpt_id}">
      <div class="xad-firstview-close" style="display: none; position: absolute; width: 60px !important; height: 25px !important; top: 80px !important; right: 0px !important; cursor: pointer; background: rgba(183, 183, 183, 0.71); padding: 2px; border-radius: 20px 0px 0px 20px; z-index: 9999;">
        <span style="position: absolute; font-size: 15px; top: 50%; left: 50%; transform: translate(-50%, -50%);">close</span>
      </div>
      <div id="${gpt_id}" style="position: absolute; top: 50%; transform: translate(-50%, -50%); left: 50%;"></div>
    </div>
  `;
  try {
    document.body.insertAdjacentHTML("beforeend", html);
  } catch (error) {
    if (config.debug) console.warn('XadAdxFirstView: Failed to insert ad HTML', error);
    return;
  }

  const adElement = document.querySelector(`[data-xad-id="${gpt_id}"]`);
  if (adElement) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            try {
              googletag.cmd.push(function () {
                googletag.display(gpt_id);

                let timer = 0;
                const interval = setInterval(() => {
                  const ads = document.getElementById(gpt_id).querySelector("iframe");
                  if (ads && ads.getAttribute("data-load-complete") == "true") {
                    clearInterval(interval);
                    document.body.querySelector('.xad-firstview').style.visibility = "visible";
                    document.body.querySelector('.xad-firstview-close').style.display = "block";
                    if (onAdLoaded) onAdLoaded(gpt_id);
                  }

                  if (++timer > 600) {
                    clearInterval(interval);
                  }
                }, 1000);

                document.body.querySelector('.xad-firstview-close').addEventListener("click", function () {
                  document.body.querySelector('.xad-firstview').style.display = "none";
                });
              });
              observer.unobserve(adElement);
            } catch (error) {
              if (config.debug) console.warn(`XadAdxFirstView: Failed to display ad ${gpt_id}`, error);
            }
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(adElement);
  }
}

/**
 * Hiển thị quảng cáo first-view AdX với tùy chọn hiển thị và đếm page view.
 * @param {string} [_adUnit] - Đơn vị quảng cáo. Mặc định lấy từ XadConfig.adUnit.
 * @param {Array<number>} [_adSize=[300, 600]] - Kích thước quảng cáo. Mặc định lấy từ XadConfig.adSize.
 * @param {number} [_isDisplay=0] - Kiểu hiển thị: 0=cả mobile/desktop, 1=chỉ desktop, 2=chỉ mobile.
 * @param {Array<number>} [_pageView=[0]] - Danh sách page view để hiển thị (0=luôn hiển thị).
 * @param {Array<string>} [_devices=['mobile', 'desktop']] - Thiết bị hiển thị.
 * @param {Function} [onAdLoaded] - Callback khi quảng cáo tải xong.
 * @example
 * XadAdxFirstViewExt('/123456/firstview', [300, 600], 0, [1, 2], ['mobile']);
 */
export function XadAdxFirstViewExt(_adUnit, _adSize = [300, 600], _isDisplay = 0, _pageView = [0], _devices = ['mobile', 'desktop'], onAdLoaded) {
  const isMobile = window.innerWidth < 768;
  if (_isDisplay === 1 && isMobile) return;
  if (_isDisplay === 2 && !isMobile) return;
  if (!_devices.includes(isMobile ? 'mobile' : 'desktop')) return;

  const config = window.XadConfig || {};
  _adUnit = _adUnit || config.adUnit;
  _adSize = _adSize || config.adSize || [300, 600];

  if (!_adUnit) {
    if (config.debug) console.warn('XadAdxFirstViewExt: Missing adUnit');
    return;
  }

  let pageViewCount = localStorage.getItem('pageViewCount') || 0;
  const now = new Date();
  if (pageViewCount == 0) {
    localStorage.setItem('expiry', now.getTime());
  } else {
    if (now.getTime() - Number(localStorage.getItem('expiry')) > 180000) {
      pageViewCount = 0;
      localStorage.setItem('expiry', now.getTime());
    }
  }
  if (!Array.isArray(_pageView)) {
    _pageView = [0];
  }
  localStorage.setItem('pageViewCount', ++pageViewCount);
  if (_pageView.length == 1 && _pageView.includes(0)) {
  } else if (_pageView.length > 0 && !_pageView.includes(pageViewCount)) return;

  checkGPTExists();
  const gpt_id = randomID();
  window.googletag = window.googletag || { cmd: [] };
  googletag.cmd.push(function () {
    try {
      googletag.defineSlot(_adUnit, _adSize, gpt_id).addService(googletag.pubads());
      googletag.pubads().enableSingleRequest();
      googletag.enableServices();
    } catch (error) {
      if (config.debug) console.warn('XadAdxFirstViewExt: Failed to define ad slot', error);
    }
  });

  const html = `
    <div class="xad-firstview" style="display: block; position: fixed; width: 100%; height: 100vh; top: 0px; left: 0px; text-align: center; opacity: 1; background-color: rgba(255, 255, 255, 0.7); visibility: hidden; z-index: 2147483647;" data-xad-id="${gpt_id}">
      <div class="xad-firstview-close" style="display: none; position: absolute; width: 85px !important; height: 25px !important; top: 80px !important; right: 0px !important; cursor: pointer; background: rgba(0, 112, 186, 1); padding: 2px; border-radius: 20px 0px 0px 20px; z-index: 9999;">
        <span style="position: absolute; font-size: 15px; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white;">CLOSE</span>
      </div>
      <div id="${gpt_id}" style="position: absolute; top: 50%; transform: translate(-50%, -50%); left: 50%;"></div>
    </div>
  `;
  try {
    document.body.insertAdjacentHTML("beforeend", html);
  } catch (error) {
    if (config.debug) console.warn('XadAdxFirstViewExt: Failed to insert ad HTML', error);
    return;
  }

  const adElement = document.querySelector(`[data-xad-id="${gpt_id}"]`);
  if (adElement) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            try {
              googletag.cmd.push(function () {
                googletag.display(gpt_id);

                let timer = 0;
                const interval = setInterval(() => {
                  const ads = document.getElementById(gpt_id).querySelector("iframe");
                  if (ads && ads.getAttribute("data-load-complete") == "true") {
                    clearInterval(interval);
                    document.body.querySelector('.xad-firstview').style.visibility = "visible";
                    document.body.querySelector('.xad-firstview-close').style.display = "block";
                    if (onAdLoaded) onAdLoaded(gpt_id);
                  }

                  if (++timer > 600) {
                    clearInterval(interval);
                  }
                }, 1000);

                document.body.querySelector('.xad-firstview-close').addEventListener("click", function () {
                  document.body.querySelector('.xad-firstview').style.display = "none";
                });
              });
              observer.unobserve(adElement);
            } catch (error) {
              if (config.debug) console.warn(`XadAdxFirstViewExt: Failed to display ad ${gpt_id}`, error);
            }
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(adElement);
  }
}

/**
 * Hiển thị quảng cáo rewarded AdX.
 * @param {string} [_adUnit] - Đơn vị quảng cáo. Mặc định lấy từ XadConfig.adUnit.
 * @param {Array<string>} [_devices=['mobile', 'desktop']] - Thiết bị hiển thị.
 * @param {Function} [onAdLoaded] - Callback khi quảng cáo tải xong.
 * @example
 * XadAdxRewarded('/123456/rewarded', ['mobile']);
 */
export function XadAdxRewarded(_adUnit, _devices = ['mobile', 'desktop'], onAdLoaded) {
  const config = window.XadConfig || {};
  _adUnit = _adUnit || config.adUnit;

  if (!_adUnit) {
    if (config.debug) console.warn('XadAdxRewarded: Missing adUnit');
    return;
  }

  const isMobile = window.innerWidth < 768;
  if (!_devices.includes(isMobile ? 'mobile' : 'desktop')) return;

  checkGPTExists();

  window.googletag = window.googletag || { cmd: [] };
  let rewardedSlot;
  let rewardPayload;
  googletag.cmd.push(() => {
    try {
      rewardedSlot = googletag.defineOutOfPageSlot(_adUnit, googletag.enums.OutOfPageFormat.REWARDED);
      if (rewardedSlot) {
        rewardedSlot.addService(googletag.pubads());
        googletag.pubads().addEventListener('rewardedSlotReady', (event) => {
          event.makeRewardedVisible();
          if (onAdLoaded) onAdLoaded(rewardedSlot.getSlotId().getId());
        });
        googletag.pubads().addEventListener('rewardedSlotClosed', (event) => {
          if (rewardPayload) {
            rewardPayload = null;
          }
          if (rewardedSlot) {
            googletag.destroySlots([rewardedSlot]);
          }
          window.xad_rewarded_done = true;
        });
        googletag.pubads().addEventListener('rewardedSlotGranted', (event) => {
          rewardPayload = event.payload;
        });
        googletag.pubads().addEventListener('slotRenderEnded', (event) => {
          if (event.slot === rewardedSlot && event.isEmpty) {
            window.xad_rewarded_done = true;
          }
        });
        googletag.enableServices();
        googletag.display(rewardedSlot);
      } else {
        window.xad_rewarded_done = true;
        if (config.debug) console.warn('XadAdxRewarded: Rewarded ads not supported');
      }
    } catch (error) {
      if (config.debug) console.warn('XadAdxRewarded: Failed to define rewarded slot', error);
    }
  });
}

/**
 * Hiển thị quảng cáo rewarded AdX với tùy chọn hiển thị và đếm page view.
 * @param {string} [_adUnit] - Đơn vị quảng cáo. Mặc định lấy từ XadConfig.adUnit.
 * @param {number} [_isDisplay=0] - Kiểu hiển thị: 0=cả mobile/desktop, 1=chỉ desktop, 2=chỉ mobile.
 * @param {Array<number>} [_pageView=[0]] - Danh sách page view để hiển thị (0=luôn hiển thị).
 * @param {Array<string>} [_devices=['mobile', 'desktop']] - Thiết bị hiển thị.
 * @param {Function} [onAdLoaded] - Callback khi quảng cáo tải xong.
 * @example
 * XadAdxRewardedExt('/123456/rewarded', 0, [1], ['mobile']);
 */
export function XadAdxRewardedExt(_adUnit, _isDisplay = 0, _pageView = [0], _devices = ['mobile', 'desktop'], onAdLoaded) {
  const isMobile = window.innerWidth < 768;
  if (_isDisplay === 1 && isMobile) return;
  if (_isDisplay === 2 && !isMobile) return;
  if (!_devices.includes(isMobile ? 'mobile' : 'desktop')) return;

  const config = window.XadConfig || {};
  _adUnit = _adUnit || config.adUnit;

  if (!_adUnit) {
    if (config.debug) console.warn('XadAdxRewardedExt: Missing adUnit');
    return;
  }

  let pageViewCount = localStorage.getItem('pageViewCount') || 0;
  const now = new Date();
  if (pageViewCount == 0) {
    localStorage.setItem('expiry', now.getTime());
  } else {
    if (now.getTime() - Number(localStorage.getItem('expiry')) > 180000) {
      pageViewCount = 0;
      localStorage.setItem('expiry', now.getTime());
    }
  }
  if (!Array.isArray(_pageView)) {
    _pageView = [0];
  }
  localStorage.setItem('pageViewCount', ++pageViewCount);
  if (_pageView.length == 1 && _pageView.includes(0)) {
  } else if (_pageView.length > 0 && !_pageView.includes(pageViewCount)) return;

  checkGPTExists();

  window.googletag = window.googletag || { cmd: [] };
  let rewardedSlot;
  let rewardPayload;
  googletag.cmd.push(() => {
    try {
      rewardedSlot = googletag.defineOutOfPageSlot(_adUnit, googletag.enums.OutOfPageFormat.REWARDED);
      if (rewardedSlot) {
        rewardedSlot.addService(googletag.pubads());
        googletag.pubads().addEventListener('rewardedSlotReady', (event) => {
          event.makeRewardedVisible();
          if (onAdLoaded) onAdLoaded(rewardedSlot.getSlotId().getId());
        });
        googletag.pubads().addEventListener('rewardedSlotClosed', (event) => {
          if (rewardPayload) {
            rewardPayload = null;
          }
          if (rewardedSlot) {
            googletag.destroySlots([rewardedSlot]);
          }
          window.xad_rewarded_done = true;
        });
        googletag.pubads().addEventListener('rewardedSlotGranted', (event) => {
          rewardPayload = event.payload;
        });
        googletag.pubads().addEventListener('slotRenderEnded', (event) => {
          if (event.slot === rewardedSlot && event.isEmpty) {
            window.xad_rewarded_done = true;
          }
        });
        googletag.enableServices();
        googletag.display(rewardedSlot);
      } else {
        window.xad_rewarded_done = true;
        if (config.debug) console.warn('XadAdxRewardedExt: Rewarded ads not supported');
      }
    } catch (error) {
      if (config.debug) console.warn('XadAdxRewardedExt: Failed to define rewarded slot', error);
    }
  });
}

/**
 * Hiển thị quảng cáo catfish AdX (dính dưới màn hình).
 * @param {string} [_adUnit] - Đơn vị quảng cáo. Mặc định lấy từ XadConfig.adUnit.
 * @param {Array<number>} [_adSize=[320, 100]] - Kích thước quảng cáo. Mặc định lấy từ XadConfig.adSize.
 * @param {number} [_isDisplay=0] - Kiểu hiển thị: 0=cả mobile/desktop, 1=chỉ desktop, 2=chỉ mobile.
 * @param {Array<number>} [_pageView=[0]] - Danh sách page view để hiển thị (0=luôn hiển thị).
 * @param {number} [_bottom=0] - Khoảng cách từ dưới cùng (px).
 * @param {Array<string>} [_devices=['mobile', 'desktop']] - Thiết bị hiển thị.
 * @param {Function} [onAdLoaded] - Callback khi quảng cáo tải xong.
 * @example
 * XadAdxCatfish('/123456/catfish', [320, 100], 0, [1], 0, ['mobile']);
 */
export function XadAdxCatfish(_adUnit, _adSize = [320, 100], _isDisplay = 0, _pageView = [0], _bottom = 0, _devices = ['mobile', 'desktop'], onAdLoaded) {
  const isMobile = window.innerWidth < 768;
  if (_isDisplay === 1 && isMobile) return;
  if (_isDisplay === 2 && !isMobile) return;
  if (!_devices.includes(isMobile ? 'mobile' : 'desktop')) return;

  const config = window.XadConfig || {};
  _adUnit = _adUnit || config.adUnit;
  _adSize = _adSize || config.adSize || [320, 100];

  if (!_adUnit) {
    if (config.debug) console.warn('XadAdxCatfish: Missing adUnit');
    return;
  }

  let pageViewCount = localStorage.getItem('pageViewCount') || 0;
  const now = new Date();
  if (pageViewCount == 0) {
    localStorage.setItem('expiry', now.getTime());
  } else {
    if (now.getTime() - Number(localStorage.getItem('expiry')) > 180000) {
      pageViewCount = 0;
      localStorage.setItem('expiry', now.getTime());
    }
  }
  if (!Array.isArray(_pageView)) {
    _pageView = [0];
  }
  localStorage.setItem('pageViewCount', ++pageViewCount);
  if (_pageView.length == 1 && _pageView.includes(0)) {
  } else if (_pageView.length > 0 && !_pageView.includes(pageViewCount)) return;

  checkGPTExists();
  const gpt_id = randomID();
  const html = `
    <div id="catfish-ad" class="catfish-hidden" style="position: fixed; bottom: -120px; left: 0; width: 100%; height: 100px; background-color: white; z-index: 1000; box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2); transition: bottom 1.1s ease-in-out; display: flex; justify-content: center; align-items: center; bottom: ${_bottom}px;" data-xad-id="${gpt_id}">
      <button id="close-catfish" style="position: absolute; top: 0px; right: 0px; background: #D6DCD9; border: none; color: #BBC4BF; font-size: 18px; cursor: pointer; width: 20px; height: 20px;">×</button>
      <div id="${gpt_id}" style="min-width: ${_adSize[0]}px; min-height: ${_adSize[1]}px;"></div>
    </div>
  `;
  try {
    document.body.insertAdjacentHTML("beforeend", html);
  } catch (error) {
    if (config.debug) console.warn('XadAdxCatfish: Failed to insert ad HTML', error);
    return;
  }

  window.googletag = window.googletag || { cmd: [] };
  googletag.cmd.push(function () {
    try {
      googletag.defineSlot(_adUnit, _adSize, gpt_id).addService(googletag.pubads());
      googletag.pubads().enableSingleRequest();
      googletag.enableServices();
    } catch (error) {
      if (config.debug) console.warn('XadAdxCatfish: Failed to define ad slot', error);
    }
  });

  const adElement = document.querySelector(`[data-xad-id="${gpt_id}"]`);
  if (adElement) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            try {
              googletag.cmd.push(function () {
                googletag.display(gpt_id);
                if (onAdLoaded) onAdLoaded(gpt_id);

                const triggerPosition = window.innerHeight * 1.5;
                let isVisible = false;
                window.addEventListener("scroll", function () {
                  const ads = document.getElementById(gpt_id).querySelector("iframe");
                  const catfishAd = document.getElementById('catfish-ad');

                  if (window.scrollY > triggerPosition && !isVisible && ads && ads.getAttribute("data-load-complete") == "true") {
                    catfishAd.style.display = 'flex';
                    isVisible = true;
                  } else if (window.scrollY <= triggerPosition && isVisible) {
                    catfishAd.style.display = 'none';
                    isVisible = false;
                  }
                });

                document.getElementById('close-catfish').addEventListener("click", function () {
                  document.getElementById('catfish-ad').style.display = "none";
                });
              });
              observer.unobserve(adElement);
            } catch (error) {
              if (config.debug) console.warn(`XadAdxCatfish: Failed to display ad ${gpt_id}`, error);
            }
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(adElement);

    const style = document.createElement('style');
    style.innerHTML = `
      .catfish-hidden {
        display: none;
      }
    `;
    document.head.appendChild(style);
  }
}
