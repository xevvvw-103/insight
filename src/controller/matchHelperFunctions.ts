export function matchFILTER(data: any[], thisFilter: any): any[] {
	console.log("now matching FILTER");
	let matchedResult: any[] = [];
	if (Object.keys(thisFilter).length === 0) {
		console.log("this filter is empty, so this can only be the filter in WHERE, so all result matched");
		matchedResult = data;
	} else {
		let theOnlyKeyInFILTER: any = Object.keys(thisFilter)[0];

		if (theOnlyKeyInFILTER === "AND" || theOnlyKeyInFILTER === "OR") {
			let TheLOGICCOMPARISON: any[] = thisFilter[theOnlyKeyInFILTER];
			matchedResult = matchLogicComparison(data, theOnlyKeyInFILTER, TheLOGICCOMPARISON);
		}

		if (theOnlyKeyInFILTER === "GT" || theOnlyKeyInFILTER === "LT" || theOnlyKeyInFILTER === "EQ") {
			let theMCOMPARISON: any = thisFilter[theOnlyKeyInFILTER];
			matchedResult = matchMComparison(data, theOnlyKeyInFILTER, theMCOMPARISON);
		}

		if (theOnlyKeyInFILTER === "IS") {
			let theSCOMPARISON: any = thisFilter[theOnlyKeyInFILTER];
			matchedResult = matchSComparison(data, theSCOMPARISON);
		}

		if (theOnlyKeyInFILTER === "NOT") {
			let theNEGATION: any = thisFilter[theOnlyKeyInFILTER];
			matchedResult = matchNegation(data, theNEGATION);
		}
	}
	return matchedResult;
}
function matchLogicComparison(data: any[], TheLOGICCOMPARISONKey: string, TheLOGICCOMPARISON: any[]): any[] {
	let matchedResult: any[];
	if (TheLOGICCOMPARISONKey === "AND") {
		matchedResult = data;
		for (let eachFILTER of TheLOGICCOMPARISON) {
			matchedResult = matchFILTER(matchedResult, eachFILTER);
		}
		return matchedResult;
	} else {
		matchedResult = [];
		for (let eachFILTER of TheLOGICCOMPARISON) {
			let currentResultOfEachFILTER: any[] = matchFILTER(data, eachFILTER);
			for (let eachResult of currentResultOfEachFILTER) {
				if (!matchedResult.includes(eachResult)) {
					matchedResult.push(eachResult);
				}
			}
		}
		return matchedResult;
	}
}
function matchMComparison(data: any[], TheMCOMPARISONKey: string, theMCOMPARISON: any): any[] {
	let matchedResult: any[] = [];
	let theMKey = Object.keys(theMCOMPARISON)[0];
	let theMValue: number = theMCOMPARISON[theMKey];
	if (TheMCOMPARISONKey === "GT") {
		for (let eachSection of data) {
			if (eachSection[theMKey] > theMValue) {
				matchedResult.push(eachSection);
			}
		}
		return matchedResult;
	} else if (TheMCOMPARISONKey === "LT") {
		for (let eachSection of data) {
			if (eachSection[theMKey] < theMValue) {
				matchedResult.push(eachSection);
			}
		}
		return matchedResult;
	} else {
		for (let eachSection of data) {
			if (eachSection[theMKey] === theMValue) {
				matchedResult.push(eachSection);
			}
		}
		return matchedResult;
	}
}
function matchSComparison(data: any[], theSCOMPARISON: any): any[] {
	let matchedResult: any[] = [];
	let theSKey: string = Object.keys(theSCOMPARISON)[0];
	let inputString: string = theSCOMPARISON[theSKey];

	if (inputString.includes("*")) {
		const stringOnlyContainsAstrisks = inputString.replace(/[^*]/g, "");
		const numberOfAstrisksInInputString = stringOnlyContainsAstrisks.length;

		if (numberOfAstrisksInInputString === 2) {
			matchedResult = matchContainInputString(theSKey, inputString, data);
			return matchedResult;
		} else {
			if (inputString.charAt(0) === "*") {
				matchedResult = matchEndWithInputString(theSKey, inputString, data);
				return matchedResult;
			} else {
				matchedResult = matchStartWithInputString(theSKey, inputString, data);
				return matchedResult;
			}
		}
	} else {
		for (let eachSection of data) {
			if (eachSection[theSKey] === inputString) {
				matchedResult.push(eachSection);
			}
		}
		return matchedResult;
	}
}
function matchNegation(data: any[], theNEGATION: any): any[] {
	let matchedResult: any[] = [];
	let notMatchedResult: any[] = matchFILTER(data, theNEGATION);
	for (let eachSection of data) {
		if (!notMatchedResult.includes(eachSection)) {
			matchedResult.push(eachSection);
		}
	}
	return matchedResult;
}

