import * as pixlode from "./pixlode.js";
const getImageFromURL = async (url) => {
    return new Promise((resolve, reject) => {
        const remote = new Image();
        remote.crossOrigin = "Anonymous";
        remote.addEventListener("load", () => {
            resolve(remote);
        });
        remote.src = "https://api.allorigins.win/raw?url=" + url;
    });
};
const getBurstConfig = () => {
    const burstConfig = {
        groupTimeout: Number.parseInt(document.querySelector("#bcTimeout").value),
        groupSize: Number.parseInt(document.querySelector("#bcGroupsize").value),
        fragmentWidth: Number.parseInt(document.querySelector("#bcWidth").value),
        fragmentHeight: Number.parseInt(document.querySelector("#bcHeight").value)
    };
    return burstConfig;
};
const getAnimationConfig = () => {
    const animationConfig = {
        time: Number.parseInt(document.querySelector("#acTime").value),
        distance: Number.parseInt(document.querySelector("#acDistance").value),
        function: document.querySelector("#acFunction").value,
        down: document.querySelector("#acDown").checked,
        left: document.querySelector("#acLeft").checked,
        right: document.querySelector("#acRight").checked
    };
    return animationConfig;
};
document.addEventListener("DOMContentLoaded", async () => {
    const playBtn = document.querySelector("#play");
    playBtn.disabled = true;
    const query = window.location.search.substr(1);
    const image = await getImageFromURL(query);
    const canvas = document.querySelector("body main canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.getContext("2d").drawImage(image, 0, 0);
    const particles = new pixlode.ImageParticles(canvas);
    playBtn.disabled = false;
    playBtn.addEventListener("click", async () => {
        playBtn.disabled = true;
        const burstConfig = getBurstConfig();
        const animationConfig = getAnimationConfig();
        particles.setAnimationConfiguration(animationConfig);
        const target = document.querySelector("#playSelect").value;
        switch (target) {
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
//# sourceMappingURL=script.js.map