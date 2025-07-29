export function XadAdx(_adUnit, _adSize, _mapping = [], _element, _insertPosition = 0, _set_min = 0) {
  const element = document.body.querySelector(_element);
  if (!element) return;

  checkGPTExists();

  const gpt_id = randomID();

  window.googletag = window.googletag || { cmd: [] };
  googletag.cmd.push(function () {
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
  });

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
    <div class="xad-banner-ad">
      <center>
        <div id="${gpt_id}" style="${style_min}"></div>
      </center>
    </div>
  `;

  if (_insertPosition == 1) element.insertAdjacentHTML("afterbegin", html);
  else if (_insertPosition == 2) element.insertAdjacentHTML("beforebegin", html);
  else if (_insertPosition == 3) element.insertAdjacentHTML("afterend", html);
  else element.insertAdjacentHTML("beforeend", html);

  googletag.cmd.push(() => {
    googletag.display(gpt_id);
  });
}

export function XadAdxInterstitial(_adUnit) {
  checkGPTExists();
  window.googletag = window.googletag || { cmd: [] };
  let interstitialSlot;
  googletag.cmd.push(function () {
    interstitialSlot = googletag.defineOutOfPageSlot(_adUnit, googletag.enums.OutOfPageFormat.INTERSTITIAL);
    if (interstitialSlot) {
      interstitialSlot.addService(googletag.pubads());
    }
    googletag.pubads().enableSingleRequest();
    googletag.enableServices();
    googletag.display(interstitialSlot);
  });
}

export function XadAdxAutoAds(_adUnit, _start, _end, _adSize, _mapping = [], _elements, _insertPosition = 2, _set_min = 0, _minScreen = 1, _position_start = 0, _position_end = 0) {
  const elements = document.querySelectorAll(_elements);
  if (elements.length == 0) return;

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
          XadAdx(adUnit, _adSize, _mapping, _element, _insertPosition, _set_min);

          if (_position_end != 0 && _position_end < position) break;
        }

        if (i < elements.length - 1) min_ad = elements[i + 1].offsetTop;
      }
    } else if (_insertPosition == 1 || _insertPosition == 2) {
      if (i == 0 || elements[i].offsetTop - min_ad - (screen.height * _minScreen) >= 0) {
        if (_position_start <= position++) {
          const adUnit = _adUnit + (_start++);
          XadAdx(adUnit, _adSize, _mapping, _element, _insertPosition, _set_min);

          if (_position_end != 0 && _position_end < position) break;
        }

        min_ad = elements[i].offsetTop;

        if (i < elements.length - 1) continue;
      }

      if (i == elements.length - 1 && elements[i].offsetTop + elements[i].clientHeight - min_ad - (screen.height * _minScreen) >= 0) {
        const adUnit = _adUnit + (_start++);
        XadAdx(adUnit, _adSize, _mapping, _element, _insertPosition == 1 ? 0 : 3, _set_min);
      }
    }
  }
}

export function XadAdxSticky(_adUnit, _adPosition = 0) {
  checkGPTExists();

  window.googletag = window.googletag || { cmd: [] };
  let anchorSlot;
  googletag.cmd.push(() => {
    anchorSlot = googletag.defineOutOfPageSlot(_adUnit, document.body.clientWidth < 768 && _adPosition != 0 ? googletag.enums.OutOfPageFormat.TOP_ANCHOR : googletag.enums.OutOfPageFormat.BOTTOM_ANCHOR);
    googletag.pubads().enableSingleRequest();
    googletag.enableServices();
  });

  googletag.cmd.push(() => {
    googletag.display(anchorSlot);
  });
}

export function XadAdxInImage(_adUnit, _adSize, _mapping = [], _element, _image = 1, _marginBottom = 0) {
  const images = document.body.querySelectorAll(_element);
  const image = images[_image - 1];
  if (!image) return;

  checkGPTExists();

  const gpt_id = randomID();

  window.googletag = window.googletag || { cmd: [] };
  googletag.cmd.push(function () {
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
  });

  const xad_inImage = document.createElement("div");
  xad_inImage.className = "xad-inimage-ad";
  xad_inImage.style.cssText = "position: relative;";

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

  image.insertAdjacentElement("afterend", xad_inImage);

  googletag.cmd.push(function () {
    googletag.display(gpt_id);
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
}

export function XadAdxInImages(_adUnit, _start, _end, _adSize, _mapping = [], _element, _image = [], _marginBottom = 0) {
  const images = document.body.querySelectorAll(_element);
  if (images.length == 0) return;

  for (let i = 1; i <= images.length; i++) {
    if (_start > _end) break;

    if (_image.length > 0 && !_image.includes(i)) continue;

    const adUnit = _adUnit + (_start++);
    XadAdxInImage(adUnit, _adSize, _mapping, _element, i, _marginBottom);
  }
}

export function XadAdxInPage(_adUnit, _element, _marginTop = -1) {
  if (window.innerWidth >= 768) return;

  const ad_width = 300;
  const ad_height = 600;
  const gpt_id = randomID();

  checkGPTExists();

  window.googletag = window.googletag || { cmd: [] };
  googletag.cmd.push(function () {
    googletag.defineSlot(_adUnit, [ad_width, ad_height], gpt_id).addService(googletag.pubads());
    googletag.pubads().enableSingleRequest();
    googletag.enableServices();
  });

  const parent = document.querySelectorAll(_element)[0];
  const midpoint = Math.min(Math.floor(parent.childElementCount / 2), 4);
  parent.children[midpoint - 1].insertAdjacentHTML("afterend", "<div id='xad-inpage-ad'></div>");

  const html = `
    <div id="inpage-content-ad" style="overflow: hidden; position: relative; z-index: 2; width: 100%;">
      <div id="inpage-ad" style="display: none;">
        <div id="${gpt_id}" style="min-width: ${ad_width}px; min-height: ${ad_height}px;"></div>
      </div>
    </div>
  `;
  document.getElementById("xad-inpage-ad").insertAdjacentHTML("beforeend", html);

  googletag.cmd.push(() => {
    googletag.display(gpt_id);
  });

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

export function XadAdxMultipleSize(_adUnit, _element, _insertPosition = 0, _marginTop = 0) {
  if (window.innerWidth >= 768) return;

  MultipleSizeAdd(_adUnit, _element, _insertPosition);
  MultipleSizeScroll(_marginTop);
}

export function XadAdxMultipleSizes(_adUnit, _start, _end, _elements, _insertPosition = 2, _marginTop = 0, _minScreen = 1, _position_start = 0, _position_end = 0) {
  if (window.innerWidth >= 768) return;

  const elements = document.querySelectorAll(_elements);
  if (elements.length == 0) return;

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
          MultipleSizeAdd(adUnit, _element, _insertPosition);

          if (_position_end != 0 && _position_end < position) break;
        }

        if (i < elements.length - 1) min_ad = elements[i + 1].offsetTop;
      }
    } else if (_insertPosition == 1 || _insertPosition == 2) {
      if (i == 0 || elements[i].offsetTop - min_ad - (screen.height * _minScreen) >= 0) {
        if (_position_start <= position++) {
          const adUnit = _adUnit + (_start++);
          MultipleSizeAdd(adUnit, _element, _insertPosition);

          if (_position_end != 0 && _position_end < position) break;
        }

        min_ad = elements[i].offsetTop;

        if (i < elements.length - 1) continue;
      }

      if (i == elements.length - 1 && elements[i].offsetTop + elements[i].clientHeight - min_ad - (screen.height * _minScreen) >= 0) {
        const adUnit = _adUnit + (_start++);
        MultipleSizeAdd(adUnit, _element, _insertPosition == 1 ? 0 : 3);
      }
    }
  }

  MultipleSizeScroll(_marginTop);
}

export function MultipleSizeAdd(_adUnit, _element, _insertPosition = 0) {
  const element = document.body.querySelector(_element);
  if (!element) return;

  checkGPTExists();

  const gpt_id = randomID();
  const adSize = [[300, 250], [300, 600]];

  window.googletag = window.googletag || { cmd: [] };
  googletag.cmd.push(function () {
    googletag.defineSlot(_adUnit, adSize, gpt_id).addService(googletag.pubads());
    googletag.pubads().enableSingleRequest();
    googletag.enableServices();
  });

  const html = `
    <div class="xad-multiplesize" style="margin-top:10px;margin-bottom:10px;margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw);">
      <span style="display: inline-block;width: 100%;font-size: 14px;text-align: center;color: #9e9e9e;background-color: #f1f1f1;">Ads By Xad</span>
      <div class="ms-content-ad" style="position: relative;min-height: 600px;">
        <center class="ms-ad">
          <div id="${gpt_id}"></div>
        </center>
      </div>
      <span style="display: inline-block;width: 100%;font-size: 14px;text-align: center;color: #9e9e9e;background-color: #f1f1f1;">Scroll to Continue</span>
    </div>
  `;

  if (_insertPosition == 1) element.insertAdjacentHTML("afterbegin", html);
  else if (_insertPosition == 2) element.insertAdjacentHTML("beforebegin", html);
  else if (_insertPosition == 3) element.insertAdjacentHTML("afterend", html);
  else element.insertAdjacentHTML("beforeend", html);

  googletag.cmd.push(function () {
    googletag.display(gpt_id);
  });
}

export function MultipleSizeScroll(_marginTop) {
  document.addEventListener("scroll", function (e) {
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

export function XadAdxFirstView(_adUnit, _adSize = [300, 600]) {
  if (window.innerWidth >= 768) return;

  checkGPTExists();

  const gpt_id = randomID();

  window.googletag = window.googletag || { cmd: [] };
  googletag.cmd.push(function () {
    googletag.defineSlot(_adUnit, _adSize, gpt_id).addService(googletag.pubads());
    googletag.pubads().enableSingleRequest();
    googletag.enableServices();
  });

  const html = `
    <div class="xad-firstview" style="display: block; position: fixed; width: 100%; height: 100vh; top: 0px; left: 0px; text-align: center; opacity: 1; background-color: rgba(255, 255, 255, 0.7); visibility: hidden; z-index: 2147483647;">
      <div class="xad-firstview-close" style="display: none; position: absolute; width: 60px !important; height: 25px !important; top: 80px !important; right: 0px !important; cursor: pointer; background: rgba(183, 183, 183, 0.71); padding: 2px; border-radius: 20px 0px 0px 20px; z-index: 9999;">
        <span style="position: absolute; font-size: 15px; top: 50%; left: 50%; transform: translate(-50%, -50%);">close</span>
      </div>
      <div id="${gpt_id}" style="position: absolute; top: 50%; transform: translate(-50%, -50%); left: 50%;"></div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", html);

  googletag.cmd.push(function () {
    googletag.display(gpt_id);
  });

  document.body.querySelector('.xad-firstview-close').addEventListener("click", function () {
    document.body.querySelector('.xad-firstview').style.display = "none";
  });

  let timer = 0;
  const interval = setInterval(() => {
    const ads = document.getElementById(gpt_id).querySelector("iframe");
    if (ads && ads.getAttribute("data-load-complete") == "true") {
      clearInterval(interval);
      document.body.querySelector('.xad-firstview').style.visibility = "visible";
      document.body.querySelector('.xad-firstview-close').style.display = "block";
    }

    if (++timer > 600) {
      clearInterval(interval);
    }
  }, 1000);
}

