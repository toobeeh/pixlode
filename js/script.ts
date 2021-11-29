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
        const directionX: number = left && right ? (Math.random() > 0.5 ? 1 : -1) : left ? -1 : right ? 1 : 0;
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

class ParticlePosition{
    particle:Particle;
    index:number;
    rgba:Array<number>;
    constructor(particle:Particle, index:number, rgba:Array<number>){
        this.particle = particle;
        this.index = index;
        this.rgba = rgba;
    }
}

interface CanvasProperties{
    x: number;
    y: number;
    width: number;
    height: number;
    canvasPixelPerWidth: number;
    canvasPixelPerHeight: number;
}

interface AnimationConfiguration{
    time:number;
    distance:number;
    function:string;
    down:boolean;
    left:boolean;
    right:boolean;
}

interface BurstConfiguration{
    groupTimeout:number;
    groupSplits:number;
    fragmentWidth:number;
    fragmentHeight:number;
}

class ImageParticles{
    canvas: HTMLCanvasElement;
    canvasContext: CanvasRenderingContext2D;
    imageData: ImageData;
    particleMap: Array<ParticlePosition> = [];
    animationConfig: AnimationConfiguration = {
        time:1000,
        distance:100,
        function:"ease-out",
        down:false,
        left:false,
        right:false
    };

    constructor(imageCanvas: HTMLCanvasElement, animationConfiguration = null){
        this.canvas = imageCanvas;
        this.canvasContext = this.canvas.getContext("2d");
        this.imageData = this.canvasContext.getImageData(0,0, this.canvas.width, this.canvas.height);
        if(animationConfiguration != null) this.animationConfig = animationConfiguration;
        for(let index = 0; index < this.imageData.data.length; index+=4) {
            const rgbArray = [
                this.imageData.data[index],
                this.imageData.data[index+1],
                this.imageData.data[index+2],
                this.imageData.data[index+3]
            ];
            const color:string = `rgba(${rgbArray[0]},${rgbArray[1]},${rgbArray[2]},${rgbArray[3]})`;
            const particlePosition = new ParticlePosition(new Particle(color, 10, 10), index,rgbArray);
            if(rgbArray[3] > 0) this.particleMap.push(particlePosition);
            else this.particleMap.push(null);
        }
    }

    refreshImageData(){
        this.imageData = this.canvasContext.getImageData(0,0, this.canvas.width, this.canvas.height);
    }

    setAnimationConfiguration(config:AnimationConfiguration){
        this.animationConfig = config;
    }

    setPixel(startIndex:number, r:number, g:number, b:number, a:number){
        let wasTransparent:boolean = this.imageData.data[startIndex+3] == 0;
        this.imageData.data[startIndex] = r;
        this.imageData.data[startIndex+1] = g;
        this.imageData.data[startIndex+2] = b;
        this.imageData.data[startIndex+3] = a;
        return wasTransparent;
    }

    getPixel(startIndex:number){
        return [
            this.imageData.data[startIndex],
            this.imageData.data[startIndex+1],
            this.imageData.data[startIndex+2],
            this.imageData.data[startIndex+3]
        ];
    }

    animateParticle(particle:Particle, startX:number, startY: number, width: number, height: number){
        particle.setSize(width, height);
        particle.animationTime = this.animationConfig.time;
        particle.animationFunction = this.animationConfig.function;
        particle.animate(300, startX, startY , this.animationConfig.down, this.animationConfig.left, this.animationConfig.right);
    }

    getCanvasPixelProperties(){
        const {x, y, width, height} = this.canvas.getBoundingClientRect();
        const canvasPixelPerWidth = width / this.canvas.width;
        const canvasPixelPerHeight = height / this.canvas.height;
        return {x, y, width, height, canvasPixelPerWidth, canvasPixelPerHeight}
    }

    getFragmentFromCanvasMatrix(startPixelIndex:number, fragmentWidth:number, fragmentHeight:number, canvasMatrix:Array<Array<number>>){
        let indexArray:Array<number> = [];
        for(let row = 0; row < fragmentHeight; row++){
            for(let col = 0; col < fragmentWidth; col++){
                indexArray.push(startPixelIndex + row * this.canvas.width + col);
            }
        }
        return indexArray;
    }
    
    calculatePagePosition(canvasProps:CanvasProperties, canvasDataArrayIndex:number){
        const startX = canvasProps.x + canvasProps.canvasPixelPerWidth * ((canvasDataArrayIndex / 4) % this.canvas.width);
        const startY = canvasProps.y + canvasProps.canvasPixelPerHeight * Math.floor((canvasDataArrayIndex / 4) / this.canvas.width);
        return {x: startX, y: startY};                
    }

