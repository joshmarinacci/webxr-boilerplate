"use strict";

exports.__esModule = true;
exports.Pointer = exports.POINTER_RELEASE = exports.POINTER_PRESS = exports.POINTER_MOVE = exports.POINTER_CLICK = exports.POINTER_EXIT = exports.POINTER_ENTER = undefined;

var _threeModule = require('three');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var POINTER_ENTER = exports.POINTER_ENTER = "enter";
var POINTER_EXIT = exports.POINTER_EXIT = "exit";
var POINTER_CLICK = exports.POINTER_CLICK = "click";
var POINTER_MOVE = exports.POINTER_MOVE = "move";
var POINTER_PRESS = exports.POINTER_PRESS = "press";
var POINTER_RELEASE = exports.POINTER_RELEASE = "release";

var toRad = function toRad(degrees) {
    return degrees * Math.PI / 180;
};

var Pointer = exports.Pointer = function () {
    function Pointer(app, opts) {
        _classCallCheck(this, Pointer);

        this.scene = app.scene;
        this.renderer = app.renderer;
        this.camera = app.camera;
        this.listeners = {};
        this.opts = opts || {};
        this.opts.enableLaser = this.opts.enableLaser !== undefined ? this.opts.enableLaser : true;
        this.opts.laserLength = this.opts.laserLength !== undefined ? this.opts.laserLength : 3;
        this.canvas = this.renderer.domElement;

        this.raycaster = new _threeModule.Raycaster();
        this.waitcb = null;
        this.hoverTarget = null;

        this.intersectionFilter = this.opts.intersectionFilter || function (o) {
            return true;
        };
        this.multiTarget = this.opts.multiTarget || false;

        // setup the mouse
        this.canvas.addEventListener('mousemove', this.mouseMove.bind(this));
        this.canvas.addEventListener('click', this.mouseClick.bind(this));
        this.canvas.addEventListener('mousedown', this.mouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.mouseUp.bind(this));

        //touch events
        this.canvas.addEventListener('touchstart', this.touchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.touchMove.bind(this));
        this.canvas.addEventListener('touchend', this.touchEnd.bind(this));

        // setup the VR controllers
        this.controller1 = this.renderer.vr.getController(0);
        this.controller1.addEventListener('selectstart', this.controllerSelectStart.bind(this));
        this.controller1.addEventListener('selectend', this.controllerSelectEnd.bind(this));

        this.controller2 = this.renderer.vr.getController(1);
        this.controller2.addEventListener('selectstart', this.controllerSelectStart.bind(this));
        this.controller2.addEventListener('selectend', this.controllerSelectEnd.bind(this));

        this.setMouseSimulatesController(opts.mouseSimulatesController);

        this.scene.add(this.controller1);
        this.scene.add(this.controller2);

        if (this.opts.enableLaser) {
            //create visible lines for the two controllers
            var geometry = new _threeModule.BufferGeometry();
            geometry.addAttribute('position', new _threeModule.Float32BufferAttribute([0, 0, 0, 0, 0, -this.opts.laserLength], 3));
            geometry.addAttribute('color', new _threeModule.Float32BufferAttribute([1.0, 0.5, 0.5, 0, 0, 0], 3));

            var material = new _threeModule.LineBasicMaterial({
                vertexColors: false,
                color: 0x880000,
                linewidth: 5,
                blending: _threeModule.NormalBlending
            });

            this.controller1.add(new _threeModule.Line(geometry, material));
            this.controller2.add(new _threeModule.Line(geometry, material));
        }
    }

    //override this to do something w/ the controllers on every tick


    Pointer.prototype.tick = function tick(time) {
        this.controllerMove(this.controller1);
        this.controllerMove(this.controller2);
    };

    Pointer.prototype.fire = function fire(obj, type, payload) {
        obj.dispatchEvent(payload);
    };

    Pointer.prototype.fireSelf = function fireSelf(type, payload) {
        if (!this.listeners[type]) return;
        this.listeners[type].forEach(function (cb) {
            return cb(payload);
        });
    };

    //make the camera follow the mouse in desktop mode. Helps w/ debugging.


    Pointer.prototype.cameraFollowMouse = function cameraFollowMouse(e) {
        var bounds = this.canvas.getBoundingClientRect();
        var ry = (e.clientX - bounds.left) / bounds.width * 2 - 1;
        var rx = 1 - (e.clientY - bounds.top) / bounds.height * 2;
        this.camera.rotation.y = -ry * 2;
        this.camera.rotation.x = +rx;
    };

    Pointer.prototype.mouseMove = function mouseMove(e) {
        var mouse = new _threeModule.Vector2();
        var bounds = this.canvas.getBoundingClientRect();
        mouse.x = (e.clientX - bounds.left) / bounds.width * 2 - 1;
        mouse.y = -((e.clientY - bounds.top) / bounds.height) * 2 + 1;
        this.raycaster.setFromCamera(mouse, this.camera);
        if (this.opts.mouseSimulatesController) {
            //create target from the mouse controls
            var target = new _threeModule.Vector3();
            target.x = mouse.x;
            target.y = mouse.y;
            target.z = -3;
            //convert to camera space
            target.add(this.camera.position);
            this.spot.position.copy(target);
            this.controller1.lookAt(target);
            //have to flip over because the UP is down on controllers
            var flip = new _threeModule.Quaternion().setFromAxisAngle(new _threeModule.Vector3(0, 1, 0), toRad(180));
            this.controller1.quaternion.multiply(flip);
        }
        this._processMove();

        if (this.opts.cameraFollowMouse) this.cameraFollowMouse(e);
    };

    Pointer.prototype.touchStart = function touchStart(e) {
        var _this = this;

        e.preventDefault();
        if (e.changedTouches.length <= 0) return;
        var tch = e.changedTouches[0];
        var mouse = new _threeModule.Vector2();
        var bounds = this.canvas.getBoundingClientRect();
        mouse.x = (tch.clientX - bounds.left) / bounds.width * 2 - 1;
        mouse.y = -((tch.clientY - bounds.top) / bounds.height) * 2 + 1;
        this.raycaster.setFromCamera(mouse, this.camera);
        var intersects = this.raycaster.intersectObjects(this.scene.children, true).filter(function (it) {
            return _this.intersectionFilter(it.object);
        });
        intersects.forEach(function (it, i) {
            _this.fire(it.object, POINTER_PRESS, { type: POINTER_PRESS });
        });
    };

    Pointer.prototype.touchMove = function touchMove(e) {
        e.preventDefault();
        if (e.changedTouches.length <= 0) return;
        var tch = e.changedTouches[0];
        var mouse = new _threeModule.Vector2();
        var bounds = this.canvas.getBoundingClientRect();
        mouse.x = (tch.clientX - bounds.left) / bounds.width * 2 - 1;
        mouse.y = -((tch.clientY - bounds.top) / bounds.height) * 2 + 1;
        this.raycaster.setFromCamera(mouse, this.camera);
        this._processMove();
    };

    Pointer.prototype.touchEnd = function touchEnd(e) {
        var _this2 = this;

        e.preventDefault();
        if (e.changedTouches.length <= 0) return;
        var tch = e.changedTouches[0];
        var mouse = new _threeModule.Vector2();
        var bounds = this.canvas.getBoundingClientRect();
        mouse.x = (tch.clientX - bounds.left) / bounds.width * 2 - 1;
        mouse.y = -((tch.clientY - bounds.top) / bounds.height) * 2 + 1;
        this.raycaster.setFromCamera(mouse, this.camera);
        var intersects = this.raycaster.intersectObjects(this.scene.children, true).filter(function (it) {
            return _this2.intersectionFilter(it.object);
        });
        intersects.forEach(function (it) {
            _this2.fire(it.object, POINTER_RELEASE, { type: POINTER_RELEASE, point: it.point });
        });
        this._processClick();
    };

    Pointer.prototype.controllerMove = function controllerMove(controller) {
        if (!controller.visible) return;
        var c = controller;
        var dir = new _threeModule.Vector3(0, 0, -1);
        dir.applyQuaternion(c.quaternion);
        this.raycaster.set(c.position, dir);
        this._processMove();
    };

    Pointer.prototype._processMove = function _processMove() {
        var _this3 = this;

        var intersects = this.raycaster.intersectObjects(this.scene.children, true).filter(function (it) {
            return _this3.intersectionFilter(it.object);
        });

        if (intersects.length === 0 && this.hoverTarget) {
            this.fire(this.hoverTarget, POINTER_EXIT, { type: POINTER_EXIT });
            this.hoverTarget = null;
        }
        if (intersects.length >= 1) {
            var it = intersects[0];
            var obj = it.object;
            if (!obj) return;
            this.fire(obj, POINTER_MOVE, { type: POINTER_MOVE, point: it.point, intersection: it });
            if (obj === this.hoverTarget) {
                //still inside
            } else {
                if (this.hoverTarget) this.fire(this.hoverTarget, POINTER_EXIT, { type: POINTER_EXIT });
                this.hoverTarget = obj;
                this.fire(this.hoverTarget, POINTER_ENTER, { type: POINTER_ENTER });
            }
        }
    };

    Pointer.prototype._processClick = function _processClick() {
        var _this4 = this;

        if (this.waitcb) {
            this.waitcb();
            this.waitcb = null;
            return;
        }

        var intersects = this.raycaster.intersectObjects(this.scene.children, true).filter(function (it) {
            return _this4.intersectionFilter(it.object);
        });
        if (intersects.length > 0) {
            var it = intersects[0];
            this.fire(it.object, POINTER_CLICK, { type: POINTER_CLICK, point: it.point, intersection: it });
        } else {
            this.fireSelf(POINTER_CLICK, { type: POINTER_CLICK });
        }
    };

    Pointer.prototype.mouseClick = function mouseClick(e) {
        var mouse = new _threeModule.Vector2();
        var bounds = this.canvas.getBoundingClientRect();
        mouse.x = (e.clientX - bounds.left) / bounds.width * 2 - 1;
        mouse.y = -((e.clientY - bounds.top) / bounds.height) * 2 + 1;
        this.raycaster.setFromCamera(mouse, this.camera);
        this._processClick();
    };

    Pointer.prototype.mouseDown = function mouseDown(e) {
        var _this5 = this;

        var mouse = new _threeModule.Vector2();
        var bounds = this.canvas.getBoundingClientRect();
        mouse.x = (e.clientX - bounds.left) / bounds.width * 2 - 1;
        mouse.y = -((e.clientY - bounds.top) / bounds.height) * 2 + 1;
        this.raycaster.setFromCamera(mouse, this.camera);
        var intersects = this.raycaster.intersectObjects(this.scene.children, true).filter(function (it) {
            return _this5.intersectionFilter(it.object);
        });

        intersects.forEach(function (it, i) {
            if (!_this5.multiTarget && i > 0) return;
            _this5.fire(it.object, POINTER_PRESS, { type: POINTER_PRESS, point: it.point, intersection: it });
        });
    };

    Pointer.prototype.mouseUp = function mouseUp(e) {
        var _this6 = this;

        var mouse = new _threeModule.Vector2();
        var bounds = this.canvas.getBoundingClientRect();
        mouse.x = (e.clientX - bounds.left) / bounds.width * 2 - 1;
        mouse.y = -((e.clientY - bounds.top) / bounds.height) * 2 + 1;
        this.raycaster.setFromCamera(mouse, this.camera);
        var intersects = this.raycaster.intersectObjects(this.scene.children, true).filter(function (it) {
            return _this6.intersectionFilter(it.object);
        });
        intersects.forEach(function (it, i) {
            if (!_this6.multiTarget && i > 0) return; //skip all but the first
            _this6.fire(it.object, POINTER_RELEASE, { type: POINTER_RELEASE, point: it.point, intersection: it });
        });
    };

    Pointer.prototype.controllerSelectStart = function controllerSelectStart(e) {
        var _this7 = this;

        e.target.userData.isSelecting = true;
        var intersects = this.raycaster.intersectObjects(this.scene.children, true).filter(function (it) {
            return _this7.intersectionFilter(it.object);
        });
        intersects.forEach(function (it, i) {
            if (!_this7.multiTarget && i > 0) return; //skip all but the first
            _this7.fire(it.object, POINTER_PRESS, { type: POINTER_PRESS, point: it.point, intersection: it });
        });
    };

    Pointer.prototype.controllerSelectEnd = function controllerSelectEnd(e) {
        var _this8 = this;

        e.target.userData.isSelecting = false;
        var c = e.target;
        var dir = new _threeModule.Vector3(0, 0, -1);
        dir.applyQuaternion(c.quaternion);
        this.raycaster.set(c.position, dir);
        var intersects = this.raycaster.intersectObjects(this.scene.children, true).filter(function (it) {
            return _this8.intersectionFilter(it.object);
        });
        intersects.forEach(function (it, i) {
            if (!_this8.multiTarget && i > 0) return; //skip all but the first
            _this8.fire(it.object, POINTER_RELEASE, { type: POINTER_RELEASE, point: it.point });
        });
        this._processClick();
    };

    Pointer.prototype.waitSceneClick = function waitSceneClick(cb) {
        this.waitcb = cb;
    };

    Pointer.prototype.addEventListener = function addEventListener(type, cb) {
        this.on(type, cb);
    };

    Pointer.prototype.on = function on(type, cb) {
        if (!this.listeners[type]) this.listeners[type] = [];
        this.listeners[type].push(cb);
    };

    Pointer.prototype.off = function off(type, cb) {
        this.listeners[type] = this.listeners[type].filter(function (c) {
            return c !== cb;
        });
    };

    Pointer.prototype.setMouseSimulatesController = function setMouseSimulatesController(val) {
        this.opts.mouseSimulatesController = val;
        if (this.opts.mouseSimulatesController) {
            this.controller1 = new Group();
            this.controller1.position.set(0, 1, -2);
            this.controller1.quaternion.setFromUnitVectors(_threeModule.Object3D.DefaultUp, new _threeModule.Vector3(0, 0, 1));
            this.spot = new _threeModule.Mesh(new _threeModule.SphereBufferGeometry(0.1), new _threeModule.MeshLambertMaterial({ color: 'red' }));
            this.scene.add(this.spot);
        } else {}
    };

    return Pointer;
}();