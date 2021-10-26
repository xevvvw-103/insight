import {InsightError} from "./IInsightFacade";
import {
	checkLOGICCOMPARISONValidOrNot,
	checkMCOMPARISONValidOrNot,
	checkNEGATIONValidOrNot,
	checkSCOMPARISONValidOrNot,
} from "./checkFILTERHelpeHelperrFunctions";
export const BODY: string = "WHERE";
export const OPTIONS: string = "OPTIONS";
export const QUERY: string[] = [BODY, OPTIONS];
export const mfield: string[] = ["avg", "pass", "fail", "audit", "year"];
export const sfield: string[] = ["dept", "id", "instructor", "title", "uuid"];
export const allfield: string[] = ["avg", "pass", "fail", "audit", "year", "dept", "id", "instructor", "title", "uuid"];
export let currentCOLUMNS: string[] = [];
// the current referencing DatasetID should be the first one reached in COLUMN
export let currentReferencingDatasetID: string = "";
export let theStoredIDList: string[] = [];

export function setTheStoredIDList(datasetIDList: string[]) {
	theStoredIDList = datasetIDList;
}

export function checkQUERYValidOrNot(query: any): boolean {
	console.log("now checking the Query Valid Or Not");

	if (typeof query === "object") {
		if (Array.isArray(query)) {
			console.log("QUERY is an object, but QUERY can't be an array");
			return false;
		}
	} else {
		console.log("QUERY is not even an Object");
		return false;
	}
	let QueryKeysList: any[] = Object.keys(query);
	if (!QueryKeysList.includes(BODY) || !QueryKeysList.includes(OPTIONS) || QueryKeysList.length !== 2) {
		console.log("QUERYKeys are invalid (BODY or OPTIONS missing or there are more/less than 2 query keys) ");
		return false;
	}
	let currentOPTIONS: any = query[OPTIONS];
	let currentWHERE: any = query[BODY];

	if (!checkOPTIONSValidOrNot(currentOPTIONS)) {
		console.log("OPTIONS is not valid");
		return false;
	}

	if (!checkWHEREValidOrNot(currentWHERE)) {
		console.log("WHERE is not valid");
		return false;
	}

	console.log("Query is valid");
	return true;
}

function checkOPTIONSValidOrNot(options: any): boolean {
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

function checkCOLUMNSValidOrNot(COLUMNS: any): boolean {
	let COLUMNSList: any[];
	if (!Array.isArray(COLUMNS)) {
		console.log("COLUMNS must be an array, but here not");
		return false;
	} else {
		COLUMNSList = COLUMNS;
		if (COLUMNSList.length === 0) {
			console.log("COLUMNS must be an non-empty array, but here it is empty");
			return false;
		}
	}
	for (let eachCOLUMN of COLUMNSList) {
		if (typeof eachCOLUMN !== "string") {
			console.log("COLUMNS must be an array of string, but here some element is not string");
			return false;
		}

		let eachCOLUMNParsing: string[];
		if (!eachCOLUMN.includes("_")) {
			console.log("the COLUMN " + eachCOLUMN + " SCOMPARATORKey missing '_' ");
			return false;
		} else {
			eachCOLUMNParsing = eachCOLUMN.split("_");
			if (eachCOLUMNParsing.length !== 2) {
				console.log("the COLUMN " + eachCOLUMN + " has more than one '_' ");
				return false;
			}
		}

		if (!checkEachCOLUMNParsingValidOrNot(eachCOLUMNParsing)) {
			console.log("this COLUMNParsing is not valid");
			return false;
		}
	}
	currentCOLUMNS = COLUMNSList;
	console.log("COLUMNS in OPTIONS is valid");
	return true;
}

function checkEachCOLUMNParsingValidOrNot(eachCOLUMNParsing: string[]): boolean {
	let eachCOLUMNIDString: string = eachCOLUMNParsing[0];
	let eachCOLUMNMField: string = eachCOLUMNParsing[1];

	if (!theStoredIDList.includes(eachCOLUMNIDString)) {
		console.log("the dataset ID referenced in COLUMNS hasn't been added yet");
		return false;
	} else {
		if (currentReferencingDatasetID === "") {
			currentReferencingDatasetID = eachCOLUMNIDString;
		} else {
			if (eachCOLUMNIDString !== currentReferencingDatasetID) {
				console.log("the COLUMNS are referencing different datasets");
				return false;
			}
		}
	}
	if (!allfield.includes(eachCOLUMNMField)) {
		console.log("this COLUMN has an invalid field");
		return false;
	}
	return true;
}

function checkORDERValidOrNot(ORDER: any): boolean {
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

function checkWHEREValidOrNot(WHERE: any): boolean {
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