    async burstDown(config:BurstConfiguration){
        const {x, y, width, height} = this.canvas.getBoundingClientRect();
        const canvasProps = this.getCanvasPixelProperties();
        const {fragmentHeight, fragmentWidth, groupSplits, groupTimeout} = config;
        
        // loop through rows in interval of fragment height
        for(let rowIndex = 0; rowIndex < this.canvas.height; rowIndex += fragmentHeight){

            //loop through columns in interval of fragment width
            for(let colIndex = 0; colIndex < this.canvas.width; colIndex += fragmentWidth){
                const pixel = this.particleMap[rowIndex * this.canvas.width + colIndex];
                const startX = x + canvasProps.canvasPixelPerWidth * colIndex - fragmentWidth;
                const startY = y + canvasProps.canvasPixelPerHeight * rowIndex ;
                
                // set pixels of fragment
                for(let blockX = 0; blockX < fragmentWidth; blockX++){
                    for(let blockY = 0; blockY < fragmentHeight; blockY++){
                        this.setPixel(rowIndex * this.canvas.width * 4 + colIndex * 4 + blockY * this.canvas.width * 4 + blockX * 4, 0, 0, 0, 0);
                    }
                }

                // create pixel fragment animation
                if(pixel != null) {
                    this.animateParticle(pixel.particle, startX, startY, fragmentWidth * canvasProps.canvasPixelPerWidth, fragmentHeight * canvasProps.canvasPixelPerHeight);
                }

                // if column position matches a animation position, put data & wait
                if(pixel && (colIndex * groupSplits) % (this.canvas.width - (this.canvas.width % fragmentWidth)) == 0){
                    this.canvasContext.putImageData(this.imageData, 0, 0);  
                    await waitMs(groupTimeout);  
                }
            }  
            this.canvasContext.putImageData(this.imageData, 0, 0);  
            await waitMs(groupTimeout);  
        }
    }

    async burstRandom(config:BurstConfiguration){
        const {fragmentHeight, fragmentWidth, groupSplits, groupTimeout} = config;
        const canvasProps = this.getCanvasPixelProperties();
        let particleMatrix: Array<Array<number>> = new Array(this.canvas.width);
        for(let i = 0; i < particleMatrix.length; i++) particleMatrix[i] = new Array(this.canvas.height);

        // map particles to particle matrix for faster processing
        this.particleMap.forEach((particlePosition, index) => {
            if(particlePosition != null) {
                particleMatrix[(particlePosition.index / 4) % this.canvas.width][Math.round((particlePosition.index / 4) / this.canvas.width)] = index;
            }
        });

        let leftMatrixEntries = particleMatrix.flat();
        const totalEntries = this.particleMap.length;
        let removeBuffer:number = 0;

        while(leftMatrixEntries.length > 0){
            const randomIndex = leftMatrixEntries[Math.floor(Math.random() * leftMatrixEntries.length)];
            const particlePosition = this.particleMap[randomIndex];
            let deleteCount = 0;
            removeBuffer++;
            
            // update fragment in imagedata
            const fragmentIndexes = this.getFragmentFromCanvasMatrix(particlePosition.index / 4, fragmentWidth, fragmentHeight, particleMatrix)
            leftMatrixEntries = leftMatrixEntries.filter(left => {
                if(fragmentIndexes.some(index => index == left)){
                    if(!this.setPixel(left * 4, 0, 0, 0, 0)) deleteCount++;
                    return false;
                }
                else return true;
            });
            this.canvasContext.putImageData(this.imageData, 0, 0);  

            // animate particle
            const f = deleteCount / fragmentIndexes.length * 2;
            if(particlePosition != null){
                const startPos = this.calculatePagePosition(canvasProps, particlePosition.index);
                this.animateParticle(particlePosition.particle, startPos.x, startPos.y, fragmentWidth * f, fragmentHeight * f);
            }

            if(particlePosition != null && (removeBuffer * groupSplits) % (totalEntries - (totalEntries % fragmentWidth)) == 0){
                this.canvasContext.putImageData(this.imageData, 0, 0);  
                await waitMs(groupTimeout);  
                removeBuffer = 0;
            }
        }
        this.canvasContext.putImageData(this.imageData, 0, 0);  
        await waitMs(groupTimeout);  
    }

