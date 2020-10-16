console.log("Running activator.js");
//Prepare function to load js files
function loadJS(url){
    return new Promise(resolve => {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = url;
        script.onload = resolve;
        document.body.appendChild(script);
    });
}
/*
//Load important JS files
loadJS("https://raykaito.github.io/25_touchless_control/functions.js");
loadJS("https://raykaito.github.io/25_touchless_control/canvas.js");
loadJS("https://raykaito.github.io/25_touchless_control/vision_program.js");
loadJS("https://raykaito.github.io/25_touchless_control/video_stream.js");
*/
async function loadJSinOrder(){
    await loadJS("functions.js");
    await loadJS("canvas.js");
    await loadJS("vision_program.js");
    await loadJS("video_stream.js");
    await loadJS("runner.js");
    console.log("Every JS file loaded");
}

loadJSinOrder();
