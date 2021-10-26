import {
	checkCOLUMNSValidOrNot,
	checkInputStringValidOrNot,
	checkNEGATIONValidOrNot,
	currentCOLUMNS,
	currentReferencingDatasetID,
	mfield,
	sfield,
	theStoredIDList,
} from "./checkHelperFunctions";

export function checkOPTIONSValidOrNot(options: any): boolean {
	console.log("This is check OPTIONS Valid Or Not function");

	if (typeof options === "object") {
		if (Array.isArray(options)) {
			console.log("OPTIONS is an object, but OPTIONS can't be an array");
			return false;
		}
	} else {
		console.log("OPTIONS is not even an Object");
		return false;
	}

	let OPTIONSKeysList: any[] = Object.keys(options);
	let numberOfKeysInOPTIONS: number = OPTIONSKeysList.length;
	if (numberOfKeysInOPTIONS > 2) {
		console.log("OPTIONS has more than 2 keys, but it can only have at most two");
		return false;
	} else if (numberOfKeysInOPTIONS === 2) {
		if (!OPTIONSKeysList.includes("COLUMNS") || !OPTIONSKeysList.includes("ORDER")) {
			console.log("OPTIONS has 2 keys, but missing COLUMNS/ORDER");
			return false;
		} else {
			if (!checkCOLUMNSValidOrNot(options["COLUMNS"])) {
				console.log("COLUMNS not valid");
				return false;
			}
			if (!checkORDERValidOrNot(options["ORDER"])) {
				console.log("ORDER not valid");
				return false;
			}
		}
	} else if (numberOfKeysInOPTIONS === 1) {
		if (!OPTIONSKeysList.includes("COLUMNS")) {
			console.log("OPTIONS has 1 key, but missing COLUMNS");
			return false;
		} else {
			if (!checkCOLUMNSValidOrNot(options["COLUMNS"])) {
				console.log("COLUMNS not valid");
				return false;
			}
		}
	} else {
		console.log("OPTIONS has no key");
		return false;
	}
	console.log("OPTIONS is valid");
	return true;
}

export function checkORDERValidOrNot(ORDER: any): boolean {
	if (typeof ORDER !== "string") {
		console.log("ORDER must be a string, but here not");
		return false;
	} else {
		if (!currentCOLUMNS.includes(ORDER)) {
			console.log("idString_field pair in ORDER is not in COLUMN");
			return false;
		}
	}
	console.log("ORDER in OPTIONS is valid");
	return true;
}
export function checkWHEREValidOrNot(WHERE: any): boolean {
	if (typeof WHERE === "object") {
		if (Array.isArray(WHERE)) {
			console.log("WHERE is an object, but WHERE can't be an array");
			return false;
		}
		console.log("WHERE is an object, now we will check the FILTER in WHERE");
		if (!checkFILTERValidOrNot(WHERE, true)) {
			console.log("Filter in WHERE is not valid");
			return false;
		}
	} else {
		console.log("WHERE is not even an Object");
		return false;
	}
	console.log("WHERE is valid");
	return true;
}
export function checkFILTERValidOrNot(FILTER: any, isThisFilterInWhereOrNot: boolean): boolean {
	console.log("This is check FILTER Valid Or Not function");
	let FILTERKeysList: any[] = Object.keys(FILTER);
	if (FILTERKeysList.length === 0) {
		if (isThisFilterInWhereOrNot) {
			console.log("this is the FILTER in WHERE, it has no key, but still return true");
			return true;
		} else {
			console.log("this is not the FILTER in WHERE, it has no key, so not valid, so return false");
			return false;
		}
	}
	if (FILTERKeysList.length !== 1) {
		console.log("this FILTER should have and can only have one key, but here not");
		return false;
	}
	let theOnlyFilterKey = FILTERKeysList[0];
	if (theOnlyFilterKey === "AND" || theOnlyFilterKey === "OR") {
		console.log("this is the logic comparison (AND/OR) check");
		if (!checkLOGICCOMPARISONValidOrNot(theOnlyFilterKey, FILTER)) {
			return false;
		}
	} else if (theOnlyFilterKey === "LT" || theOnlyFilterKey === "GT" || theOnlyFilterKey === "EQ") {
		console.log("This is the MCOMPARISON check");
		if (!checkMCOMPARISONValidOrNot(theOnlyFilterKey, FILTER)) {
			return false;
		}
	} else if (theOnlyFilterKey === "IS") {
		console.log("This is the SCOMPARISON check");
		if (!checkSCOMPARISONValidOrNot(theOnlyFilterKey, FILTER)) {
			return false;
		}
	} else if (theOnlyFilterKey === "NOT") {
		console.log("This is the NEGATION check");
		if (!checkNEGATIONValidOrNot(theOnlyFilterKey, FILTER)) {
			return false;
		}
	} else {
		console.log("Not valid filter name, it must be ('AND' | 'OR' | 'LT' | 'GT' | 'EQ' | 'IS' | 'NOT') ");
		return false;
	}
	return true;
}
export function checkLOGICCOMPARISONValidOrNot(theOnlyFilterKey: string, FILTER: any): boolean {
	let TheLOGICCOMPARISON: any[] = [];
	if (!Array.isArray(FILTER[theOnlyFilterKey])) {
		console.log("the AND/OR logic must be an array, but here it is not an array");
		return false;
	} else {
		TheLOGICCOMPARISON = FILTER[theOnlyFilterKey];
		if (TheLOGICCOMPARISON.length === 0) {
			console.log("the AND/OR logic list is empty, but it can't be empty");
			return false;
		}
	}
	for (let eachFILTER of TheLOGICCOMPARISON) {
		if (!checkFILTERValidOrNot(eachFILTER, false)) {
			console.log("some FILTER in AND/OR logic list is not valid");
			return false;
		}
	}

	return true;
}

