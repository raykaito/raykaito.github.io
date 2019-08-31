let img, himg;
let sudokuV;

function initJS(){
	sudokuV = new VisionProgram_SudokuReader();
	ex = [1,1,0,-1,-1,-1, 0, 1];
	ey = [0,1,1, 1, 0,-1,-1,-1];
}

document.getElementById('inp').onchange = function(e) {
	 ctResized = false;
	hctResized = false;
   img = new Image();
  himg = new Image();
   img.onload =  imageLoaded;
  himg.onload = himageLoaded;
   img.src = URL.createObjectURL(this.files[0]);
  himg.src = URL.createObjectURL(this.files[0]);
};

const imageLoaded = function() {
	resize(this.height/this.width);
	ct.drawImage(this, 0,0,canvas.width, canvas.height);
};

const himageLoaded = function() {
	resizeH(this.width, this.height);
	hct.drawImage(this,0,0,this.width,this.height);
	const start = Date.now();
	sudokuV.startScan();
	console.log(Math.floor((Date.now()-start)));
};

const imagesLoaded = function() {
};

const button1 = function(){
	const minLength = Math.min(hcanvas.width,hcanvas.height);
	const imageData = newWindow().centerWidthHeight(hcanvas.width/2, hcanvas.height/2, minLength/2, minLength/2);
	lyzer = new IntersectionDetector(imageData.passdata);
};

const button2 = function(){
};

const button3 = function(){
};

const button4 = function(){
};

const changeParameter = function(){
	const s1 = Number(slider1.value);
	const s2 = Number(slider2.value);
	const s3 = Number(slider3.value);
	const s4 = Number(slider4.value);
	lyzer.setYposition(s1/100);
	lyzer.updateLineIntensity();
	lyzer.displayLineIntensity();
	lyzer.display(0);
};

if (typeof navigator.mediaDevices.getUserMedia !== 'function') {
        const err = new Error('getUserMedia()が使えないブラウザだよ');
        alert(`${err.name} ${err.message}`);
        throw err;
    }

    // 操作する画面エレメント変数定義します。
    const $start = document.getElementById('start_btn');   // スタートボタン
    const $video = document.getElementById('video_area');  // 映像表示エリア

    // 「スタートボタン」を押下で、getUserMedia を使って映像を「映像表示エリア」に表示するよ。
    $start.addEventListener('click', () => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => $video.srcObject = stream)
        .catch(err => alert(`${err.name} ${err.message}`));
    }, false);

    function copyFrame() {

        var canvas_capture_image = document.getElementById('capture_image');
        var cci = canvas_capture_image.getContext('2d');
        var va = document.getElementById('video_area');

        canvas_capture_image.width  = va.videoWidth;
        canvas_capture_image.height = va.videoHeight;
        cci.drawImage(va, 0, 0);  // canvasに『「静止画取得」ボタン』押下時点の画像を描画。
    }
    
console.log("Loaded: javascript.js");