    async burstColors(config:BurstConfiguration){
        const {fragmentHeight, fragmentWidth, groupSplits, groupTimeout} = config;
        const canvasProps = this.getCanvasPixelProperties();
        let particleMatrix: Array<Array<number>> = new Array(this.canvas.width).fill([]);
        let colorGroups = {};

        // map particles to particle matrix and color groups
        this.particleMap.forEach((particlePosition, index) => {
            if(particlePosition != null) {
                particleMatrix[(particlePosition.index / 4) % this.canvas.width][Math.round((particlePosition.index / 4) / this.canvas.width)] = index;
                const colGroup = particlePosition.rgba.join("");
                if(colorGroups[colGroup]) colorGroups[colGroup].push(particlePosition);
                else {
                    colorGroups[colGroup] = [particlePosition];
                }
            }
        });
        
        // animate burst
        for (const groupName of Object.keys(colorGroups)) {
            const particles:Array<ParticlePosition> = colorGroups[groupName];
            let groupDeleted = 0;
            for(const particlePosition of particles){
                let deleteCount = 0;
                groupDeleted++;

                // update fragment in imagedata
                const fragmentIndexes = this.getFragmentFromCanvasMatrix(particlePosition.index / 4, fragmentWidth, fragmentHeight, particleMatrix)
                fragmentIndexes.forEach(index => {
                    if(index != null){
                        if(this.getPixel(index * 4).join("") == groupName) 
                            if(!this.setPixel(index * 4, 0, 0, 0, 0)) deleteCount++;;
                        index = null;
                    }
                });

                // animate particle
                const f = (deleteCount * fragmentWidth) / fragmentIndexes.length;
                if(particlePosition != null){
                    const startPos = this.calculatePagePosition(canvasProps, particlePosition.index);
                    this.animateParticle(particlePosition.particle, startPos.x, startPos.y, fragmentWidth * f, fragmentHeight * f);
                }

                if(particlePosition != null && (groupDeleted * groupSplits) % (particles.length - (particles.length % fragmentWidth)) == 0){
                    this.canvasContext.putImageData(this.imageData, 0, 0);  
                    await waitMs(groupTimeout);  
                }
            } 
            this.canvasContext.putImageData(this.imageData, 0, 0);  
            await waitMs(groupTimeout); 
        }
    }
}


const getBurstConfig = () =>{
    const burstConfig:BurstConfiguration = {
        groupTimeout: Number.parseInt((document.querySelector("#bcTimeout") as HTMLInputElement).value),
        groupSplits: Number.parseInt((document.querySelector("#bcSplits") as HTMLInputElement).value),
        fragmentWidth: Number.parseInt((document.querySelector("#bcWidth") as HTMLInputElement).value),
        fragmentHeight: Number.parseInt((document.querySelector("#bcHeight") as HTMLInputElement).value)
    }
    return burstConfig;
}

const getAnimationConfig = () =>{
    const animationConfig:AnimationConfiguration = {
        time: Number.parseInt((document.querySelector("#acTime") as HTMLInputElement).value),
        distance: Number.parseInt((document.querySelector("#acDistance") as HTMLInputElement).value),
        function: (document.querySelector("#acFunction") as HTMLInputElement).value,
        down: (document.querySelector("#acDown") as HTMLInputElement).checked,
        left: (document.querySelector("#acLeft") as HTMLInputElement).checked,
        right: (document.querySelector("#acRight") as HTMLInputElement).checked
    }
    return animationConfig;
}

document.addEventListener("DOMContentLoaded", async () => {
    const playBtn:HTMLInputElement = document.querySelector("#play");
    playBtn.disabled = true;

    const query: string = window.location.search.substr(1);
    const image: HTMLImageElement = await getImageFromURL(query);
    const canvas: HTMLCanvasElement = document.querySelector("body main canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.getContext("2d").drawImage(image, 0, 0);
    const particles = new ImageParticles(canvas);
    
    // playBtn.disabled = false;
    // playBtn.addEventListener("click", async ()=>{
    //     playBtn.disabled = true;

    //     const burstConfig:BurstConfiguration = getBurstConfig();
    //     const animationConfig:AnimationConfiguration = getAnimationConfig();
    //     particles.setAnimationConfiguration(animationConfig);

    //     const target:string = (document.querySelector("#playSelect") as HTMLInputElement).value;
    //     switch(target){
    //         case "row":
    //             await particles.burstDown(burstConfig);
    //             break;
    //         case "random":
    //             await particles.burstRandom(burstConfig);
    //             break;
    //         case "color":
    //             await particles.burstColors(burstConfig);
    //             break;
    //     }
    //     await waitMs(4000);
    //     canvas.getContext("2d").drawImage(image, 0, 0);
    //     particles.refreshImageData();
    //     playBtn.disabled = false;
    // });
});