function matchContainInputString(theSKey: string, inputString: string, data: any[]): any[] {
	let matchedResult: any[] = [];
	let inputStringWithoutAstrisk: string = inputString.substring(1, inputString.length - 1);
	for (let eachSection of data) {
		if (eachSection[theSKey].includes(inputStringWithoutAstrisk)) {
			matchedResult.push(eachSection);
		}
	}
	return matchedResult;
}
function matchEndWithInputString(theSKey: string, inputString: string, data: any[]): any[] {
	let matchedResult: any[] = [];
	let inputStringWithoutAstrisk: string = inputString.substring(1);
	let inputStringWithoutAstriskLength: number = inputStringWithoutAstrisk.length;
	for (let eachSection of data) {
		let eachSectionSValue: string = eachSection[theSKey];
		let eachSectionSValueLength: number = eachSectionSValue.length;
		if (eachSectionSValueLength >= inputStringWithoutAstriskLength) {
			let substringStartingIndex: number = eachSectionSValueLength - inputStringWithoutAstriskLength;
			if (eachSectionSValue.substring(substringStartingIndex) === inputStringWithoutAstrisk) {
				matchedResult.push(eachSection);
			}
		}
	}
	return matchedResult;
}
function matchStartWithInputString(theSKey: string, inputString: string, data: any[]): any[] {
	let matchedResult: any[] = [];
	let inputStringWithoutAstrisk: string = inputString.substring(0, inputString.length - 1);
	let inputStringWithoutAstriskLength: number = inputStringWithoutAstrisk.length;
	for (let eachSection of data) {
		let eachSectionSValue: string = eachSection[theSKey];
		let eachSectionSValueLength: number = eachSectionSValue.length;
		if (eachSectionSValueLength >= inputStringWithoutAstriskLength) {
			if (eachSectionSValue.substring(0, inputStringWithoutAstriskLength) === inputStringWithoutAstrisk) {
				matchedResult.push(eachSection);
			}
		}
	}
	return matchedResult;
}

export function filterTheCOLUMNS(matchedResult: any[], columns: string[], order: any): any[] {
	let matchedResultWithFilteredColumns: any[] = [];
	for (let eachMatchedResult of matchedResult) {
		let eachMatchedResultWithFilteredColumns: any = {};
		for (let eachColumn of columns) {
			eachMatchedResultWithFilteredColumns[eachColumn] = eachMatchedResult[eachColumn];
		}
		matchedResultWithFilteredColumns.push(eachMatchedResultWithFilteredColumns);
	}
	if (order === null) {
		console.log("there is no order in OPTIONS, so no need to change the order of the result");
	} else if (typeof order === "string"){
		console.log("there is a string order in OPTIONS, so now changing the order of the result");
		matchedResultWithFilteredColumns.sort((a, b) => (a[order] > b[order] ? 1 : b[order] > a[order] ? -1 : 0));
	} else {
		console.log("there is an object order in OPTIONS, so now changing the order of the result");
		let dir: any = order["dir"];
		let orderKeys: any[] = order["keys"];
		if (dir === "UP"){
			for (const eOK of orderKeys){
				matchedResultWithFilteredColumns.sort((a, b) => (a[eOK] > b[eOK] ? 1 : b[eOK] > a[eOK] ? -1 : 0));
			}
		}else {
			for (const eOK of orderKeys){
				matchedResultWithFilteredColumns.sort((a, b) => (a[eOK] > b[eOK] ? -1 : b[eOK] > a[eOK] ? 1 : 0));
			}
		}
	}
	return matchedResultWithFilteredColumns;
}
