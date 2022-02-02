class heap{
	constructor(size){
		this.valueTree = new Int32Array(size);
		this.indexTree = new Int32Array(size);
		this.heapLength = 0;
	}

	//----------Add Value----------
	addValueIndex(value,index){
		this.valueTree[this.heapLength] = value;
		this.indexTree[this.heapLength] = index;
		this.heapLength++;
		this.sortDown();
	}
	sortDown(){
		let currentNode = this.heapLength - 1;
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
		this.valueTree[0] = this.valueTree[this.heapLength-1];
		this.indexTree[0] = this.indexTree[this.heapLength-1];
		this.heapLength--;
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
			//Chech if "current node" is within the heapLength
			if(currentNode>this.heapLength){
				return false;
			}
			//Swap
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
}

console.log("Loaded: HeapScript.js");
