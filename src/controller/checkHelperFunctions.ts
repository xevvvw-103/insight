import {InsightError} from "./IInsightFacade";
import {checkFILTERValidOrNot, checkOPTIONSValidOrNot, checkWHEREValidOrNot} from "./validCheck";

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

export function isIDValid(id: string): boolean {
	if (id === null) {
		console.log("ID is null");
		return false;
	}
	if (id.includes("_")) {
		console.log("ID contains an underscore");
		return false;
	}
	if (!id.trim()) {
		console.log("ID contains only white spaces");
		return false;
	}

	if (theStoredIDList.includes(id)) {
		console.log("ID already existed");
		return false;
	}
	return true;
}

export function makeSectionToStore(id: string, section: any): any[] {
	let sectionToStore: any = {};
	sectionToStore[id + "_dept"] = String(section["Subject"]);
	sectionToStore[id + "_id"] = String(section["Course"]);
	sectionToStore[id + "_avg"] = Number(section["Avg"]);
	sectionToStore[id + "_instructor"] = String(section["Professor"]);
	sectionToStore[id + "_title"] = String(section["Title"]);
	sectionToStore[id + "_pass"] = Number(section["Pass"]);
	sectionToStore[id + "_fail"] = Number(section["Fail"]);
	sectionToStore[id + "_audit"] = Number(section["Audit"]);
	sectionToStore[id + "_uuid"] = String(section["id"]);
	sectionToStore[id + "_year"] = Number(section["Year"]);
	return sectionToStore;
}

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

export function checkCOLUMNSValidOrNot(COLUMNS: any): boolean {
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

export function checkEachCOLUMNParsingValidOrNot(eachCOLUMNParsing: string[]): boolean {
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

export function filterTheCOLUMNS(matchedResult: any[], columns: string[], order: string): any[] {
	let matchedResultWithFilteredColumns: any[] = [];
	for (let eachMatchedResult of matchedResult) {
		let eachMatchedResultWithFilteredColumns: any = {};
		for (let eachColumn of columns) {
			eachMatchedResultWithFilteredColumns[eachColumn] = eachMatchedResult[eachColumn];
		}
		matchedResultWithFilteredColumns.push(eachMatchedResultWithFilteredColumns);
	}
	if (order === "") {
		console.log("there is no order in OPTIONS, so no need to change the order of the result");
		return matchedResultWithFilteredColumns;
	} else {
		console.log("there is an order in OPTIONS, changing the order of the result");
		matchedResultWithFilteredColumns.sort((a, b) => (a[order] > b[order] ? 1 : b[order] > a[order] ? -1 : 0));
		return matchedResultWithFilteredColumns;
	}
}
