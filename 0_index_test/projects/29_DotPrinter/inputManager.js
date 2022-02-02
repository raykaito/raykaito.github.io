const initEventlistener = () => {
	file.addEventListener('change', loadImage, false);
}

const initSlider = () => {
	// Slider Scale;
	sScale.onchange = () => {updatePreview();};
	sScale.oninput = () => {updateText();};
	sScale.step = 0.01;
	sScale.value = 1;
	sScale.min = 0.1;
	sScale.max = 2;

	// Slider Brightness
	sBrightness.onchange = () => {updatePreview();};
	sBrightness.oninput = () => {updateText();};
	sBrightness.step = 0.01;
	sBrightness.value = 1.35;
	sBrightness.min = 0.1;
	sBrightness.max = 2;
}

const updateText = () => {
    brightness = sBrightness.value;
    scale = sScale.value;
    tScale.text = ""+Number(scale).toFixed(2);
    tBrightness.text = ""+Number(brightness).toFixed(2);
}

const loadImage = (e) => {
	const fileData = e.target.files[0];
	if(fileData==undefined||!fileData.type.match('image.*')){
		alert('Please upload Image file.');
		return;
	}
	const reader = new FileReader();
	reader.onload = () => {
		const fileImage = new Image();
		fileImage.src = reader.result;
		fileImage.onload = (fileImage) => {
			drawOriginalImage(fileImage.target);
		};
	}
	reader.readAsDataURL(fileData);
}

const outputInstruction = () => {
	getInstruction();
	
	// Save as a Text File
	const c = document.createElement("a");
	c.download = "instruction.txt";
	const blob = new Blob([inst],
		{type:"text/plain;charset=utf-8"});
	c.href = window.URL.createObjectURL(blob);
	c.click();
}

const bgModeChanged = () => {
	updatePreview();
}

console.log("Loaded: inputManager.js");