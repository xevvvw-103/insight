import Decimal from "decimal.js";

export function doTransformations(matchedResult: any[], group: string[], apply: any[]): any[]{
	let GroupObjectList: any[] = [];
	for (const result of matchedResult) {
		let resultWithOnlyGroupKeysValues: any[] = [];
		for (const eachGroupKey of group) {
			let eachGroupKeysValues: any = result[eachGroupKey];
			resultWithOnlyGroupKeysValues.push(eachGroupKeysValues);
		}
		let GroupExistOrNot: boolean = false;
		for (const eachGroupObject of GroupObjectList) {
			let onlyGroupKeysValues: any[] = eachGroupObject["OnlyGroupKeysValues"];
			if (allKeysValuesMatched(onlyGroupKeysValues, resultWithOnlyGroupKeysValues)) {
				GroupExistOrNot = true;
			}
		}

		if (GroupExistOrNot) {
			for (const eachGroupObject of GroupObjectList) {
				let onlyGroupKeysValues: any[] = eachGroupObject["OnlyGroupKeysValues"];
				if (allKeysValuesMatched(onlyGroupKeysValues, resultWithOnlyGroupKeysValues)) {
					eachGroupObject["ThisGroupList"].push(result);
				}
			}
		} else {
			let GroupObject: any = {};

			GroupObject["OnlyGroupKeysValues"] = resultWithOnlyGroupKeysValues;
			GroupObject["ThisGroupList"] = [];
			GroupObject["ThisGroupList"].push(result);
			for (const eachGroupKey of group) {
				GroupObject[eachGroupKey] = result[eachGroupKey];
			}
			GroupObjectList.push(GroupObject);
		}
	}

	for (let eachGroupObject of GroupObjectList) {
		for (const eachAPPLYRULE  of apply) {
			eachGroupObject = doAPPLY(eachGroupObject, eachAPPLYRULE);
		}
	}
	return GroupObjectList;
}

function allKeysValuesMatched(eachGroupKeysValues: any, currentResultWithOnlyGroupKeysValues: any): boolean {
	let i: number;
	for (i = 0; i < eachGroupKeysValues.length; i++) {
		if (eachGroupKeysValues[i] !== currentResultWithOnlyGroupKeysValues[i]) {
			return false;
		}
	}
	return true;
}

function doAPPLY(eachGroupObject: any, applyRule: any): any {
	let thisGroupList: any[] = eachGroupObject["ThisGroupList"];
	let applyKey: string = Object.keys(applyRule)[0];
	let applyKeyStuff: any = applyRule[applyKey];
	let applyToken: string = Object.keys(applyKeyStuff)[0];
	let applyTokenStuff: string = applyKeyStuff[applyToken];
	if (applyToken === "MAX") {
		eachGroupObject[applyKey] = maxHelper(thisGroupList, applyTokenStuff);
	} else if (applyToken === "MIN") {
		eachGroupObject[applyKey] = minHelper(thisGroupList, applyTokenStuff);
	} else if (applyToken === "SUM") {
		eachGroupObject[applyKey] = sumHelper(thisGroupList, applyTokenStuff);
	} else if (applyToken === "AVG") {
		eachGroupObject[applyKey] = avgHelper(thisGroupList, applyTokenStuff);
	} else if (applyToken === "COUNT") {
		eachGroupObject[applyKey] = countHelper(thisGroupList, applyTokenStuff);
	}
	return eachGroupObject;
}

function maxHelper(thisGroupList: any[], applyTokenStuff: string): number {
	let max: number = -Infinity;
	for (const eachItemInThisGroup of thisGroupList) {
		if (eachItemInThisGroup[applyTokenStuff] > max) {
			max = eachItemInThisGroup[applyTokenStuff];
		}
	}
	return max;
}

function minHelper(thisGroupList: any[], applyTokenStuff: string): number {
	let min: number = Infinity;
	for (const eachItemInThisGroup of thisGroupList) {
		if (eachItemInThisGroup[applyTokenStuff] < min) {
			min = eachItemInThisGroup[applyTokenStuff];
		}
	}
	return min;
}

function sumHelper(thisGroupList: any[], applyTokenStuff: string): number {
	let sum = new Decimal(0);
	for (let eachItemInThisGroup of thisGroupList) {
		let convertedValue = new Decimal(eachItemInThisGroup[applyTokenStuff]);
		sum = Decimal.add(sum, convertedValue);
	}
	return Number(sum.toFixed(2));
}

function avgHelper(thisGroupList: any[], applyTokenStuff: string): number {
	let total = new Decimal(0);
	for (let eachItemInThisGroup of thisGroupList) {
		let convertedValue = new Decimal(eachItemInThisGroup[applyTokenStuff]);
		total = Decimal.add(total, convertedValue);
	}
	let numRows: number = thisGroupList.length;
	const avg = total.toNumber() / numRows;
	return Number(avg.toFixed(2));
}

function countHelper(thisGroupList: any[], applyTokenStuff: string): number {
	let countedList: any[] = [];
	let count: number = 0;
	for (let eachItemInThisGroup of thisGroupList) {
		if (!(countedList.includes(eachItemInThisGroup[applyTokenStuff]))) {
			countedList.push(eachItemInThisGroup[applyTokenStuff]);
			count++;
		}
	}
	return count;
}
