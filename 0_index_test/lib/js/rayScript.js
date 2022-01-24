const switchTopnavStyle = () => {
	const topnav = document.getElementById("rayTopnav");
	if (topnav.className === "topnav"){
		topnav.className += " responsive";
	} else {
		topnav.className = "topnav";
	}
}