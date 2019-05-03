"use strict";

exports.__esModule = true;
exports.default = undefined;

var _threeModule = require("../three/build/three.module.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BackgroundAudioLoader = function () {
    function BackgroundAudioLoader(manager) {
        _classCallCheck(this, BackgroundAudioLoader);

        this.manager = manager !== undefined ? manager : _threeModule.DefaultLoadingManager;
    }

    BackgroundAudioLoader.prototype.load = function load(url, onLoad, onProgress, onError) {
        var _this = this;

        console.log("BGAL loading", url);

        var music = new Audio(url);
        music.autoplay = false;
        music.loop = true;
        music.controls = false;
        music.preload = 'auto';
        music.volume = 0.75;
        music.addEventListener('canplay', function () {
            onLoad(music);
            _this.manager.itemEnd(url);
        });

        this.manager.itemStart(url);
    };

    return BackgroundAudioLoader;
}();

exports.default = BackgroundAudioLoader;
module.exports = exports["default"];