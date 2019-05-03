"use strict";

exports.__esModule = true;
exports.default = undefined;

var _threeModule = require("../three/build/three.module.js");

var _vrmanager = require("./vrmanager.js");

var _vrmanager2 = _interopRequireDefault(_vrmanager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WebXRBoilerPlate = function () {
    function WebXRBoilerPlate(options) {
        _classCallCheck(this, WebXRBoilerPlate);

        this.listeners = {};
        this.container = options.container;
        this.options = options;
        this.resizeOnNextRepaint = false;
    }

    WebXRBoilerPlate.prototype.addEventListener = function addEventListener(type, cb) {
        if (!this.listeners[type]) this.listeners[type] = [];
        this.listeners[type].push(cb);
    };

    WebXRBoilerPlate.prototype.init = function init() {
        var _this = this;

        this.scene = new _threeModule.Scene();
        this.camera = new _threeModule.PerspectiveCamera(70, // fov
        this.container.clientWidth / this.container.clientHeight, //aspect ratio of the container
        this.options.near || 0.1, //near edge of viewing frustrum
        this.options.far || 50 // far edge of viewing frustrum
        );
        this.renderer = new _threeModule.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.gammaOutput = true;
        this.renderer.vr.enabled = true;
        this.container.appendChild(this.renderer.domElement);
        this.vrmanager = new _vrmanager2.default(this.renderer);
        this.vrmanager.addEventListener(_vrmanager.VR_DETECTED, function () {
            if (_this.listeners[_vrmanager.VR_DETECTED]) _this.listeners[_vrmanager.VR_DETECTED].forEach(function (cb) {
                return cb(_this);
            });
        });

        this.loadingManager = _threeModule.DefaultLoadingManager;

        _threeModule.DefaultLoadingManager.joshtest = true;
        _threeModule.DefaultLoadingManager.onStart = function (url, loaded, total) {
            console.log("XR: loading " + url + ".  loaded " + loaded + " of " + total);
        };
        _threeModule.DefaultLoadingManager.onLoad = function () {
            console.log("XR: loading complete");
            if (_this.listeners.loaded) _this.listeners.loaded.forEach(function (cb) {
                return cb(_this);
            });
        };
        _threeModule.DefaultLoadingManager.onProgress = function (url, loaded, total) {
            console.log("XR: prog " + url + ".  loaded " + loaded + " of " + total);
            if (_this.listeners.progress) _this.listeners.progress.forEach(function (cb) {
                return cb(loaded / total);
            });
        };
        _threeModule.DefaultLoadingManager.onError = function (url) {
            console.log("XR: error loading " + url);
        };

        this.lastSize = { width: 0, height: 0 };
        this.render = function (time) {
            if (_this.onRenderCb) _this.onRenderCb(time, _this);
            _this.checkContainerSize();
            _this.renderer.render(_this.scene, _this.camera);
        };

        this.renderer.setAnimationLoop(this.render);

        return new Promise(function (res, rej) {
            res(_this);
        });
    };

    WebXRBoilerPlate.prototype.onRender = function onRender(cb) {
        this.onRenderCb = cb;
    };

    WebXRBoilerPlate.prototype.enterVR = function enterVR() {
        this.vrmanager.enterVR();
    };

    WebXRBoilerPlate.prototype.playFullscreen = function playFullscreen() {
        this.resizeOnNextRepaint = true;
        this.container.requestFullscreen();
    };

    WebXRBoilerPlate.prototype.checkContainerSize = function checkContainerSize() {
        if (this.lastSize.width !== this.container.clientWidth || this.lastSize.height !== this.container.clientHeight) {
            this.lastSize.width = this.container.clientWidth;
            this.lastSize.height = this.container.clientHeight;
            this.camera.aspect = this.lastSize.width / this.lastSize.height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.lastSize.width, this.lastSize.height);
        }
    };

    return WebXRBoilerPlate;
}();

exports.default = WebXRBoilerPlate;
module.exports = exports["default"];