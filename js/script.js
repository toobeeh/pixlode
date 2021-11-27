var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var getImageFromURL = function (url) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                var remote = new Image();
                remote.crossOrigin = "Anonymous";
                remote.addEventListener("load", function () {
                    resolve(remote);
                });
                remote.src = "https://api.allorigins.win/raw?url=" + url;
            })];
    });
}); };
var waitMs = function (timeout) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                setTimeout(function () { return resolve(true); }, timeout);
            })];
    });
}); };
var Particle = /** @class */ (function () {
    function Particle(color, width, height) {
        this.animationTime = 1000;
        this.animationFunction = 'cubic-bezier(0, .9, .57, 1)';
        this.object = document.createElement("particle");
        this.object.style.backgroundColor = color;
        this.object.style.width = width + "px";
        this.object.style.height = height + "px";
    }
    Particle.prototype.setSize = function (width, height) {
        this.object.style.width = width + "px";
        this.object.style.height = height + "px";
    };
    Particle.prototype.animate = function (distance, fromPageX, fromPageY, down, left, right) {
        var _this = this;
        if (down === void 0) { down = true; }
        if (left === void 0) { left = true; }
        if (right === void 0) { right = true; }
        document.body.appendChild(this.object);
        var directionY = Math.random() > 0.5 && down ? 1 : -1;
        var directionX = left && right ? (Math.random() > 0.5 && right && !left ? 1 : -1) : 0;
        var dY = Math.random() * distance;
        var dX = Math.sqrt(Math.pow(distance, 2) - Math.pow(dY, 2));
        var animation = this.object.animate([
            {
                transform: "translate(" + fromPageX + "px, " + fromPageY + "px)",
                opacity: 1
            },
            {
                transform: "translate(" + (fromPageX + dX * directionX) + "px, " + (fromPageY + dY * directionY) + "px)",
                opacity: 0
            }
        ], {
            duration: 500 + Math.random() * this.animationTime,
            easing: this.animationFunction
        });
        animation.onfinish = function () {
            _this.object.remove();
        };
    };
    return Particle;
}());
var ImageParticles = /** @class */ (function () {
    function ImageParticles(imageCanvas) {
        this.particleMap = [];
        this.canvas = imageCanvas;
        this.canvasContext = this.canvas.getContext("2d");
        this.imageData = this.canvasContext.getImageData(0, 0, this.canvas.width, this.canvas.height);
        for (var index = 0; index < this.imageData.data.length; index += 4) {
            var rgbArray = [
                this.imageData.data[index],
                this.imageData.data[index + 1],
                this.imageData.data[index + 2],
                this.imageData.data[index + 3]
            ];
            var color = "rgba(" + rgbArray[0] + "," + rgbArray[1] + "," + rgbArray[2] + "," + rgbArray[3] + ")";
            var pushObj = { particle: new Particle(color, 10, 10), index: index, rgba: rgbArray };
            if (rgbArray[3] > 0)
                this.particleMap.push(pushObj);
            else
                this.particleMap.push(null);
        }
    }
    ImageParticles.prototype.setPixel = function (startIndex, r, g, b, a) {
        this.imageData.data[startIndex] = r;
        this.imageData.data[startIndex + 1] = g;
        this.imageData.data[startIndex + 2] = b;
        this.imageData.data[startIndex + 3] = a;
    };
    // async burst(batches: number, timeout:number){
    //     const {x, y, width, height} = this.canvas.getBoundingClientRect();
    //     const canvasPixelPerWidth = width / this.canvas.width;
    //     const canvasPixelPerHeight = height / this.canvas.height;
    //     const map = this.particleMap.filter(particle => particle != null);
    //     for (let index = 0; index < map.length; index+=batches) {
    //         for(let batchIndex = 0; batchIndex < batches; batchIndex++){
    //             const pixel = map[index + batchIndex];
    //             const row = Math.floor((pixel.index / 4) / this.canvas.width);
    //             const col = (pixel.index/4) % this.canvas.width;
    //             const startX = x + canvasPixelPerWidth * col;
    //             const startY = y + canvasPixelPerHeight * row + window.scrollY;
    //             this.setPixel(pixel.index, 0, 0, 0, 0);
    //             pixel.particle.animate(70, startX,startY, false, false, false);
    //         }
    //         this.canvasContext.putImageData(this.imageData, 0, 0);
    //         await waitMs(timeout);
    //     }
    // }
    ImageParticles.prototype.burstSized = function (blockSize, timeout) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, x, y, width, height, canvasPixelPerWidth, canvasPixelPerHeight, rowIndex, colIndex, pixel, startX, startY, blockX, blockY;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.canvas.getBoundingClientRect(), x = _a.x, y = _a.y, width = _a.width, height = _a.height;
                        canvasPixelPerWidth = width / this.canvas.width;
                        canvasPixelPerHeight = height / this.canvas.height;
                        rowIndex = 0;
                        _b.label = 1;
                    case 1:
                        if (!(rowIndex < this.canvas.height)) return [3 /*break*/, 6];
                        colIndex = 0;
                        _b.label = 2;
                    case 2:
                        if (!(colIndex < this.canvas.width)) return [3 /*break*/, 5];
                        pixel = this.particleMap[rowIndex * this.canvas.width + colIndex];
                        startX = x + canvasPixelPerWidth * colIndex;
                        startY = y + canvasPixelPerHeight * rowIndex - blockSize;
                        for (blockX = 0; blockX < blockSize; blockX++) {
                            for (blockY = 0; blockY < blockSize; blockY++) {
                                this.setPixel(rowIndex * this.canvas.width * 4 + colIndex * 4 + blockY * this.canvas.width * 4 + blockX * 4, 0, 0, 0, 0);
                            }
                        }
                        if (!(pixel != null)) return [3 /*break*/, 4];
                        pixel.particle.setSize(blockSize, blockSize);
                        pixel.particle.animationTime = 2000;
                        pixel.particle.animationFunction = "ease-out";
                        pixel.particle.animate(70, startX, startY, false, false, false);
                        this.canvasContext.putImageData(this.imageData, 0, 0);
                        return [4 /*yield*/, waitMs(timeout)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        colIndex += blockSize;
                        return [3 /*break*/, 2];
                    case 5:
                        rowIndex += blockSize;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ImageParticles.prototype.burstRows = function (rowHeight, fragmentWidth, timeout) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, x, y, width, height, canvasPixelPerWidth, canvasPixelPerHeight, rowIndex, colIndex, pixel, startX, startY, blockX, blockY;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.canvas.getBoundingClientRect(), x = _a.x, y = _a.y, width = _a.width, height = _a.height;
                        canvasPixelPerWidth = width / this.canvas.width;
                        canvasPixelPerHeight = height / this.canvas.height;
                        rowIndex = 0;
                        _b.label = 1;
                    case 1:
                        if (!(rowIndex < this.canvas.height)) return [3 /*break*/, 4];
                        for (colIndex = 0; colIndex < this.canvas.width; colIndex += fragmentWidth) {
                            pixel = this.particleMap[rowIndex * this.canvas.width + colIndex];
                            startX = x + canvasPixelPerWidth * colIndex - fragmentWidth;
                            startY = y + canvasPixelPerHeight * rowIndex - rowHeight / 2;
                            for (blockX = 0; blockX < fragmentWidth; blockX++) {
                                for (blockY = 0; blockY < rowHeight; blockY++) {
                                    this.setPixel(rowIndex * this.canvas.width * 4 + colIndex * 4 + blockY * this.canvas.width * 4 + blockX * 4, 0, 0, 0, 0);
                                }
                            }
                            if (pixel != null) {
                                pixel.particle.setSize(fragmentWidth * canvasPixelPerWidth, rowHeight * canvasPixelPerHeight);
                                pixel.particle.animationTime = 2000;
                                pixel.particle.animationFunction = "ease-out";
                                pixel.particle.animate(60, startX, startY, false, false, false);
                            }
                        }
                        this.canvasContext.putImageData(this.imageData, 0, 0);
                        return [4 /*yield*/, waitMs(timeout)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        rowIndex += rowHeight;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return ImageParticles;
}());
document.addEventListener("DOMContentLoaded", function () { return __awaiter(_this, void 0, void 0, function () {
    var query, image, canvas, particles;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                query = window.location.search.substr(1);
                return [4 /*yield*/, getImageFromURL(query)];
            case 1:
                image = _a.sent();
                canvas = document.querySelector("body main canvas");
                canvas.width = image.width;
                canvas.height = image.height;
                canvas.getContext("2d").drawImage(image, 0, 0);
                particles = new ImageParticles(canvas);
                _a.label = 2;
            case 2:
                if (!true) return [3 /*break*/, 5];
                return [4 /*yield*/, particles.burstRows(10, 10, 10)];
            case 3:
                _a.sent();
                return [4 /*yield*/, particles.burstSized(80, 0)];
            case 4:
                _a.sent();
                return [3 /*break*/, 2];
            case 5: return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=script.js.map