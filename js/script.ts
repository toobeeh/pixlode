const getImageFromURL = async (url: string) =>{
    return new Promise<HTMLImageElement>((resolve, reject) =>{
        const remote: HTMLImageElement = new Image();
        remote.crossOrigin = "Anonymous"
        remote.addEventListener("load", ()=>{
            resolve(remote);
        });
        remote.src = "https://api.allorigins.win/raw?url=" + url;
    });
}

const waitMs = async (timeout:number) => {
    return new Promise<boolean>((resolve, reject)=>{
        setTimeout(()=>resolve(true), timeout);
    });
}

class Particle{
    object: HTMLElement;
    animationTime:number = 1000;
    animationFunction:string = 'cubic-bezier(0, .9, .57, 1)';

    constructor(color: string, width: number, height:number){
        this.object = document.createElement("particle");
        this.object.style.backgroundColor = color;
        this.object.style.width = width + "px";
        this.object.style.height = height + "px";
    }

    setSize(width:number, height:number){
        this.object.style.width = width + "px";
        this.object.style.height = height + "px";
    }

    animate(distance: number, fromPageX: number, fromPageY: number, down:boolean = true, left:boolean = true, right:boolean = true) {
        document.body.appendChild(this.object);
        const directionY: number = Math.random() > 0.5 && down ? 1 : -1;
        const directionX: number = left && right ? (Math.random() > 0.5 && right && !left ? 1 : -1) : 0;
        const dY:number = Math.random() * distance;
        const dX:number = Math.sqrt(Math.pow(distance,2) - Math.pow(dY,2));
        const animation: Animation = this.object.animate([
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
        animation.onfinish = () =>{
            this.object.remove();
        }
    }
}

class ImageParticles{
    canvas: HTMLCanvasElement;
    canvasContext: CanvasRenderingContext2D;
    imageData: ImageData;
    particleMap: Array<{particle: Particle, index: number, rgba: Array<number>}> = [];

    constructor(imageCanvas: HTMLCanvasElement){
        this.canvas = imageCanvas;
        this.canvasContext = this.canvas.getContext("2d");
        this.imageData = this.canvasContext.getImageData(0,0, this.canvas.width, this.canvas.height);
        for(let index = 0; index < this.imageData.data.length; index+=4) {
            const rgbArray = [
                this.imageData.data[index],
                this.imageData.data[index+1],
                this.imageData.data[index+2],
                this.imageData.data[index+3]
            ];
            const color:string = `rgba(${rgbArray[0]},${rgbArray[1]},${rgbArray[2]},${rgbArray[3]})`;
            const pushObj = {particle: new Particle(color, 10, 10), index: index, rgba: rgbArray};
            if(rgbArray[3] > 0) this.particleMap.push(pushObj);
            else this.particleMap.push(null);
        }
    }

    setPixel(startIndex:number, r:number, g:number, b:number, a:number){
        this.imageData.data[startIndex] = r;
        this.imageData.data[startIndex+1] = g;
        this.imageData.data[startIndex+2] = b;
        this.imageData.data[startIndex+3] = a;
    }

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

    async burstSized(blockSize:number, timeout:number){
        const {x, y, width, height} = this.canvas.getBoundingClientRect();
        const canvasPixelPerWidth = width / this.canvas.width;
        const canvasPixelPerHeight = height / this.canvas.height;
        
        for(let rowIndex = 0; rowIndex < this.canvas.height; rowIndex += blockSize){
            for(let colIndex = 0; colIndex < this.canvas.width; colIndex += blockSize){
                const pixel = this.particleMap[rowIndex * this.canvas.width + colIndex];
                const startX = x + canvasPixelPerWidth * colIndex;
                const startY = y + canvasPixelPerHeight * rowIndex - blockSize;
                
                for(let blockX = 0; blockX < blockSize; blockX++){
                    for(let blockY = 0; blockY < blockSize; blockY++){
                        this.setPixel(rowIndex * this.canvas.width * 4 + colIndex * 4 + blockY * this.canvas.width * 4 + blockX * 4, 0, 0, 0, 0);
                    }
                }

                if(pixel != null) {
                    pixel.particle.setSize(blockSize, blockSize);
                    pixel.particle.animationTime = 2000;
                    pixel.particle.animationFunction = "ease-out";
                    pixel.particle.animate(70, startX, startY , false, false, false);
                    this.canvasContext.putImageData(this.imageData, 0, 0);
                    await waitMs(timeout);                    
                }
            }
        }
    }

    async burstRows(rowHeight:number, fragmentWidth:number, timeout:number){
        const {x, y, width, height} = this.canvas.getBoundingClientRect();
        const canvasPixelPerWidth = width / this.canvas.width;
        const canvasPixelPerHeight = height / this.canvas.height;
        
        for(let rowIndex = 0; rowIndex < this.canvas.height; rowIndex += rowHeight){
            for(let colIndex = 0; colIndex < this.canvas.width; colIndex += fragmentWidth){
                const pixel = this.particleMap[rowIndex * this.canvas.width + colIndex];
                const startX = x + canvasPixelPerWidth * colIndex - fragmentWidth;
                const startY = y + canvasPixelPerHeight * rowIndex - rowHeight / 2;
                
                for(let blockX = 0; blockX < fragmentWidth; blockX++){
                    for(let blockY = 0; blockY < rowHeight; blockY++){
                        this.setPixel(rowIndex * this.canvas.width * 4 + colIndex * 4 + blockY * this.canvas.width * 4 + blockX * 4, 0, 0, 0, 0);
                    }
                }

                if(pixel != null) {
                    pixel.particle.setSize(fragmentWidth * canvasPixelPerWidth, rowHeight * canvasPixelPerHeight);
                    pixel.particle.animationTime = 2000;
                    pixel.particle.animationFunction = "ease-out";
                    pixel.particle.animate(60, startX, startY , false, false, false);              
                }
            }
            this.canvasContext.putImageData(this.imageData, 0, 0);  
            await waitMs(timeout);    
        }
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const query: string = window.location.search.substr(1);
    const image: HTMLImageElement = await getImageFromURL(query);
    const canvas: HTMLCanvasElement = document.querySelector("body main canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.getContext("2d").drawImage(image, 0, 0);
    const particles = new ImageParticles(canvas);
    while(true){
        await particles.burstRows(10,10,10);
        await particles.burstSized(80, 0);
    }
});