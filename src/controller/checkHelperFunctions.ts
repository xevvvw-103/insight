import {InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import {
	checkLOGICCOMPARISONValidOrNot,
	checkMCOMPARISONValidOrNot,
	checkNEGATIONValidOrNot,
	checkSCOMPARISONValidOrNot,
} from "./checkFILTERHelperHelperFunctions";
import {checkTransformationsValidOrNot} from "./checkTransformationsHelper";
import {checkORDERValidOrNot} from "./checkOrderHelper";
import {checkCOLUMNSValidOrNot} from "./checkColumnsHelper";
export const BODY: string = "WHERE";
export const OPTIONS: string = "OPTIONS";
export const TRANSFORMATIONS: string = "TRANSFORMATIONS";
export const QUERY: string[] = [BODY, OPTIONS];
export const mfieldCourse: string[] = ["avg", "pass", "fail", "audit", "year"];
export const sfieldCourse: string[] = ["dept", "id", "instructor", "title", "uuid"];
export const allfieldCourse: string[] = [...mfieldCourse, ...sfieldCourse];

export const mfieldRoom: string[] = ["lat", "lon", "seats"];
export const sfieldRoom: string[] = ["fullname", "shortname", "number", "name", "address", "type", "furniture", "href"];
export const allfieldRoom: string[] = [...mfieldRoom, ...sfieldRoom];

export const ALLTOKENS: string[] = ["MAX", "MIN", "AVG", "COUNT", "SUM"];
export const MTOKENS: string[] = ["MAX", "MIN", "AVG", "SUM"];
export const STOKENS: string[] = ["COUNT"];

export let currentCOLUMNS: string[] = [];
export let currentGROUP: string[] = [];
export let currentAPPLYKeys: string[] = [];

// the current referencing DatasetID should be the first one reached in COLUMN/TRANSFORMATIONS
export let currentReferencingDatasetID: string = "";
export let currentReferencingDatasetIDType: InsightDatasetKind;
export let theStoredDatasetList: InsightDataset[] = [];
export let theStoredIDList: string[] = [];


export function setTheStoredIDList(datasetIDList: string[]) {
	theStoredIDList = datasetIDList;
}

export function setTheStoredDatasetList(insightDatasets: InsightDataset[]) {
	theStoredDatasetList = insightDatasets;
}

export function setCurrentReferencingDatasetID(id: string) {
	currentReferencingDatasetID = id;
}

export function setCurrentReferencingDatasetIDType(type: InsightDatasetKind) {
	currentReferencingDatasetIDType = type;
}

export function setCurrentGroup(group: string[]) {
	currentGROUP = group;
}

export function setCurrentColumns(columns: string[]) {
	currentCOLUMNS = columns;
}

export function addApplyToCurrentAPPLYKeys(applyKey: string) {
	currentAPPLYKeys.push(applyKey);
}

export function checkQUERYValidOrNot(query: any): boolean {
	console.log("now checking the Query Valid Or Not");
	let hasTransformations: boolean = false;
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
	if (QueryKeysList.includes(TRANSFORMATIONS)){
		console.log("The QUERYKeys has a transformation part");
		hasTransformations = true;
		if (!QueryKeysList.includes(BODY) || !QueryKeysList.includes(OPTIONS) || QueryKeysList.length !== 3) {
			console.log("QUERYKeys are invalid (BODY or OPTIONS missing or there are more/less than 3 query key) ");
			return false;
		}
	} else {
		console.log("The QUERYKeys do not have a transformation part");
		if (!QueryKeysList.includes(BODY) || !QueryKeysList.includes(OPTIONS) || QueryKeysList.length !== 2) {
			console.log("QUERYKeys are invalid (BODY or OPTIONS missing or there are more/less than 2 query keys) ");
			return false;
		}
	}
	if (hasTransformations){
		let currentTRANSFORMATIONS: any = query[TRANSFORMATIONS];
		if (!checkTransformationsValidOrNot(currentTRANSFORMATIONS)){
			console.log("TRANSFORMATIONS is not valid");
			return false;
		}
	}
	let currentOPTIONS: any = query[OPTIONS];
	let currentWHERE: any = query[BODY];

	if (!checkOPTIONSValidOrNot(currentOPTIONS, hasTransformations)) {
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

function checkOPTIONSValidOrNot(options: any, hasTransformations: boolean): boolean {
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
			if (!checkCOLUMNSValidOrNot(options["COLUMNS"], hasTransformations)) {
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
			if (!checkCOLUMNSValidOrNot(options["COLUMNS"], hasTransformations)) {
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

export function resetAllStuff() {
	currentCOLUMNS = [];
	currentGROUP = [];
	currentAPPLYKeys = [];
	currentReferencingDatasetID = "";
	theStoredDatasetList = [];
	theStoredIDList = [];
}
