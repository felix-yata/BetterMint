"use strict";

let inputObjects = {
  "option-url-api-stockfish": {
    default_value: "wss://ProtonnDev-engine.hf.space/stockfish-16",
  },
  "option-api-stockfish": {
    default_value: true,
  },
  "option-num-cores": {
    default_value: 1,
  },
  "option-hashtable-ram": {
    default_value: 1024,
  },
  "option-depth": {
    default_value: 1,
  },
  "option-mate-finder-value": {
    default_value: 1,
  },
  "option-multipv": {
    default_value: 1,
  },
  "option-highmatechance": {
    default_value: false,
  },
  "option-limit-strength": {
    default_value: false,
  },
  "option-auto-move-time": {
    default_value: 1,
  },
  "option-auto-move-time-random": {
    default_value: 1,
  },
  "option-auto-move-time-random-div": {
    default_value: 1,
  },
  "option-auto-move-time-random-multi": {
    default_value: 1,
  },
  "option-max-legit-auto-move-depth": {
    default_value: 1,
  },
  "option-legit-auto-move": {
    default_value: true,
  },
  "option-max-premoves": {
    default_value: 1, // Maximum number of pre-moves allowed
  },
  "option-premove-enabled": {
    default_value: false, // Enable or disable pre-moves
  },
  "option-premove-time": {
    default_value: 1, // Base time for pre-move execution
  },
  "option-premove-time-random": {
    default_value: 1, // Random time range for pre-move execution
  },
  "option-premove-time-random-div": {
    default_value: 1, // Divisor for random time calculation
  },
  "option-premove-time-random-multi": {
    default_value: 1, // Multiplier for random time calculation
  },
  "option-fast-mover": {
    default_value: 0, // Ratio changer for slow-fast moves
  },
  "option-best-move-chance": {
    default_value: 1,
  },
  "option-random-best-move": {
    default_value: false,
  },
  "option-show-hints": {
    default_value: true,
  },
  "option-text-to-speech": {
    default_value: false,
  },
  "option-move-analysis": {
    default_value: false,
  },
  "option-depth-bar": {
    default_value: false,
  },
  "option-evaluation-bar": {
    default_value: true,
  },
};

let DefaultExtensionOptions = {};
for (let key in inputObjects) {
  DefaultExtensionOptions[key] = inputObjects[key].default_value;
}

function RestoreOptions() {
  chrome.storage.sync.get(DefaultExtensionOptions, function (opts) {
    let options = opts;
    for (let key in inputObjects) {
      if (inputObjects[key].inputField !== null && inputObjects[key].inputField !== undefined) {
        if (
          inputObjects[key].inputField.type == "checkbox" &&
          inputObjects[key].inputField.checked !== undefined
        ) {
          inputObjects[key].inputField.checked = options[key];
        } else if (inputObjects[key].inputField.value !== undefined) {
          inputObjects[key].inputField.value = options[key].toString();
          let event = new CustomEvent("input");
          event.disableUpdate = true;
          inputObjects[key].inputField.dispatchEvent(event);
        }
      }
    }
  });
}

function OnOptionsChange() {
  let options = {};
  for (let key in inputObjects) {
    if (inputObjects[key].inputField !== null && inputObjects[key].inputField !== undefined) {
      if (inputObjects[key].inputField.type === "checkbox") {
        options[key] = inputObjects[key].inputField.checked;
      } else if (inputObjects[key].inputField.type === "range") {
        options[key] = parseInt(inputObjects[key].inputField.value);
      } else if (inputObjects[key].inputField.type === "text") {
        options[key] = inputObjects[key].inputField.value;
      }
    }
  }

  chrome.storage.sync.set(options);
  chrome.tabs.query({}, function (tabs) {
    tabs.forEach(function (tab) {
      chrome.tabs.sendMessage(tab.id, {
        type: "UpdateOptions",
        data: options,
      });
    });
  });
}

function InitOptions() {
  for (let key in inputObjects) {
    inputObjects[key].inputField = document.getElementById(key);
  }

  const sliderProps = {
    fill: "#5d3fd3",
    background: "rgba(255, 255, 255, 0.214)",
  };

  document.querySelectorAll(".options-slider").forEach(function (slider) {
    const title = slider.querySelector(".title");
    const input = slider.querySelector("input");
    if (title == null || input == null) return;
    input.min = slider.getAttribute("data-min");
    input.max = slider.getAttribute("data-max");
    input.addEventListener("input", (event) => {
      const value = parseInt(input.value);
      const minValue = parseInt(input.min);
      const maxValue = parseInt(input.max);
      const percent = ((value - minValue) / (maxValue - minValue)) * 100;
      const bg = `linear-gradient(90deg, ${sliderProps.fill} ${percent}%, ${sliderProps.background} ${percent + 0.1}%)`;
      input.style.background = bg;
      title.setAttribute("data-value", input.value);
      if (!event.disableUpdate) {
        OnOptionsChange(); // Trigger change immediately
      }
    });
  });

  document.querySelectorAll(".options-checkbox").forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
      OnOptionsChange(); // Trigger change immediately
    });
  });

  document.querySelectorAll(".options-text").forEach(function (text) {
    text.addEventListener("change", function () {
      OnOptionsChange(); // Trigger change immediately
    });
  });

  RestoreOptions();
}

