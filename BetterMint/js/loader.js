"use strict";

let inputObjects = {
  "option-url-api-stockfish": { default_value: "wss://ProtonnDev-engine.hf.space/stockfish-16" },
  "option-api-stockfish": { default_value: true },
  "option-num-cores": { default_value: 1 },
  "option-hashtable-ram": { default_value: 1024 },
  "option-depth": { default_value: 1 },
  "option-mate-finder-value": { default_value: 1 },
  "option-multipv": { default_value: 1 },
  "option-highmatechance": { default_value: false },
  "option-auto-move-time": { default_value: 1 },
  "option-auto-move-time-random": { default_value: 1 },
  "option-auto-move-time-random-div": { default_value: 1 },
  "option-auto-move-time-random-multi": { default_value: 1 },
  "option-fast-mover": { default_value: 0 },
  "option-max-legit-auto-move-depth": { default_value: 1 },
  "option-legit-auto-move": { default_value: true },
  "option-max-premoves": { default_value: 1 },
  "option-premove-enabled": { default_value: false },
  "option-premove-time": { default_value: 1 },
  "option-premove-time-random": { default_value: 1 },
  "option-premove-time-random-div": { default_value: 1 },
  "option-premove-time-random-multi": { default_value: 1 },
  "option-best-move-chance": { default_value: 1 },
  "option-random-best-move": { default_value: false },
  "option-show-hints": { default_value: false },
  "option-text-to-speech": { default_value: false },
  "option-move-analysis": { default_value: false },
  "option-depth-bar": { default_value: false },
  "option-evaluation-bar": { default_value: true },
};

let DefaultExtensionOptions = {};
for (let key in inputObjects) {
  DefaultExtensionOptions[key] = inputObjects[key].default_value;
}

// Function to inject the script (your extension script)
function injectScript(file) {
  let script = document.createElement("script");
  script.src = chrome.runtime.getURL(file);
  let doc = document.head || document.documentElement;
  doc.insertBefore(script, doc.firstElementChild);
  script.onload = function () {
    script.remove();
  };
}

// Listen for messages
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.data !== "popout") {
    window.dispatchEvent(
      new CustomEvent("BetterMintUpdateOptions", {
        detail: request.data,
      })
    );
  } else if (request.data == "popout") {
    window.postMessage("popout");
  }
});

// Respond to BetterMintGetOptions events
window.addEventListener("BetterMintGetOptions", function (evt) {
  chrome.storage.sync.get(DefaultExtensionOptions, function (opts) {
    let request = evt.detail;
    let response = {
      requestId: request.id,
      data: opts,
    };
    window.dispatchEvent(
      new CustomEvent("BetterMintSendOptions", {
        detail: response,
      })
    );
  });
});

// Inject other necessary scripts automatically
injectScript("js/Mint.js"); // Injects Mint.js for web-side functionality
