import {InsightDatasetKind} from "./IInsightFacade";
import {
	addApplyToCurrentAPPLYKeys,
	allfieldCourse,
	allfieldRoom,
	ALLTOKENS,
	currentReferencingDatasetID,
	currentReferencingDatasetIDType,
	MTOKENS, setCurrentGroup,
	setCurrentReferencingDatasetID,
	setCurrentReferencingDatasetIDType,
	theStoredDatasetList,
	theStoredIDList
} from "./checkHelperFunctions";
import {checkMTOKENStuffValidOrNot, checkSTOKENStuffValidOrNot} from "./checkTokenHelper";

export function checkTransformationsValidOrNot(transformations: any): boolean{
	console.log("This is check TRANSFORMATIONS Valid Or Not function");

	if (typeof transformations === "object") {
		if (Array.isArray(transformations)) {
			console.log("TRANSFORMATIONS is an object, but TRANSFORMATIONS can't be an array");
			return false;
		}
	} else {
		console.log("TRANSFORMATIONS is not even an Object");
		return false;
	}
	let TRANSFORMATIONSKeysList: any[] = Object.keys(transformations);
	let numberOfKeysInTRANSFORMATIONS: number = TRANSFORMATIONSKeysList.length;
	if (numberOfKeysInTRANSFORMATIONS === 2) {
		if (!TRANSFORMATIONSKeysList.includes("GROUP") || !TRANSFORMATIONSKeysList.includes("APPLY")) {
			console.log("TRANSFORMATIONS has 2 keys, but missing GROUP/APPLY");
			return false;
		} else {
			if (!checkGROUPValidOrNot(transformations["GROUP"])) {
				console.log("GROUP not valid");
				return false;
			}
			if (!checkAPPLYValidOrNot(transformations["APPLY"])) {
				console.log("APPLY not valid");
				return false;
			}
		}
	}else {
		console.log("TRANSFORMATIONS must have 2 keys, but here not");
		return false;
	}
	console.log("TRANSFORMATIONS is valid");
	return true;
}
function checkGROUPValidOrNot(GROUP: any): boolean{
	let GROUPList: any[];
	if (!Array.isArray(GROUP)) {
		console.log("GROUP must be an array, but here not");
		return false;
	} else {
		GROUPList = GROUP;
		if (GROUP.length === 0) {
			console.log("GROUP must be an non-empty array, but here it is empty");
			return false;
		}
	}
	for (let eachGROUP of GROUPList) {
		if (typeof eachGROUP !== "string") {
			console.log("GROUP must be an array of string, but here some element is not string");
			return false;
		}

		let eachGROUPParsing: string[];
		if (!eachGROUP.includes("_")) {
			console.log("the GROUP " + eachGROUP + " missing '_' ");
			return false;
		} else {
			eachGROUPParsing = eachGROUP.split("_");
			if (eachGROUPParsing.length !== 2) {
				console.log("the GROUP " + eachGROUP + " has more than one '_' ");
				return false;
			}
		}

		if (!checkEachGROUPParsingValidOrNot(eachGROUPParsing)) {
			console.log("this GROUPParsing is not valid");
			return false;
		}
	}
	setCurrentGroup(GROUPList);
	console.log("GROUP in TRANSFORMATIONS is valid");
	return true;
}
function checkEachGROUPParsingValidOrNot(eachGROUPParsing: string[]): boolean {
	let eachGROUPIDString: string = eachGROUPParsing[0];
	let eachGROUPField: string = eachGROUPParsing[1];

	if (!theStoredIDList.includes(eachGROUPIDString)) {
		console.log("the dataset ID referenced in GROUP hasn't been added yet");
		return false;
	} else {
		if (currentReferencingDatasetID === "") {
			setCurrentReferencingDatasetID(eachGROUPIDString);
			for (const dataset of theStoredDatasetList){
				if (dataset.id === currentReferencingDatasetID){
					setCurrentReferencingDatasetIDType(dataset.kind);
				}
			}
		} else {
			if (eachGROUPIDString !== currentReferencingDatasetID) {
				console.log("the GROUP are referencing different datasets");
				return false;
			}
		}
	}
	if (currentReferencingDatasetIDType === InsightDatasetKind.Courses){
		if (!allfieldCourse.includes(eachGROUPField)) {
			console.log("this GROUP has an invalid field (type courses)");
			return false;
		}
	}else {
		if (!allfieldRoom.includes(eachGROUPField)) {
			console.log("this GROUP has an invalid field (type rooms)");
			return false;
		}
	}

	return true;
}

