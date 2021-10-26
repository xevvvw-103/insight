import {
	checkFILTERValidOrNot,
	currentReferencingDatasetID,
	mfield,
	sfield,
	theStoredIDList,
} from "./checkHelperFunctions";

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

export function checkInputStringValidOrNot(inputString: any): boolean {
	if (typeof inputString !== "string") {
		console.log("inputString must be a String, but here not");
		return false;
	}

	if (inputString.includes("*")) {
		const stringOnlyContainsAstrisks = inputString.replace(/[^*]/g, "");
		const numberOfAstrisksInInputString = stringOnlyContainsAstrisks.length;
		if (numberOfAstrisksInInputString > 2) {
			console.log("number of * in the inputString exceeds two");
			return false;
		} else if (numberOfAstrisksInInputString === 2) {
			if (!(inputString.charAt(0) === "*" && inputString.charAt(inputString.length - 1) === "*")) {
				console.log("* appears in the middle of the inputString");
				return false;
			}
		} else if (numberOfAstrisksInInputString === 1) {
			if (!(inputString.charAt(0) === "*") && !(inputString.charAt(inputString.length - 1) === "*")) {
				console.log("* appears in the middle of the inputString");
				return false;
			}
		}
	}
	return true;
}

export function checkNEGATIONValidOrNot(theOnlyFilterKey: string, FILTER: any): boolean {
	let theNEGATION: any = FILTER[theOnlyFilterKey];
	if (typeof theNEGATION === "object") {
		if (Array.isArray(theNEGATION)) {
			console.log("theNEGATION is an object, but it can't be an array");
			return false;
		}
	} else {
		console.log("theNEGATION is not even an object");
		return false;
	}

	if (!checkFILTERValidOrNot(theNEGATION, false)) {
		console.log("FILTER in NOT is not valid");
		return false;
	}
	return true;
}
