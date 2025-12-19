
 // This script uses the BLE scan functionality in scripting
 // Selects Shelly BLU Buttons from the aired advertisements, decodes
 // the service data payload and determine the button press type and access the correct cooresponding web URL for actions
 // You can rely only on the address filtering and forego device name matching

function GetWebURL(ExternalURL) {
  Shelly.call(
  "HTTP.GET", 
  {"url": ExternalURL},
  //function (response) {
  // if (response && response.code && response.code === 200) {
       //print(JSON.stringify(response.body));
      // Shelly.emitEvent("HTTP-result", response.body);
    //}
    //else {
    //   console.log("Error: HTTP request failed.");
    //}
 // }
  );
}

function onButtonPressFirstFloor(BTHparsed) {
  //console.log(JSON.stringify(BTHparsed.button));
  //console.log(JSON.stringify(BTHparsed.addr));
   //console.log(JSON.stringify(BTHparsed.battery));
  
  if (JSON.stringify(BTHparsed.button) === "[1,0,0,0]") {
    //console.log("FirstFloor Button #1 - Single Press");
    GetWebURL("http://192.168.1.101:81/config/shelly_living_room_commands.php?command=all&batt="+JSON.stringify(BTHparsed.battery));
  }
  
  if (JSON.stringify(BTHparsed.button) === "[0,1,0,0]") {
    //console.log("FirstFloor Button #2 - Single Press");
    GetWebURL("http://192.168.1.101:81/config/shelly_living_room_commands.php?command=sled&batt="+JSON.stringify(BTHparsed.battery));
  }
  
  if (JSON.stringify(BTHparsed.button) === "[0,0,1,0]") {
    //console.log("FirstFloor Button #3 - Single Press");
    GetWebURL("http://192.168.1.101:81/config/shelly_living_room_commands.php?command=triple&batt="+JSON.stringify(BTHparsed.battery));
  }
  
  if (JSON.stringify(BTHparsed.button) === "[0,0,0,1]") {
    //console.log("FirstFloor Button #4 - Single Press");
    GetWebURL("http://192.168.1.101:81/config/shelly_living_room_commands.php?command=dave&batt="+JSON.stringify(BTHparsed.battery));
  }
  
 //   addr: BTHparsed.addr,
 //   rssi: BTHparsed.rssi,
 //   Button: BTHparsed.button,
 //   Battery: BTHparsed.battery,
}

function onButtonPressSecondFloor(BTHparsed) {
  //console.log(JSON.stringify(BTHparsed.button));
  //console.log(JSON.stringify(BTHparsed.addr));
  
  if (JSON.stringify(BTHparsed.button) === "[1,0,0,0]") {
    //console.log("SecondFloor Button #1 - Single Press");
    GetWebURL("http://192.168.1.101:81/config/shelly_SF_living_room_commands.php?command=all&batt="+JSON.stringify(BTHparsed.battery));
  }
  
  if (JSON.stringify(BTHparsed.button) === "[0,1,0,0]") {
    //console.log("SecondFloor Button #2 - Single Press");
    GetWebURL("http://192.168.1.101:81/config/shelly_SF_living_room_commands.php?command=main&batt="+JSON.stringify(BTHparsed.battery));
  }
  
  if (JSON.stringify(BTHparsed.button) === "[0,0,1,0]") {
    //console.log("SecondFloor Button #3 - Single Press");
    GetWebURL("http://192.168.1.101:81/config/shelly_SF_living_room_commands.php?command=plant&batt="+JSON.stringify(BTHparsed.battery));
  }
  
  if (JSON.stringify(BTHparsed.button) === "[0,0,0,1]") {
    //console.log("SecondFloor Button #4 - Single Press");
    GetWebURL("http://192.168.1.101:81/config/shelly_SF_living_room_commands.php?command=hearts&batt="+JSON.stringify(BTHparsed.battery));
  }
}

let CONFIG = {
  actions: [
    {
      cond: {
        addr: "38:68:47:fd:76:b6",
      },
      action: onButtonPressFirstFloor,
    },
    {
      cond: {
        addr: "f8:55:77:0a:64:55",
      },
      action: onButtonPressSecondFloor,
    },
  ],
};
// END OF CHANGE DO BNOT EDIT THE CODE PAST THIS POINT
const SCAN_PARAM_WANT = {
  duration_ms: BLE.Scanner.INFINITE_SCAN,
  active: true,
}

const ALLTERCO_MFD_ID_STR = "0ba9";
const BTHOME_SVC_ID_STR = "fcd2";


const uint8 = 0;
const int8 = 1;
const uint16 = 2;
const int16 = 3;
const uint24 = 4;
const int24 = 5;

// The BTH object defines the structure of the BTHome data
const BTH = {
  0x00: { n: "pid", t: uint8 },
  0x01: { n: "battery", t: uint8, u: "%" },
  0x02: { n: "temperature", t: int16, f: 0.01, u: "tC" },
  0x03: { n: "humidity", t: uint16, f: 0.01, u: "%" },
  0x05: { n: "illuminance", t: uint24, f: 0.01 },
  0x21: { n: "motion", t: uint8 },
  0x2d: { n: "window", t: uint8 },
  0x2e: { n: "humidity", t: uint8, u: "%" },
  0x3a: { n: "button", t: uint8 },
  0x3f: { n: "rotation", t: int16, f: 0.1 },
  0x45: { n: "temperature", t: int16, f: 0.1, u: "tC" },
};

function getByteSize(type) {
  if (type === uint8 || type === int8) return 1;
  if (type === uint16 || type === int16) return 2;
  if (type === uint24 || type === int24) return 3;
  //impossible as advertisements are much smaller;
  return 255;
}