function checkAPPLYValidOrNot(APPLY: any): boolean{
	let APPLYList: any[];
	if (!Array.isArray(APPLY)) {
		console.log("APPLY must be an array, but here not");
		return false;
	} else {
		APPLYList = APPLY;
		if (APPLY.length === 0) {
			console.log("APPLY must be an non-empty array, but here it is empty");
			return false;
		}
	}
	for (let eachApply of APPLYList) {
		if (typeof eachApply === "object") {
			if (Array.isArray(eachApply)) {
				console.log("eachApply is an object, but it can't be an array");
				return false;
			}
		} else {
			console.log("eachApply is not even an object");
		}

		let eachApplyKeysList: any[] = Object.keys(eachApply);
		let numberOfKeysInEachApply: number = eachApplyKeysList.length;
		if (numberOfKeysInEachApply !== 1){
			console.log("Each Apply should have and can only have one key");
			return false;
		}
		let theOnlyKeyInEachApply: string = eachApplyKeysList[0];
		let theApplyKey: string = theOnlyKeyInEachApply;
		if (!isApplyKeyValid(theApplyKey)){
			console.log("this ApplyKey is not valid");
			return false;
		}

		let theApplyKeyStuff: any = eachApply[theApplyKey];
		if (!checkTheApplyKeyStuffValidOrNot(theApplyKeyStuff)){
			console.log("this ApplyStuff is not valid");
			return false;
		}
		addApplyToCurrentAPPLYKeys(theApplyKey);
	}
	console.log("APPLY in TRANSFORMATIONS is valid");
	return true;
}

function isApplyKeyValid(theApplyKey: string): boolean {
	if (theApplyKey === null) {
		console.log("theApplyKey is null");
		return false;
	}
	if (theApplyKey.includes("_")) {
		console.log("theApplyKey contains an underscore");
		return false;
	}
	if (!theApplyKey.trim()) {
		console.log("theApplyKey contains only white spaces");
		return false;
	}
	return true;
}

function checkTheApplyKeyStuffValidOrNot(theApplyStuff: any): boolean {
	if (typeof theApplyStuff === "object") {
		if (Array.isArray(theApplyStuff)) {
			console.log("theApplyKeyStuff is an object, but it can't be an array");
			return false;
		}
	} else {
		console.log("theApplyKeyStuff is not even an object");
	}

	let ApplyStuffKeysList: any[] = Object.keys(theApplyStuff);
	let numberOfKeysInApplyStuff: number = ApplyStuffKeysList.length;
	if (numberOfKeysInApplyStuff !== 1){
		console.log("the ApplyKeyStuff should have and can only have one key");
		return false;
	}
	let theOnlyKeyInApplyKeyStuff: string = ApplyStuffKeysList[0];
	let theApplyToken: string = theOnlyKeyInApplyKeyStuff;
	if (!ALLTOKENS.includes(theApplyToken)){
		console.log("the ApplyToken not defined");
		return false;
	}
	let theApplyTokenStuff: any = theApplyStuff[theApplyToken];
	if (MTOKENS.includes(theApplyToken)){
		if (!checkMTOKENStuffValidOrNot(theApplyTokenStuff)){
			console.log("MTOKENStuff not valid");
			return false;
		}
	}else {
		if (!checkSTOKENStuffValidOrNot(theApplyTokenStuff)){
			console.log("STOKENStuff not valid");
			return false;
		}
	}
	console.log("the ApplyKeyStuff valid");
	return true;
}