export function checkMCOMPARISONValidOrNot(theOnlyFilterKey: string, FILTER: any): boolean {
	let theMCOMPARISON: any = FILTER[theOnlyFilterKey];
	if (typeof theMCOMPARISON === "object") {
		if (Array.isArray(theMCOMPARISON)) {
			console.log("The MCOMPARISON is an object, but The MCOMPARISON can't be an array");
			return false;
		}
	} else {
		console.log("The MCOMPARISON is not even an object");
		return false;
	}

	let theMCOMPARATORKeysList: any[] = Object.keys(theMCOMPARISON);
	if (theMCOMPARATORKeysList.length !== 1) {
		console.log("The MCOMPARISON should have and can only have one key but here not");
		return false;
	}

	let theOnlyMCOMPARATORKey = theMCOMPARATORKeysList[0];
	let mKeyParsing: string[];
	if (!theOnlyMCOMPARATORKey.includes("_")) {
		console.log("the MCOMPARATORKey missing '_' ");
		return false;
	} else {
		mKeyParsing = theOnlyMCOMPARATORKey.split("_");
		if (mKeyParsing.length !== 2) {
			console.log("the MCOMPARATORKey has more than one '_' ");
			return false;
		}
	}
	if (!checkMKeyParsingValidOrNot(mKeyParsing)) {
		console.log("this MKeyParsing is not valid");
		return false;
	}

	if (typeof theMCOMPARISON[theOnlyMCOMPARATORKey] !== "number") {
		console.log("the LT/GT/EQ can only be compared with a number, but here not number");
		return false;
	}

	return true;
}
export function checkMKeyParsingValidOrNot(mKeyParsing: string[]): boolean {
	let theOnlyMCOMPARATORKeyIDString: string = mKeyParsing[0];
	let theOnlyMCOMPARATORKeyMField: string = mKeyParsing[1];

	if (!theStoredIDList.includes(theOnlyMCOMPARATORKeyIDString)) {
		console.log("some dataset ID referenced in MCOMPARATOR hasn't been added yet");
		return false;
	} else {
		if (theOnlyMCOMPARATORKeyIDString !== currentReferencingDatasetID) {
			console.log("the MCOMPARATOR is referencing a different dataset that appears in COLUMNS");
			return false;
		}
	}

	if (!mfield.includes(theOnlyMCOMPARATORKeyMField)) {
		console.log("the MCOMPARISON Field is not a valid one");
		return false;
	}
	return true;
}
export function checkSCOMPARISONValidOrNot(theOnlyFilterKey: string, FILTER: any): boolean {
	let theSCOMPARISON: any = FILTER[theOnlyFilterKey];
	if (typeof theSCOMPARISON === "object") {
		if (Array.isArray(theSCOMPARISON)) {
			console.log("the SCOMPARISON is an object, but it can't be an array");
			return false;
		}
	} else {
		console.log("the SCOMPARISON is not even an object");
		return false;
	}
	let theSCOMPARATORKeysList: any[] = Object.keys(theSCOMPARISON);
	if (theSCOMPARATORKeysList.length !== 1) {
		console.log("the SCOMPARISON should have and can only have one key but here not");
		return false;
	}
	let theOnlySCOMPARATORKey = theSCOMPARATORKeysList[0];
	let sKeyParsing: string[];
	if (!theOnlySCOMPARATORKey.includes("_")) {
		console.log("the SCOMPARATORKey missing '_' ");
		return false;
	} else {
		sKeyParsing = theOnlySCOMPARATORKey.split("_");
		if (sKeyParsing.length !== 2) {
			console.log("the SCOMPARATORKey has more than one '_' ");
			return false;
		}
	}
	if (!checkSKeyParsingValidOrNot(sKeyParsing)) {
		console.log("This SKey Parsing is not valid");
		return false;
	}
	let inputString: any = theSCOMPARISON[theOnlySCOMPARATORKey];
	if (!checkInputStringValidOrNot(inputString)) {
		console.log("this InputString is not valid");
		return false;
	}
	return true;
}
export function checkSKeyParsingValidOrNot(sKeyParsing: string[]): boolean {
	let theOnlySCOMPARATORKeyIDString = sKeyParsing[0];
	let theOnlySCOMPARATORKeyMField = sKeyParsing[1];

	if (!theStoredIDList.includes(theOnlySCOMPARATORKeyIDString)) {
		console.log("some dataset ID referenced in SCOMPARATOR hasn't been added yet");
		return false;
	} else {
		if (theOnlySCOMPARATORKeyIDString !== currentReferencingDatasetID) {
			console.log("the SCOMPARATOR is referencing a different dataset that appears in COLUMNS");
			return false;
		}
	}

	if (!sfield.includes(theOnlySCOMPARATORKeyMField)) {
		console.log("the SCOMPARISON Field is not a valid one");
		return false;
	}
	return true;
}
