'use strict';

exports.__esModule = true;
exports.default = undefined;

var _threeModule = require('three');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VRStats = function (_Group) {
    _inherits(VRStats, _Group);

    function VRStats(app) {
        _classCallCheck(this, VRStats);

        var _this = _possibleConstructorReturn(this, _Group.call(this));

        _this.renderer = app.renderer;
        var can = document.createElement('canvas');
        can.width = 256;
        can.height = 128;
        _this.canvas = can;
        var c = can.getContext('2d');
        c.fillStyle = '#00ffff';
        c.fillRect(0, 0, can.width, can.height);
        var ctex = new _threeModule.CanvasTexture(can);
        var mesh = new _threeModule.Mesh(new _threeModule.PlaneGeometry(1, 0.5), new _threeModule.MeshBasicMaterial({ map: ctex }));
        _this.position.z = -3;
        _this.position.y = 1.5;
        _this.add(mesh);
        _this.cmesh = mesh;

        _this.last = 0;
        _this.lastFrame = 0;
        _this.customProps = {};
        return _this;
    }

    VRStats.prototype.update = function update(time) {
        var _this2 = this;

        if (time - this.last > 300) {
            // console.log("updating",this.renderer.info)
            // console.log(`stats calls:`,this.renderer.info)

            var fps = (this.renderer.info.render.frame - this.lastFrame) * 1000 / (time - this.last);
            // console.log(fps)

            var c = this.canvas.getContext('2d');
            c.fillStyle = 'white';
            c.fillRect(0, 0, this.canvas.width, this.canvas.height);
            c.fillStyle = 'black';
            c.font = '16pt sans-serif';
            c.fillText('calls: ' + this.renderer.info.render.calls, 3, 20);
            c.fillText('tris : ' + this.renderer.info.render.triangles, 3, 40);
            c.fillText('fps : ' + fps.toFixed(2), 3, 60);
            Object.keys(this.customProps).forEach(function (key, i) {
                var val = _this2.customProps[key];
                c.fillText(key + ' : ' + val, 3, 80 + i * 20);
            });
            this.cmesh.material.map.needsUpdate = true;
            this.last = time;
            this.lastFrame = this.renderer.info.render.frame;
        }
    };

    VRStats.prototype.setProperty = function setProperty(name, value) {
        this.customProps[name] = value;
    };

    return VRStats;
}(_threeModule.Group);

exports.default = VRStats;
module.exports = exports['default'];