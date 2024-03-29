let lastTime = 0;
let applicationTime = 0;

let pixelRatio;
let context;

function init(){
    console.log("Initializing...");
    resize();
    initEventlistener();

    oc = new objectController();
    oc.init();

    console.log("Initialization complete.");

    startGame();
}

function startGame() {
    console.log("Game started.");
    context = canvas.getContext("2d");
    requestAnimationFrame(animate);
}    

function animate(time) {
    requestAnimationFrame(animate);
    let dt = time - lastTime;
    if(dt<10) return;
    lastTime = time;
    applicationTime+=dt;
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
    oc.newPos();
    oc.draw();
}

console.log("Loaded: canvas.js");