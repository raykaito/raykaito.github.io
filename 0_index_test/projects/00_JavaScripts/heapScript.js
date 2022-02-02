class heap{
	constructor(){
		this.valueTree = new Array();
		this.indexTree = new Array();
	}

	//----------Add Value----------
	addValueIndex(value,index){
		this.valueTree[this.valueTree.length] = value;
		this.indexTree[this.indexTree.length] = index;
		this.sortDown();
	}
	sortDown(){
		let currentNode = this.valueTree.length - 1;
		while(true){
			if(currentNode==0){
				break;
			}
			const parentNode = this.getParentNode(currentNode);
			const swapped = this.trySwap(currentNode,parentNode);
			if(!swapped){
				break;
			}else{
				currentNode = parentNode;
			}
		}
	}

	//----------Remove Value on Top----------
	popValueIndex(){
		const valueToRemove = this.valueTree[0];
		const indexToRemove = this.indexTree[0];
		this.valueTree[0] = this.valueTree[this.valueTree.length-1];
		this.indexTree[0] = this.indexTree[this.indexTree.length-1];
		this.valueTree.splice(-1,1);
		this.indexTree.splice(-1,1);
		this.sortUp();
		return indexToRemove;
	}
	sortUp(){
		let currentNode = 0;
		while(true){
			//Get 2 child nodes
			const childNode1 = this.getChildNode1(currentNode);
			const childNode2 = this.getChildNode2(currentNode);
			//Select the child with smaller value
			let childNode;
			if(this.valueTree[childNode1]<this.valueTree[childNode2]){
				childNode = childNode1;
			}else{
				childNode = childNode2;
			}
			const swapped = this.trySwap(childNode,currentNode);
			if(!swapped){
				break;
			}else{
				currentNode = childNode;
			}
		}
	}
	//----------Swap Control----------
	trySwap(currentNode,parentNode){
		//this.printTree([currentNode,parentNode]);
		if(this.valueTree[currentNode]<this.valueTree[parentNode]){
			const tempValue = this.valueTree[currentNode];
			const tempIndex = this.indexTree[currentNode];
			this.valueTree[currentNode] = this.valueTree[parentNode];
			this.indexTree[currentNode] = this.indexTree[parentNode];
			this.valueTree[parentNode] = tempValue;
			this.indexTree[parentNode] = tempIndex;
			//this.printTree([currentNode,parentNode]);
			return true;
		}
		return false;
	}

	//----------Node Control----------
	getParentNode(n){
		return Math.floor((n-1)/2);
	}
	getChildNode1(n){
		return n*2+1;
	}
	getChildNode2(n){
		return n*2+2;
	}
	//----------Visualization----------
	printTree(nodeOnFocus = []){
		console.log("Start Printing");
		console.log(this.valueTree);
		let itemCount = this.valueTree.length;
		let layer = Math.floor(Math.log(itemCount)/Math.log(2));
		for(;layer>=0;layer--){
			let valueText = "";
			const startNode = Math.pow(2,layer)-1;
			let node = startNode;
			while(true){
				if(node>=itemCount) break;
				if(node>startNode*2) break;
				let textToAppend = "";
				//Get Focus Node or Not
				let focus = false;
				for(let nodeOnFocusIndex=0;nodeOnFocusIndex<nodeOnFocus.length;nodeOnFocusIndex++){
					if(node==nodeOnFocus[nodeOnFocusIndex]){
						focus = true;
						break;
					}
				}
				//Prepare text to Add
				if(focus){
					textToAppend = "|"+this.valueTree[node]+"|";
				}else{
					textToAppend = " "+this.valueTree[node]+" ";
				}
				//Add Text
				valueText = valueText+textToAppend;
				node++;
			}
			console.log(valueText);
		}
	}
}

console.log("Loaded: HeapScript.js");
