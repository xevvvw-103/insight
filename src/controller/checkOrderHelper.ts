import {currentCOLUMNS} from "./checkHelperFunctions";

export function checkORDERValidOrNot(ORDER: any): boolean {
	if ((typeof ORDER !== "string") && (typeof ORDER !== "object")) {
		console.log("ORDER must be a string or an object, but here not");
		return false;
	} else {
		if (typeof ORDER === "string"){
			if (!currentCOLUMNS.includes(ORDER)) {
				console.log("idString_field pair in ORDER is not in COLUMN");
				return false;
			}
		}else {
			if (Array.isArray(ORDER)) {
				console.log("ORDER is an object, but ORDER can't be an array");
				return false;
			}
			let ORDERObjectKeysList: string[] = Object.keys(ORDER);
			let numberOfKeysInORDERObject: number = ORDERObjectKeysList.length;
			if (numberOfKeysInORDERObject !== 2){
				console.log("ORDERObject must have 2 keys, but here not");
				return false;
			}else {
				if (!ORDERObjectKeysList.includes("dir") || !ORDERObjectKeysList.includes("keys")) {
					console.log("OPTIONS has 2 keys, but missing dir/keys");
					return false;
				}
				let dirStuff: any = ORDER["dir"];
				let keysStuff: any = ORDER["keys"];
				if (!checkDirStuffValidOrNot(dirStuff)){
					console.log("DIRECTION Must be DOWN/UP");
					return false;
				}
				if (!checkKeysStuffValidOrNot(keysStuff)){
					return false;
				}
			}
		}
	}
	console.log("ORDER in OPTIONS is valid");
	return true;
}
function checkDirStuffValidOrNot(dirStuff: any): boolean {
	return ((dirStuff === "DOWN") || (dirStuff === "UP"));
}
function checkKeysStuffValidOrNot(keysStuff: any): boolean {
	if (!Array.isArray(keysStuff)){
		console.log("KeysStuff in ORDER object must be an array");
		return false;
	}else {
		console.log(currentCOLUMNS);
		for (const eachKeyStuff of keysStuff){
			if (!currentCOLUMNS.includes(eachKeyStuff)){
				console.log(eachKeyStuff);
				console.log("any Keys in ORDER object must be in COLUMNS");
				return false;
			}
		}
	}
	return true;
}