export function XadAdxFirstViewExt(_adUnit, _adSize = [300, 600], _isDisplay = 0, _pageView = [0]) {
  if (_isDisplay === 1 && window.innerWidth < 768) return;
  if (_isDisplay === 2 && window.innerWidth >= 768) return;

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
    googletag.defineSlot(_adUnit, _adSize, gpt_id).addService(googletag.pubads());
    googletag.pubads().enableSingleRequest();
    googletag.enableServices();
  });

  const html = `
    <div class="xad-firstview" style="display: block; position: fixed; width: 100%; height: 100vh; top: 0px; left: 0px; text-align: center; opacity: 1; background-color: rgba(255, 255, 255, 0.7); visibility: hidden; z-index: 2147483647;">
      <div class="xad-firstview-close" style="display: none; position: absolute; width: 85px !important; height: 25px !important; top: 80px !important; right: 0px !important; cursor: pointer; background: rgba(0, 112, 186, 1); padding: 2px; border-radius: 20px 0px 0px 20px; z-index: 9999;">
        <span style="position: absolute; font-size: 15px; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white;">CLOSE</span>
      </div>
      <div id="${gpt_id}" style="position: absolute; top: 50%; transform: translate(-50%, -50%); left: 50%;"></div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", html);

  googletag.cmd.push(function () {
    googletag.display(gpt_id);
  });

  document.body.querySelector('.xad-firstview-close').addEventListener("click", function () {
    document.body.querySelector('.xad-firstview').style.display = "none";
  });

  let timer = 0;
  const interval = setInterval(() => {
    const ads = document.getElementById(gpt_id).querySelector("iframe");
    if (ads && ads.getAttribute("data-load-complete") == "true") {
      clearInterval(interval);
      document.body.querySelector('.xad-firstview').style.visibility = "visible";
      document.body.querySelector('.xad-firstview-close').style.display = "block";
    }

    if (++timer > 600) {
      clearInterval(interval);
    }
  }, 1000);
}

export function XadAdxRewarded(_adUnit) {
  checkGPTExists();

  window.googletag = window.googletag || { cmd: [] };
  let rewardedSlot;
  let rewardPayload;
  googletag.cmd.push(() => {
    rewardedSlot = googletag.defineOutOfPageSlot(_adUnit, googletag.enums.OutOfPageFormat.REWARDED);
    if (rewardedSlot) {
      rewardedSlot.addService(googletag.pubads());
      googletag.pubads().addEventListener('rewardedSlotReady', (event) => {
        event.makeRewardedVisible();
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
    }
  });
}

export function XadAdxRewardedExt(_adUnit, _isDisplay = 0, _pageView = [0]) {
  if (_isDisplay === 1 && window.innerWidth < 768) return;
  if (_isDisplay === 2 && window.innerWidth >= 768) return;

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
    rewardedSlot = googletag.defineOutOfPageSlot(_adUnit, googletag.enums.OutOfPageFormat.REWARDED);
    if (rewardedSlot) {
      rewardedSlot.addService(googletag.pubads());
      googletag.pubads().addEventListener('rewardedSlotReady', (event) => {
        event.makeRewardedVisible();
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
    }
  });
}

export function XadAdxCatfish(_adUnit, _adSize = [320, 100], _isDisplay = 0, _pageView = [0], _bottom = 0) {
  if (_isDisplay === 1 && window.innerWidth < 768) return;
  if (_isDisplay === 2 && window.innerWidth >= 768) return;

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
    <div id="catfish-ad" class="catfish-hidden" style="position: fixed; bottom: -120px; left: 0; width: 100%; height: 100px; background-color: white; z-index: 1000; box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2); transition: bottom 1.1s ease-in-out; display: flex; justify-content: center; align-items: center; bottom: ${_bottom}px;">
      <button id="close-catfish" style="position: absolute; top: 0px; right: 0px; background: #D6DCD9; border: none; color: #BBC4BF; font-size: 18px; cursor: pointer; width: 20px; height: 20px;">×</button>
      <div id="${gpt_id}" style="min-width: ${_adSize[0]}px; min-height: ${_adSize[1]}px;"></div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", html);

  window.googletag = window.googletag || { cmd: [] };
  googletag.cmd.push(function () {
    googletag.defineSlot(_adUnit, _adSize, gpt_id).addService(googletag.pubads());
    googletag.pubads().enableSingleRequest();
    googletag.enableServices();
  });

  googletag.cmd.push(function () {
    googletag.display(gpt_id);
  });

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

  const style = document.createElement('style');
  style.innerHTML = `
    .catfish-hidden {
      display: none;
    }
  `;
  document.head.appendChild(style);
}
