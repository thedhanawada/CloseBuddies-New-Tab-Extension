"use strict";
const store = chrome.storage.sync;
let dom = document.getElementById("bgimg");
function toggleBackground() {
  console.log("Toggle button clicked!");
  store.get(["useDefaultBackground"], (result) => {
    const useDefault = result.useDefaultBackground || false;
    store.set({ useDefaultBackground: !useDefault }, () => {
      setBackgroundImage();
    });
  });
}
function setBackgroundImage() {
  store.get(["useDefaultBackground"], (result) => {
    const useDefault = result.useDefaultBackground || false;
    if (useDefault) {
      const imageUrl = chrome.runtime.getURL("default.jpg");
      setDomBackground(imageUrl);
    } else {
      let rand = Math.floor(Math.random() * 3) + 1;
      let imagePath = `friends${rand}.jpg`;
      let imageUrl = chrome.runtime.getURL(imagePath);
      setDomBackground(imageUrl);
    }
  });
}
function setDomBackground(imageUrl) {
  let img = new Image();
  img.onload = function () {
    dom.style.background = `url(${imageUrl}) center/cover fixed no-repeat`;
    applyOverlay();
  };
  img.src = imageUrl;
}
function applyOverlay() {
  // Remove existing overlays if any
  const existingOverlayTop = document.getElementById("overlayTop");
  const existingOverlayBottom = document.getElementById("overlayBottom");
  if (existingOverlayTop) {
    existingOverlayTop.remove();
  }
  if (existingOverlayBottom) {
    existingOverlayBottom.remove();
  }

  // Create and apply new overlay for the top section
  let overlayTop = document.createElement("div");
  overlayTop.id = "overlayTop";
  overlayTop.style.position = "absolute";
  overlayTop.style.top = 0;
  overlayTop.style.left = 0;
  overlayTop.style.width = "100%";
  overlayTop.style.height = "50px";
  overlayTop.style.backgroundColor = "rgba(0,0,0,0.5)";
  overlayTop.style.zIndex = 1;
  dom.appendChild(overlayTop);

  // Create and apply new overlay for the bottom section
  let overlayBottom = document.createElement("div");
  overlayBottom.id = "overlayBottom";
  overlayBottom.style.position = "absolute";
  overlayBottom.style.top = "50px";
  overlayBottom.style.left = 0;
  overlayBottom.style.width = "100%";
  overlayBottom.style.height = "calc(100% - 50px)";
  overlayBottom.style.backgroundColor = "rgba(0,0,0,0.5)";
  overlayBottom.style.zIndex = 1;
  dom.appendChild(overlayBottom);
}


document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("toggleButton")
    .addEventListener("click", toggleBackground);
});


// Set the initial background image
setBackgroundImage();

(function () {
  let dom = document.getElementById("bgimg");
  dom.style.background = "linear-gradient(220.55deg, #5D85A6 0%, #0E2C5E 100%)";
  dom.style.backgroundRepeat = "no-repeat";
  dom.style.backgroundSize = "cover";
  let rand = Math.floor(Math.random() * 3) + 1;
  let imagePath = `friends${rand}.jpg`; // change the file name to match your image file name
  let imageUrl = chrome.runtime.getURL(imagePath);
  let img = new Image();
  img.onload = function () {
    dom.style.background = `url(${imageUrl}) center/cover fixed no-repeat`;
    dom.style.position = "relative";
    let overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0,0,0,0.5)"; // change the opacity to adjust the darkness
    overlay.style.zIndex = 1; // Add z-index for the overlay
    dom.appendChild(overlay);
  };
  img.src = imageUrl;
})();
(function () {
  function checkTime(i) {
    return i < 10 ? "0" + i : i;
  }
  function startTime() {
    var today = new Date(),
      h = checkTime(today.getHours()),
      m = checkTime(today.getMinutes()),
      s = checkTime(today.getSeconds());
    let time = h + ":" + m;
    document.getElementById("time").innerHTML = time;
    setTimeout(function () {
      startTime();
    }, 500);
  }
  startTime();
})();
class Init {
  constructor() {
    this.batteryconnectionDetails = null;
    this.deviceDetails = null;
    this.dateDetails = null;
  }
}
class TabAction extends Init {
  constructor(props) {
    super(props);
  }
  getAllDeviceDetails(callback) {
    chrome.sessions.getDevices((res) => {
      this.deviceDetails = res;
      callback(res);
    });
  }
  getbatteryconnectionDetails() {
    let promise = insertconnectionDetails();
    promise.then((res) => {
      this.batteryconnectionDetails = res;
    });
  }
  setDateDetails() {
    this.dateDetails = getdateDetails();
  }
}

let tab = new TabAction();
tab.getbatteryconnectionDetails();
tab.getAllDeviceDetails((devices) => {
  insertDevicesinDom(devices);
});
tab.setDateDetails();
insertinDom();
function insertinDom() {
  document.getElementById(
    "date"
  ).innerHTML = `${tab.dateDetails.day}, ${tab.dateDetails.month} ${tab.dateDetails.date}`;
}
function insertDevicesinDom(devices) {
  let format =
    "<span style='font-size: 2vh;padding: 8px;;text-shadow: 0 0 2px gray;'><strong style='font-size: 2vh;text-shadow: 0 0 2px gray;'>DEVICE</strong> > LINK<span>";
  for (let i = 0; i < devices.length; i++) {
    let lastSession = devices[i].sessions;
    if (lastSession.length > 0) {
      lastSession = lastSession[0];
      let orgLink = lastSession.window["tabs"][0]["url"];
      let sessionLink = orgLink.substring(0, 20);

      sessionLink = `<a href="${orgLink}" target='_blank' rel='noopenner' style='color:white;text-decoration: none;'>${sessionLink}</a>`;

      let domContent = format.replace("DEVICE", devices[i].deviceName);
      domContent = domContent.replace("LINK", sessionLink);
      document.getElementById("device").innerHTML += domContent;
    }
  }
}
async function insertconnectionDetails() {
  const date = new Date();
  const battery = await navigator.getBattery();
  const connection = navigator.onLine
    ? "~" + navigator.connection.downlink + " Mbps "
    : "Offline ";
  const batteryHealth =
    (battery.level * 100).toFixed() +
    "% " +
    (battery.charging ? "Charging" : "Battery");
  document.getElementById(
    "battery"
  ).innerHTML = `${connection} - ${batteryHealth}`;
  return { connection: connection, battery: batteryHealth };
}
function getdateDetails() {
  var today = new Date();
  var day = today.getDay();
  var dd = today.getDate();
  var mm = today.getMonth();
  var yyyy = today.getFullYear();
  var dL = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  var mL = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return {
    day: dL[day],
    month: mL[mm],
    date: dd,
    year: yyyy,
  };
}
function timeTo12HrFormat(time) {
  let time_part_array = time.split(":");
  let ampm = "AM";
  if (time_part_array[0] >= 12) {
    ampm = "PM";
  }
  if (time_part_array[0] > 12) {
    time_part_array[0] = time_part_array[0] - 12;
  }
  let formatted_time = `${time_part_array[0]}:${time_part_array[1]} <span class="am_pm">${ampm}<span>`;
  return formatted_time;
}