// functions for decoding and unpacking the service data from Shelly BLU devices
const BTHomeDecoder = {
  utoi: function (num, bitsz) {
    const mask = 1 << (bitsz - 1);
    return num & mask ? num - (1 << bitsz) : num;
  },
  getUInt8: function (buffer) {
    return buffer.at(0);
  },
  getInt8: function (buffer) {
    return this.utoi(this.getUInt8(buffer), 8);
  },
  getUInt16LE: function (buffer) {
    return 0xffff & ((buffer.at(1) << 8) | buffer.at(0));
  },
  getInt16LE: function (buffer) {
    return this.utoi(this.getUInt16LE(buffer), 16);
  },
  getUInt24LE: function (buffer) {
    return (
      0x00ffffff & ((buffer.at(2) << 16) | (buffer.at(1) << 8) | buffer.at(0))
    );
  },
  getInt24LE: function (buffer) {
    return this.utoi(this.getUInt24LE(buffer), 24);
  },
  getBufValue: function (type, buffer) {
    if (buffer.length < getByteSize(type)) return null;
    let res = null;
    if (type === uint8) res = this.getUInt8(buffer);
    if (type === int8) res = this.getInt8(buffer);
    if (type === uint16) res = this.getUInt16LE(buffer);
    if (type === int16) res = this.getInt16LE(buffer);
    if (type === uint24) res = this.getUInt24LE(buffer);
    if (type === int24) res = this.getInt24LE(buffer);
    return res;
  },

  // Unpacks the service data buffer from a Shelly BLU device
  unpack: function (buffer) {
    //beacons might not provide BTH service data
    if (typeof buffer !== "string" || buffer.length === 0) return null;
    let result = {};
    let _dib = buffer.at(0);
    result["encryption"] = _dib & 0x1 ? true : false;
    result["BTHome_version"] = _dib >> 5;
    if (result["BTHome_version"] !== 2) return null;
    //can not handle encrypted data
    if (result["encryption"]) return result;
    buffer = buffer.slice(1);

    let _bth;
    let _value;
    while (buffer.length > 0) {
      _bth = BTH[buffer.at(0)];
      if (typeof _bth === "undefined") {
        //console.log("BTH: Unknown type");
        break;
      }
      buffer = buffer.slice(1);
      _value = this.getBufValue(_bth.t, buffer);
      if (_value === null) break;
      if (typeof _bth.f !== "undefined") _value = _value * _bth.f;

      if (typeof result[_bth.n] === "undefined") {
        result[_bth.n] = _value;
      }
      else {
        if (Array.isArray(result[_bth.n])) {
          result[_bth.n].push(_value);
        }
        else {
          result[_bth.n] = [
            result[_bth.n],
            _value
          ];
        }
      }

      buffer = buffer.slice(getByteSize(_bth.t));
    }
    return result;
  },
};

let ShellyBLUParser = {
  getData: function (res) {
    let result = BTHomeDecoder.unpack(res.service_data[BTHOME_SVC_ID_STR]);
    result.addr = res.addr;
    result.rssi = res.rssi;
    return result;
  },
};

let last_packet_id = 0x100;
function scanCB(ev, res) {
  if (ev !== BLE.Scanner.SCAN_RESULT) return;
  // skip if there is no service_data member
  if (
    typeof res.service_data === "undefined" ||
    typeof res.service_data[BTHOME_SVC_ID_STR] === "undefined"
  )
    return;
  // skip if we are looking for name match but don't have active scan as we don't have name
  if (
    typeof CONFIG.shelly_blu_name_prefix !== "undefined" &&
    (typeof res.local_name === "undefined" ||
      res.local_name.indexOf(CONFIG.shelly_blu_name_prefix) !== 0)
  )
    return;
  // skip if we don't have address match
  if (
    typeof CONFIG.shelly_blu_address !== "undefined" &&
    CONFIG.shelly_blu_address !== res.addr
  )
    return;
  let BTHparsed = ShellyBLUParser.getData(res);
  // skip if parsing failed
  if (BTHparsed === null) {
    //console.log("Failed to parse BTH data");
    return;
  }
  // skip, we are deduping results
  if (last_packet_id === BTHparsed.pid) return;
  last_packet_id = BTHparsed.pid;
  //console.log("Shelly BTH packet: ", JSON.stringify(BTHparsed));
  // execute actions from CONFIG
  let aIdx = null;
  for (aIdx in CONFIG.actions) {
    // skip if no condition defined
    if (typeof CONFIG.actions[aIdx]["cond"] === "undefined") continue;
    let cond = CONFIG.actions[aIdx]["cond"];
    let cIdx = null;
    let run = true;
    for (cIdx in cond) {
      if (typeof BTHparsed[cIdx] === "undefined") run = false;
      if (BTHparsed[cIdx] !== cond[cIdx]) run = false;
    }
    // if all conditions evaluated to true then execute
    if (run) CONFIG.actions[aIdx]["action"](BTHparsed);
  }
}

function init() {
  // get the config of ble component
  const BLEConfig = Shelly.getComponentConfig("ble");

  // exit if the BLE isn't enabled
  if (!BLEConfig.enable) {
    //console.log(
      "Error: The Bluetooth is not enabled, please enable it from settings"
    );
    return;
  }

  // check if the scanner is already running
  if (BLE.Scanner.isRunning()) {
    //console.log("Info: The BLE gateway is running, the BLE scan configuration is managed by the device");
  }
  else {
    // start the scanner
    const bleScanner = BLE.Scanner.Start(SCAN_PARAM_WANT);

    if (!bleScanner) {
     // console.log("Error: Can not start new scanner");
    }
  }

  // subscribe a callback to BLE scanner
  BLE.Scanner.Subscribe(scanCB);
}


init();

