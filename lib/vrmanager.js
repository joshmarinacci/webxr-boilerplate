"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function printError(err) {
    console.log(err);
}

var VR_DETECTED = exports.VR_DETECTED = "detected";
var VR_CONNECTED = exports.VR_CONNECTED = "connected";
var VR_DISCONNECTED = exports.VR_DISCONNECTED = "disconnected";
var VR_PRESENTCHANGE = exports.VR_PRESENTCHANGE = "presentchange";
var VR_ACTIVATED = exports.VR_ACTIVATED = "activated";

var VRManager = function () {
    function VRManager(renderer) {
        var _this = this;

        _classCallCheck(this, VRManager);

        this.device = null;
        this.renderer = renderer;
        if (!this.renderer) throw new Error("VR Manager requires a valid ThreeJS renderer instance");
        this.listeners = {};

        if ('xr' in navigator) {
            console.log("has webxr");
            navigator.xr.requestDevice().then(function (device) {
                device.supportsSession({ immersive: true, exclusive: true /* DEPRECATED */ }).then(function () {
                    _this.device = device;
                    _this.fire(VR_DETECTED, {});
                }).catch(printError);
            }).catch(printError);
        } else if ('getVRDisplays' in navigator) {
            console.log("has webvr");

            window.addEventListener('vrdisplayconnect', function (event) {
                _this.device = event.display;
                _this.fire(VR_CONNECTED);
            }, false);

            window.addEventListener('vrdisplaydisconnect', function (event) {
                _this.fire(VR_DISCONNECTED);
            }, false);

            window.addEventListener('vrdisplaypresentchange', function (event) {
                _this.fire(VR_PRESENTCHANGE);
            }, false);

            window.addEventListener('vrdisplayactivate', function (event) {
                _this.device = event.display;
                _this.device.requestPresent([{ source: _this.renderer.domElement }]);
                _this.fire(VR_ACTIVATED);
            }, false);

            navigator.getVRDisplays().then(function (displays) {
                console.log("vr scanned");
                if (displays.length > 0) {

                    // showEnterVR( displays[ 0 ] );
                    console.log("found vr");
                    _this.device = displays[0];
                    _this.fire(VR_DETECTED, {});
                } else {
                    console.log("no vr at all");
                    // showVRNotFound();
                }
            }).catch(printError);
        } else {
            // no vr
            console.log("no vr at all");
        }
    }

    VRManager.prototype.addEventListener = function addEventListener(type, cb) {
        if (!this.listeners[type]) this.listeners[type] = [];
        this.listeners[type].push(cb);
    };

    VRManager.prototype.fire = function fire(type, evt) {
        if (!evt) evt = {};
        evt.type = type;
        if (!this.listeners[type]) this.listeners[type] = [];
        this.listeners[type].forEach(function (cb) {
            return cb(evt);
        });
    };

    VRManager.prototype.enterVR = function enterVR() {
        if (!this.device) {
            console.warn("tried to connect VR on an invalid device");
            return;
        }
        console.log("entering VR");
        this.renderer.vr.setDevice(this.device);

        if (this.device.isPresenting) {
            this.device.exitPresent();
        } else {
            this.device.requestPresent([{ source: this.renderer.domElement }]);
        }
    };

    return VRManager;
}();

exports.default = VRManager;