window.onload = function () {
  chrome.storage.local.get(["theme"]).then((result) => {
    if (result.theme === "d") {
      document.body.style.backgroundColor = "#292A2D";
      document.getElementsByClassName(
        "settings-content"
      )[0].style.backgroundColor = "#292A2D";
    } else if (result.theme === "ud") {
      document.body.style.backgroundColor = "#000";
      document.getElementsByClassName(
        "settings-content"
      )[0].style.backgroundColor = "#000";
    }
  });

  document.getElementById("popoutb").addEventListener("click", function () {
    chrome.tabs.query({}, function (tabs) {
      tabs.forEach(function (tab) {
        chrome.tabs.sendMessage(tab.id, {
          type: "popout",
          data: "popout",
        });
      });
    });
  });

  document.getElementById("ultradark").addEventListener("click", function () {
    chrome.storage.local.set({
      theme: "ud",
    });
    document.body.style.backgroundColor = "#000";
    document.getElementsByClassName(
      "settings-content"
    )[0].style.backgroundColor = "#000";
  });

  document.getElementById("dark").addEventListener("click", function () {
    chrome.storage.local.set({
      theme: "d",
    });
    document.body.style.backgroundColor = "#292A2D";
    document.getElementsByClassName(
      "settings-content"
    )[0].style.backgroundColor = "#292A2D";
  });

  document.getElementById("settingsb").addEventListener("click", function () {
    document.getElementsByClassName("ModalBackground")[0].style.animation =
      "fadein 0.5s linear forwards";
    document.getElementsByClassName("ModalBackground")[0].style.display =
      "block";
  });

  document
    .getElementsByClassName("ModalBackground")[0]
    .addEventListener("click", function (event) {
      if (
        event.target == document.getElementsByClassName("ModalBackground")[0]
      ) {
        document.getElementsByClassName("ModalBackground")[0].style.animation =
          "fadeout 0.5s linear forwards";
        setTimeout(() => {
          document.getElementsByClassName("ModalBackground")[0].style.display =
            "none";
        }, 500);
      }
    });

  document
    .getElementsByClassName("close")[0]
    .addEventListener("click", function () {
      document.getElementsByClassName("ModalBackground")[0].style.animation =
        "fadeout 0.5s linear forwards";
      setTimeout(() => {
        document.getElementsByClassName("ModalBackground")[0].style.display =
          "none";
      }, 500);
    });

  document.getElementById("learnmore").addEventListener("click", function () {
    document.getElementsByClassName("lmco")[0].style.animation =
      "fadein 0.5s linear forwards";
    document.getElementsByClassName("lmco")[0].style.display = "block";
  });

  document
    .getElementsByClassName("lmco")[0]
    .addEventListener("click", function (event) {
      if (event.target == document.getElementsByClassName("lmco")[0]) {
        document.getElementsByClassName("lmco")[0].style.animation =
          "fadeout 0.5s linear forwards";
        setTimeout(() => {
          document.getElementsByClassName("lmco")[0].style.display = "none";
        }, 500);
      }
    });

  document.getElementById("lmc").addEventListener("click", function () {
    document.getElementsByClassName("lmco")[0].style.animation =
      "fadeout 0.5s linear forwards";
    setTimeout(() => {
      document.getElementsByClassName("lmco")[0].style.display = "none";
    }, 500);
  });

  // Export Config
  document.getElementById("export-btn").addEventListener("click", function () {
    chrome.storage.sync.get(null, function (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "config.mint";
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  // Import Config
  document.getElementById("import-btn").addEventListener("click", function () {
    const fileInput = document.getElementById("import-file-input");
    fileInput.click();
  });

  document.getElementById("import-file-input").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const config = JSON.parse(e.target.result);
          chrome.storage.sync.set(config, function () {
            RestoreOptions(); // Update the UI with the new settings
            alert("Configuration imported successfully!");
          });
        } catch (error) {
          alert("Invalid configuration file.");
        }
      };
      reader.readAsText(file);
    }
  });

  InitOptions();
};
