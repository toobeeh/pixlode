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
        var directionX = left && right ? (Math.random() > 0.5 ? 1 : -1) : left ? -1 : right ? 1 : 0;
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
var ParticlePosition = /** @class */ (function () {
    function ParticlePosition(particle, index, rgba) {
        this.particle = particle;
        this.index = index;
        this.rgba = rgba;
    }
    return ParticlePosition;
}());
var ImageParticles = /** @class */ (function () {
    function ImageParticles(imageCanvas, animationConfiguration) {
        if (animationConfiguration === void 0) { animationConfiguration = null; }
        this.particleMap = [];
        this.animationConfig = {
            time: 1000,
            distance: 100,
            function: "ease-out",
            down: false,
            left: false,
            right: false
        };
        this.canvas = imageCanvas;
        this.canvasContext = this.canvas.getContext("2d");
        this.imageData = this.canvasContext.getImageData(0, 0, this.canvas.width, this.canvas.height);
        if (animationConfiguration != null)
            this.animationConfig = animationConfiguration;
        for (var index = 0; index < this.imageData.data.length; index += 4) {
            var rgbArray = [
                this.imageData.data[index],
                this.imageData.data[index + 1],
                this.imageData.data[index + 2],
                this.imageData.data[index + 3]
            ];
            var color = "rgba(" + rgbArray[0] + "," + rgbArray[1] + "," + rgbArray[2] + "," + rgbArray[3] + ")";
            var particlePosition = new ParticlePosition(new Particle(color, 10, 10), index, rgbArray);
            if (rgbArray[3] > 0)
                this.particleMap.push(particlePosition);
            else
                this.particleMap.push(null);
        }
    }
    ImageParticles.prototype.refreshImageData = function () {
        this.imageData = this.canvasContext.getImageData(0, 0, this.canvas.width, this.canvas.height);
    };
    ImageParticles.prototype.setAnimationConfiguration = function (config) {
        this.animationConfig = config;
    };
    ImageParticles.prototype.setPixel = function (startIndex, r, g, b, a) {
        var wasTransparent = this.imageData.data[startIndex + 3] == 0;
        this.imageData.data[startIndex] = r;
        this.imageData.data[startIndex + 1] = g;
        this.imageData.data[startIndex + 2] = b;
        this.imageData.data[startIndex + 3] = a;
        return wasTransparent;
    };
    ImageParticles.prototype.getPixel = function (startIndex) {
        return [
            this.imageData.data[startIndex],
            this.imageData.data[startIndex + 1],
            this.imageData.data[startIndex + 2],
            this.imageData.data[startIndex + 3]
        ];
    };
    ImageParticles.prototype.animateParticle = function (particle, startX, startY, width, height) {
        particle.setSize(width, height);
        particle.animationTime = this.animationConfig.time;
        particle.animationFunction = this.animationConfig.function;
        particle.animate(300, startX, startY, this.animationConfig.down, this.animationConfig.left, this.animationConfig.right);
    };
    ImageParticles.prototype.getCanvasPixelProperties = function () {
        var _a = this.canvas.getBoundingClientRect(), x = _a.x, y = _a.y, width = _a.width, height = _a.height;
        var canvasPixelPerWidth = width / this.canvas.width;
        var canvasPixelPerHeight = height / this.canvas.height;
        return { x: x, y: y, width: width, height: height, canvasPixelPerWidth: canvasPixelPerWidth, canvasPixelPerHeight: canvasPixelPerHeight };
    };
    ImageParticles.prototype.getFragmentFromCanvasMatrix = function (startPixelIndex, fragmentWidth, fragmentHeight, canvasMatrix) {
        var indexArray = [];
        for (var row = 0; row < fragmentHeight; row++) {
            for (var col = 0; col < fragmentWidth; col++) {
                indexArray.push(startPixelIndex + row * this.canvas.width + col);
            }
        }
        return indexArray;
    };
    ImageParticles.prototype.calculatePagePosition = function (canvasProps, canvasDataArrayIndex) {
        var startX = canvasProps.x + canvasProps.canvasPixelPerWidth * ((canvasDataArrayIndex / 4) % this.canvas.width);
        var startY = canvasProps.y + canvasProps.canvasPixelPerHeight * Math.floor((canvasDataArrayIndex / 4) / this.canvas.width);
        return { x: startX, y: startY };
    };
    ImageParticles.prototype.burstDown = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, x, y, width, height, canvasProps, fragmentHeight, fragmentWidth, groupSplits, groupTimeout, rowIndex, colIndex, pixel, startX, startY, blockX, blockY;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.canvas.getBoundingClientRect(), x = _a.x, y = _a.y, width = _a.width, height = _a.height;
                        canvasProps = this.getCanvasPixelProperties();
                        fragmentHeight = config.fragmentHeight, fragmentWidth = config.fragmentWidth, groupSplits = config.groupSplits, groupTimeout = config.groupTimeout;
                        rowIndex = 0;
                        _b.label = 1;
                    case 1:
                        if (!(rowIndex < this.canvas.height)) return [3 /*break*/, 8];
                        colIndex = 0;
                        _b.label = 2;
                    case 2:
                        if (!(colIndex < this.canvas.width)) return [3 /*break*/, 5];
                        pixel = this.particleMap[rowIndex * this.canvas.width + colIndex];
                        startX = x + canvasProps.canvasPixelPerWidth * colIndex - fragmentWidth;
                        startY = y + canvasProps.canvasPixelPerHeight * rowIndex;
                        // set pixels of fragment
                        for (blockX = 0; blockX < fragmentWidth; blockX++) {
                            for (blockY = 0; blockY < fragmentHeight; blockY++) {
                                this.setPixel(rowIndex * this.canvas.width * 4 + colIndex * 4 + blockY * this.canvas.width * 4 + blockX * 4, 0, 0, 0, 0);
                            }
                        }
                        // create pixel fragment animation
                        if (pixel != null) {
                            this.animateParticle(pixel.particle, startX, startY, fragmentWidth * canvasProps.canvasPixelPerWidth, fragmentHeight * canvasProps.canvasPixelPerHeight);
                        }
                        if (!(pixel && (colIndex * groupSplits) % (this.canvas.width - (this.canvas.width % fragmentWidth)) == 0)) return [3 /*break*/, 4];
                        this.canvasContext.putImageData(this.imageData, 0, 0);
                        return [4 /*yield*/, waitMs(groupTimeout)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        colIndex += fragmentWidth;
                        return [3 /*break*/, 2];
                    case 5:
                        this.canvasContext.putImageData(this.imageData, 0, 0);
                        return [4 /*yield*/, waitMs(groupTimeout)];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7:
                        rowIndex += fragmentHeight;
                        return [3 /*break*/, 1];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    ImageParticles.prototype.burstRandom = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var fragmentHeight, fragmentWidth, groupSplits, groupTimeout, canvasProps, particleMatrix, i, leftMatrixEntries, totalEntries, removeBuffer, _loop_1, this_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fragmentHeight = config.fragmentHeight, fragmentWidth = config.fragmentWidth, groupSplits = config.groupSplits, groupTimeout = config.groupTimeout;
                        canvasProps = this.getCanvasPixelProperties();
                        particleMatrix = new Array(this.canvas.width);
                        for (i = 0; i < particleMatrix.length; i++)
                            particleMatrix[i] = new Array(this.canvas.height);
                        // map particles to particle matrix for faster processing
                        this.particleMap.forEach(function (particlePosition, index) {
                            if (particlePosition != null) {
                                particleMatrix[(particlePosition.index / 4) % _this.canvas.width][Math.round((particlePosition.index / 4) / _this.canvas.width)] = index;
                            }
                        });
                        leftMatrixEntries = particleMatrix.flat();
                        totalEntries = this.particleMap.length;
                        removeBuffer = 0;
                        _loop_1 = function () {
                            var randomIndex, particlePosition, deleteCount, fragmentIndexes, f, startPos;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        randomIndex = leftMatrixEntries[Math.floor(Math.random() * leftMatrixEntries.length)];
                                        particlePosition = this_1.particleMap[randomIndex];
                                        deleteCount = 0;
                                        removeBuffer++;
                                        fragmentIndexes = this_1.getFragmentFromCanvasMatrix(particlePosition.index / 4, fragmentWidth, fragmentHeight, particleMatrix);
                                        leftMatrixEntries = leftMatrixEntries.filter(function (left) {
                                            if (fragmentIndexes.some(function (index) { return index == left; })) {
                                                if (!_this.setPixel(left * 4, 0, 0, 0, 0))
                                                    deleteCount++;
                                                return false;
                                            }
                                            else
                                                return true;
                                        });
                                        this_1.canvasContext.putImageData(this_1.imageData, 0, 0);
                                        f = deleteCount / fragmentIndexes.length * 2;
                                        if (particlePosition != null) {
                                            startPos = this_1.calculatePagePosition(canvasProps, particlePosition.index);
                                            this_1.animateParticle(particlePosition.particle, startPos.x, startPos.y, fragmentWidth * f, fragmentHeight * f);
                                        }
                                        if (!(particlePosition != null && (removeBuffer * groupSplits) % (totalEntries - (totalEntries % fragmentWidth)) == 0)) return [3 /*break*/, 2];
                                        this_1.canvasContext.putImageData(this_1.imageData, 0, 0);
                                        return [4 /*yield*/, waitMs(groupTimeout)];
                                    case 1:
                                        _b.sent();
                                        removeBuffer = 0;
                                        _b.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _a.label = 1;
                    case 1:
                        if (!(leftMatrixEntries.length > 0)) return [3 /*break*/, 3];
                        return [5 /*yield**/, _loop_1()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 3:
                        this.canvasContext.putImageData(this.imageData, 0, 0);
                        return [4 /*yield*/, waitMs(groupTimeout)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ImageParticles.prototype.burstColors = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var fragmentHeight, fragmentWidth, groupSplits, groupTimeout, canvasProps, particleMatrix, colorGroups, _loop_2, this_2, _i, _a, groupName;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        fragmentHeight = config.fragmentHeight, fragmentWidth = config.fragmentWidth, groupSplits = config.groupSplits, groupTimeout = config.groupTimeout;
                        canvasProps = this.getCanvasPixelProperties();
                        particleMatrix = new Array(this.canvas.width).fill([]);
                        colorGroups = {};
                        // map particles to particle matrix and color groups
                        this.particleMap.forEach(function (particlePosition, index) {
                            if (particlePosition != null) {
                                particleMatrix[(particlePosition.index / 4) % _this.canvas.width][Math.round((particlePosition.index / 4) / _this.canvas.width)] = index;
                                var colGroup = particlePosition.rgba.join("");
                                if (colorGroups[colGroup])
                                    colorGroups[colGroup].push(particlePosition);
                                else {
                                    colorGroups[colGroup] = [particlePosition];
                                }
                            }
                        });
                        _loop_2 = function (groupName) {
                            var particles, groupDeleted, _loop_3, _c, particles_1, particlePosition;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        particles = colorGroups[groupName];
                                        groupDeleted = 0;
                                        _loop_3 = function (particlePosition) {
                                            var deleteCount, fragmentIndexes, f, startPos;
                                            return __generator(this, function (_e) {
                                                switch (_e.label) {
                                                    case 0:
                                                        deleteCount = 0;
                                                        groupDeleted++;
                                                        fragmentIndexes = this_2.getFragmentFromCanvasMatrix(particlePosition.index / 4, fragmentWidth, fragmentHeight, particleMatrix);
                                                        fragmentIndexes.forEach(function (index) {
                                                            if (index != null) {
                                                                if (_this.getPixel(index * 4).join("") == groupName)
                                                                    if (!_this.setPixel(index * 4, 0, 0, 0, 0))
                                                                        deleteCount++;
                                                                ;
                                                                index = null;
                                                            }
                                                        });
                                                        f = (deleteCount * fragmentWidth) / fragmentIndexes.length;
                                                        if (particlePosition != null) {
                                                            startPos = this_2.calculatePagePosition(canvasProps, particlePosition.index);
                                                            this_2.animateParticle(particlePosition.particle, startPos.x, startPos.y, fragmentWidth * f, fragmentHeight * f);
                                                        }
                                                        if (!(particlePosition != null && (groupDeleted * groupSplits) % (particles.length - (particles.length % fragmentWidth)) == 0)) return [3 /*break*/, 2];
                                                        this_2.canvasContext.putImageData(this_2.imageData, 0, 0);
                                                        return [4 /*yield*/, waitMs(groupTimeout)];
                                                    case 1:
                                                        _e.sent();
                                                        _e.label = 2;
                                                    case 2: return [2 /*return*/];
                                                }
                                            });
                                        };
                                        _c = 0, particles_1 = particles;
                                        _d.label = 1;
                                    case 1:
                                        if (!(_c < particles_1.length)) return [3 /*break*/, 4];
                                        particlePosition = particles_1[_c];
                                        return [5 /*yield**/, _loop_3(particlePosition)];
                                    case 2:
                                        _d.sent();
                                        _d.label = 3;
                                    case 3:
                                        _c++;
                                        return [3 /*break*/, 1];
                                    case 4:
                                        this_2.canvasContext.putImageData(this_2.imageData, 0, 0);
                                        return [4 /*yield*/, waitMs(groupTimeout)];
                                    case 5:
                                        _d.sent();
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_2 = this;
                        _i = 0, _a = Object.keys(colorGroups);
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        groupName = _a[_i];
                        return [5 /*yield**/, _loop_2(groupName)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return ImageParticles;
}());
document.addEventListener("DOMContentLoaded", function () { return __awaiter(_this, void 0, void 0, function () {
    var query, image, canvas, particles, config;
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
                config = {
                    groupTimeout: 20,
                    groupSplits: 66,
                    fragmentWidth: 10,
                    fragmentHeight: 10
                };
                _a.label = 2;
            case 2:
                if (!true) return [3 /*break*/, 5];
                return [4 /*yield*/, particles.burstDown(config)];
            case 3:
                _a.sent();
                //await particles.burstRandom(config);
                //await particles.burstColors(config);
                return [4 /*yield*/, waitMs(4000)];
            case 4:
                //await particles.burstRandom(config);
                //await particles.burstColors(config);
                _a.sent();
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=script.js.map