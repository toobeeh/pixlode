const waitMs = async (timeout) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(true), timeout);
    });
};
class Particle {
    object;
    animationTime = 1000;
    animationFunction = 'cubic-bezier(0, .9, .57, 1)';
    constructor(color, width, height) {
        this.object = document.createElement("particle");
        this.object.style.backgroundColor = color;
        this.object.style.width = width + "px";
        this.object.style.height = height + "px";
    }
    setSize(width, height) {
        this.object.style.width = width + "px";
        this.object.style.height = height + "px";
    }
    animate(distance, fromPageX, fromPageY, down = true, left = true, right = true) {
        document.body.appendChild(this.object);
        const directionY = Math.random() > 0.5 && down ? 1 : -1;
        const directionX = left && right ? (Math.random() > 0.5 ? 1 : -1) : left ? -1 : right ? 1 : 0;
        const dY = Math.random() * distance;
        const dX = Math.sqrt(Math.pow(distance, 2) - Math.pow(dY, 2));
        const animation = this.object.animate([
            {
                transform: `translate(${fromPageX}px, ${fromPageY}px)`,
                opacity: 1
            },
            {
                transform: `translate(${fromPageX + dX * directionX}px, ${fromPageY + dY * directionY}px)`,
                opacity: 0
            }
        ], {
            duration: 500 + Math.random() * this.animationTime,
            easing: this.animationFunction
        });
        animation.onfinish = () => {
            this.object.remove();
        };
    }
}
class ParticlePosition {
    particle;
    index;
    rgba;
    constructor(particle, index, rgba) {
        this.particle = particle;
        this.index = index;
        this.rgba = rgba;
    }
}
class ImageParticles {
    canvas;
    canvasContext;
    imageData;
    particleMap = [];
    animationConfig = {
        time: 1000,
        distance: 100,
        function: "ease-out",
        down: false,
        left: false,
        right: false
    };
    constructor(imageCanvas, animationConfiguration = null) {
        this.canvas = imageCanvas;
        this.canvasContext = this.canvas.getContext("2d");
        this.imageData = this.canvasContext.getImageData(0, 0, this.canvas.width, this.canvas.height);
        if (animationConfiguration != null)
            this.animationConfig = animationConfiguration;
        for (let index = 0; index < this.imageData.data.length; index += 4) {
            const rgbArray = [
                this.imageData.data[index],
                this.imageData.data[index + 1],
                this.imageData.data[index + 2],
                this.imageData.data[index + 3]
            ];
            const color = `rgba(${rgbArray[0]},${rgbArray[1]},${rgbArray[2]},${rgbArray[3]})`;
            const particlePosition = new ParticlePosition(new Particle(color, 10, 10), index, rgbArray);
            if (rgbArray[3] > 0)
                this.particleMap.push(particlePosition);
            else
                this.particleMap.push(null);
        }
    }
    refreshImageData() {
        this.imageData = this.canvasContext.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }
    setAnimationConfiguration(config) {
        this.animationConfig = config;
    }
    setPixel(startIndex, r, g, b, a) {
        let wasTransparent = this.imageData.data[startIndex + 3] == 0;
        this.imageData.data[startIndex] = r;
        this.imageData.data[startIndex + 1] = g;
        this.imageData.data[startIndex + 2] = b;
        this.imageData.data[startIndex + 3] = a;
        return wasTransparent;
    }
    getPixel(startIndex) {
        return [
            this.imageData.data[startIndex],
            this.imageData.data[startIndex + 1],
            this.imageData.data[startIndex + 2],
            this.imageData.data[startIndex + 3]
        ];
    }
    animateParticle(particle, startX, startY, width, height) {
        particle.setSize(width, height);
        particle.animationTime = this.animationConfig.time;
        particle.animationFunction = this.animationConfig.function;
        particle.animate(this.animationConfig.distance, startX, startY, this.animationConfig.down, this.animationConfig.left, this.animationConfig.right);
    }
    getCanvasPixelProperties() {
        const { x, y, width, height } = this.canvas.getBoundingClientRect();
        const canvasPixelPerWidth = width / this.canvas.width;
        const canvasPixelPerHeight = height / this.canvas.height;
        return { x, y, width, height, canvasPixelPerWidth, canvasPixelPerHeight };
    }
    getFragmentFromCanvasMatrix(startPixelIndex, fragmentWidth, fragmentHeight, canvasMatrix) {
        let indexArray = [];
        for (let row = 0; row < fragmentHeight; row++) {
            for (let col = 0; col < fragmentWidth; col++) {
                indexArray.push(startPixelIndex + row * this.canvas.width + col);
            }
        }
        return indexArray;
    }
    calculatePagePosition(canvasProps, canvasDataArrayIndex) {
        const startX = canvasProps.x + canvasProps.canvasPixelPerWidth * ((canvasDataArrayIndex / 4) % this.canvas.width);
        const startY = canvasProps.y + canvasProps.canvasPixelPerHeight * Math.floor((canvasDataArrayIndex / 4) / this.canvas.width);
        return { x: startX, y: startY };
    }
    async burstDown(config) {
        const { x, y, width, height } = this.canvas.getBoundingClientRect();
        const canvasProps = this.getCanvasPixelProperties();
        const { fragmentHeight, fragmentWidth, groupSize: groupSize, groupTimeout } = config;
        for (let rowIndex = 0; rowIndex < this.canvas.height; rowIndex += fragmentHeight) {
            for (let colIndex = 0; colIndex < this.canvas.width; colIndex += fragmentWidth) {
                const pixel = this.particleMap[rowIndex * this.canvas.width + colIndex];
                const startX = x + canvasProps.canvasPixelPerWidth * colIndex - fragmentWidth;
                const startY = y + canvasProps.canvasPixelPerHeight * rowIndex;
                for (let blockX = 0; blockX < fragmentWidth; blockX++) {
                    for (let blockY = 0; blockY < fragmentHeight; blockY++) {
                        this.setPixel(rowIndex * this.canvas.width * 4 + colIndex * 4 + blockY * this.canvas.width * 4 + blockX * 4, 0, 0, 0, 0);
                    }
                }
                if (pixel != null) {
                    this.animateParticle(pixel.particle, startX, startY, fragmentWidth * canvasProps.canvasPixelPerWidth, fragmentHeight * canvasProps.canvasPixelPerHeight);
                }
                if (pixel && (colIndex * groupSize) % (this.canvas.width - (this.canvas.width % fragmentWidth)) == 0) {
                    this.canvasContext.putImageData(this.imageData, 0, 0);
                    await waitMs(groupTimeout);
                }
            }
            this.canvasContext.putImageData(this.imageData, 0, 0);
            await waitMs(groupTimeout);
        }
    }
    async burstRandom(config) {
        const { fragmentHeight, fragmentWidth, groupSize: groupSize, groupTimeout } = config;
        const canvasProps = this.getCanvasPixelProperties();
        let particleMatrix = new Array(this.canvas.width);
        for (let i = 0; i < particleMatrix.length; i++)
            particleMatrix[i] = new Array(this.canvas.height);
        this.particleMap.forEach((particlePosition, index) => {
            if (particlePosition != null) {
                particleMatrix[(particlePosition.index / 4) % this.canvas.width][Math.round((particlePosition.index / 4) / this.canvas.width)] = index;
            }
        });
        let leftMatrixEntries = particleMatrix.flat();
        const totalEntries = this.particleMap.length;
        let removeBuffer = 0;
        while (leftMatrixEntries.length > 0) {
            const randomIndex = leftMatrixEntries[Math.floor(Math.random() * leftMatrixEntries.length)];
            const particlePosition = this.particleMap[randomIndex];
            let deleteCount = 0;
            removeBuffer++;
            const fragmentIndexes = this.getFragmentFromCanvasMatrix(particlePosition.index / 4, fragmentWidth, fragmentHeight, particleMatrix);
            leftMatrixEntries = leftMatrixEntries.filter(left => {
                if (fragmentIndexes.some(index => index == left)) {
                    if (!this.setPixel(left * 4, 0, 0, 0, 0))
                        deleteCount++;
                    return false;
                }
                else
                    return true;
            });
            this.canvasContext.putImageData(this.imageData, 0, 0);
            const f = deleteCount / fragmentIndexes.length * 2;
            if (particlePosition != null) {
                const startPos = this.calculatePagePosition(canvasProps, particlePosition.index);
                this.animateParticle(particlePosition.particle, startPos.x, startPos.y, fragmentWidth * f, fragmentHeight * f);
            }
            if (particlePosition != null && (removeBuffer * groupSize) % (totalEntries - (totalEntries % fragmentWidth)) == 0) {
                this.canvasContext.putImageData(this.imageData, 0, 0);
                await waitMs(groupTimeout);
                removeBuffer = 0;
            }
        }
        this.canvasContext.putImageData(this.imageData, 0, 0);
        await waitMs(groupTimeout);
    }
    async burstColors(config) {
        const { fragmentHeight, fragmentWidth, groupSize: groupSize, groupTimeout } = config;
        const canvasProps = this.getCanvasPixelProperties();
        let particleMatrix = new Array(this.canvas.width).fill([]);
        let colorGroups = {};
        this.particleMap.forEach((particlePosition, index) => {
            if (particlePosition != null) {
                particleMatrix[(particlePosition.index / 4) % this.canvas.width][Math.round((particlePosition.index / 4) / this.canvas.width)] = index;
                const colGroup = particlePosition.rgba.join("");
                if (colorGroups[colGroup])
                    colorGroups[colGroup].push(particlePosition);
                else {
                    colorGroups[colGroup] = [particlePosition];
                }
            }
        });
        for (const groupName of Object.keys(colorGroups)) {
            const particles = colorGroups[groupName];
            let groupDeleted = 0;
            for (const particlePosition of particles) {
                let deleteCount = 0;
                groupDeleted++;
                const fragmentIndexes = this.getFragmentFromCanvasMatrix(particlePosition.index / 4, fragmentWidth, fragmentHeight, particleMatrix);
                fragmentIndexes.forEach(index => {
                    if (index != null) {
                        if (this.getPixel(index * 4).join("") == groupName)
                            if (!this.setPixel(index * 4, 0, 0, 0, 0))
                                deleteCount++;
                        ;
                        index = null;
                    }
                });
                const f = (deleteCount * fragmentWidth) / fragmentIndexes.length;
                if (particlePosition != null) {
                    const startPos = this.calculatePagePosition(canvasProps, particlePosition.index);
                    this.animateParticle(particlePosition.particle, startPos.x, startPos.y, fragmentWidth * f, fragmentHeight * f);
                }
                if (particlePosition != null && (groupDeleted * groupSize) % (particles.length - (particles.length % fragmentWidth)) == 0) {
                    this.canvasContext.putImageData(this.imageData, 0, 0);
                    await waitMs(groupTimeout);
                }
            }
            this.canvasContext.putImageData(this.imageData, 0, 0);
            await waitMs(groupTimeout);
        }
    }
}
export { waitMs, ImageParticles };
//# sourceMappingURL=pixlode.js.map