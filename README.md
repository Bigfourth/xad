Xad GPT JS
A modular JavaScript library for integrating Google AdX (DoubleClick for Publishers) and AdSense ads into websites.
Installation

Install via npm:npm install xad-gpt-js


Or include the built file in your HTML:<script src="dist/gpt.js"></script>



Setup
Initialize the library with a configuration object or JSON file:
// Initialize with object
Xad.init({
  adUnit: '/123456/adunit',
  adClient: 'ca-pub-123456789',
  adSlot: '1234567890',
  adSize: [300, 250]
});

// Or load from JSON
Xad.init('config.json');

Usage
AdX Banner
Xad.XadAdx('/123456/adunit', [[300, 250]], [], '#ad-container');

AdSense Banner
Xad.XadAdsense('ca-pub-123456789', '1234567890', [300, 250], 0, '#ad-container');

Auto Ads
Xad.XadAdxAutoAds('/123456/adunit', 1, 3, [[300, 250]], [], 'p', 2);

First View Ad
Xad.XadAdxFirstView('/123456/firstview');

See the API Documentation for all available functions.
API Documentation

XadAdx: Display a Google AdX banner ad.
XadAdxInterstitial: Display an interstitial ad.
XadAdxAutoAds: Automatically insert multiple AdX banners.
XadAdxSticky: Display a sticky (anchor) ad.
XadAdxInImage: Overlay an ad on a specific image.
XadAdxInImages: Overlay ads on multiple images.
XadAdxInPage: Display an in-page ad for mobile.
XadAdxMultipleSize: Display a multiple-size ad for mobile.
XadAdxMultipleSizes: Automatically insert multiple-size ads.
XadAdxFirstView: Display a first-view ad on mobile.
XadAdxFirstViewExt: Enhanced first-view ad with page view control.
XadAdxRewarded: Display a rewarded ad.
XadAdxRewardedExt: Enhanced rewarded ad with page view control.
XadAdxCatfish: Display a catfish ad (bottom sticky).
XadAdsense: Display an AdSense banner.
XadAdsenseInPage: Display an in-page AdSense ad.
XadAdsenseFirstView: Display a first-view AdSense ad.
init: Initialize the library with configuration.
checkGPTExists: Check and load GPT.js.
randomID: Generate a unique ad slot ID.
checkAdsenseJSExists: Check and load AdSense.js.

Building
npm run build

Testing
npm run test

License
MIT
