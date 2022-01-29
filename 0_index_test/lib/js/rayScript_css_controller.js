const clickOnTopnavi = (targetID) => {
	if (targetID == "rayTopnavi"){
		//Do nothing
	}else if(targetID != "navi_icon"){
		//switchTopnaviActive
		switchTopnaviActive(targetID);
		switchMainContentActive(targetID);
	}else{
		//switchTopnaviStyle
		const topnavi = document.getElementById("rayTopnavi");
		if (topnavi.className === "topnavi"){
			topnavi.className += " responsive";
		} else {
			topnavi.className = "topnavi";
		}
	}
}

const switchTopnaviActive = async (targetID) => {
	//Deactivate all
	const topnavi = document.getElementById("rayTopnavi");
	topNaviChildren = topnavi.children;
	for(let i = 0; i < topNaviChildren.length - 1; i++){
		topNaviChildren[i].className = "";
	}

	//Activate the selected one
	document.getElementById(targetID).className = "active";
	await wait(250);
	topnavi.className = "topnavi";
}

const switchMainContentActive = async (targetID) => {
	//Deactivate all
	targetID = targetID.slice(5);
	const mainContent = document.getElementById("mainContent");
	mainContentChildren = mainContent.children;
	for(let i = 0; i < mainContentChildren.length; i++){
		mainContentChildren[i].className = "hideContent";
	}
	await wait(125);
	for(let i = 0; i < mainContentChildren.length; i++){
		mainContentChildren[i].style.display = "none";
	}


	//Activate the selected one
	const targetElement = document.getElementById(targetID);
	targetElement.style.display = "block";
	targetElement.className = "showContent"
}

const wait = millisec => {
	return new Promise((resolve, reject) => {
		setTimeout(() => resolve(), millisec)
	});
}