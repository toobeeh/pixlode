import * as pixlode from "./pixlode.js";

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


const getBurstConfig = () =>{
    const burstConfig:pixlode.BurstConfiguration = {
        groupTimeout: Number.parseInt((document.querySelector("#bcTimeout") as HTMLInputElement).value),
        groupSize: Number.parseInt((document.querySelector("#bcGroupsize") as HTMLInputElement).value),
        fragmentWidth: Number.parseInt((document.querySelector("#bcWidth") as HTMLInputElement).value),
        fragmentHeight: Number.parseInt((document.querySelector("#bcHeight") as HTMLInputElement).value)
    }
    return burstConfig;
}

const getAnimationConfig = () =>{
    const animationConfig:pixlode.AnimationConfiguration = {
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
    const particles = new pixlode.ImageParticles(canvas);
    
    playBtn.disabled = false;
    playBtn.addEventListener("click", async ()=>{
        playBtn.disabled = true;

        const burstConfig:pixlode.BurstConfiguration = getBurstConfig();
        const animationConfig:pixlode.AnimationConfiguration = getAnimationConfig();
        particles.setAnimationConfiguration(animationConfig);

        const target:string = (document.querySelector("#playSelect") as HTMLInputElement).value;
        switch(target){
            case "row":
                await particles.burstDown(burstConfig);
                break;
            case "random":
                await particles.burstRandom(burstConfig);
                break;
            case "color":
                await particles.burstColors(burstConfig);
                break;
        }
        await pixlode.waitMs(1000);
        canvas.getContext("2d").drawImage(image, 0, 0);
        particles.refreshImageData();
        playBtn.disabled = false;
    });
});