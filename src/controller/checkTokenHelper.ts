import {
	allfieldCourse, allfieldRoom,
	currentReferencingDatasetID,
	currentReferencingDatasetIDType,
	mfieldCourse, mfieldRoom,
	theStoredIDList
} from "./checkHelperFunctions";
import {InsightDatasetKind} from "./IInsightFacade";

export function checkMTOKENStuffValidOrNot(MTOKENStuff: any): boolean {
	if (typeof MTOKENStuff !== "string"){
		console.log("the MTOKENStuff must be a string, but here not");
		return false;
	}else {
		let MTOKENStuffParsing: string[];
		if (!MTOKENStuff.includes("_")) {
			console.log("the MTOKENStuff " + MTOKENStuff + " missing '_' ");
			return false;
		} else {
			MTOKENStuffParsing = MTOKENStuff.split("_");
			if (MTOKENStuffParsing.length !== 2) {
				console.log("the MTOKENStuff " + MTOKENStuff + " has more than one '_' ");
				return false;
			}
		}

		if (!checkMTOKENStuffParsingValidOrNot(MTOKENStuffParsing)) {
			console.log("this MTOKENStuffParsing is not valid");
			return false;
		}
	}
	return true;
}

function checkMTOKENStuffParsingValidOrNot(MTOKENStuffParsing: string[]): boolean {
	let MTOKENStuffIDString: string = MTOKENStuffParsing[0];
	let MTOKENStuffField: string = MTOKENStuffParsing[1];

	if (!theStoredIDList.includes(MTOKENStuffIDString)) {
		console.log("the dataset ID referenced in MTOKENStuff hasn't been added yet");
		return false;
	} else {
		if (MTOKENStuffIDString !== currentReferencingDatasetID) {
			console.log("the TRANSFORMATIONS are referencing different datasets");
			return false;
		}

	}
	if (currentReferencingDatasetIDType === InsightDatasetKind.Courses){
		if (!mfieldCourse.includes(MTOKENStuffField)) {
			console.log("this MTOKENStuff has an invalid field");
			return false;
		}
	}else {
		if (!mfieldRoom.includes(MTOKENStuffField)) {
			console.log("this MTOKENStuff has an invalid field");
			return false;
		}
	}

	return true;
}

export function checkSTOKENStuffValidOrNot(STOKENStuff: any): boolean {
	if (typeof STOKENStuff !== "string"){
		console.log("the STOKENStuff must be a string, but here not");
		return false;
	}else {
		let STOKENStuffParsing: string[];
		if (!STOKENStuff.includes("_")) {
			console.log("the STOKENStuff " + STOKENStuff + " missing '_' ");
			return false;
		} else {
			STOKENStuffParsing = STOKENStuff.split("_");
			if (STOKENStuffParsing.length !== 2) {
				console.log("the STOKENStuff " + STOKENStuff + " has more than one '_' ");
				return false;
			}
		}

		if (!checkSTOKENStuffParsingValidOrNot(STOKENStuffParsing)) {
			console.log("this STOKENStuffParsing is not valid");
			return false;
		}
	}
	return true;
}

function checkSTOKENStuffParsingValidOrNot(STOKENStuffParsing: string[]): boolean {
	let STOKENStuffIDString: string = STOKENStuffParsing[0];
	let STOKENStuffField: string = STOKENStuffParsing[1];

	if (!theStoredIDList.includes(STOKENStuffIDString)) {
		console.log("the dataset ID referenced in STOKENStuff hasn't been added yet");
		return false;
	} else {
		if (STOKENStuffIDString !== currentReferencingDatasetID) {
			console.log("the TRANSFORMATIONS are referencing different datasets");
			return false;
		}

	}
	if (currentReferencingDatasetIDType === InsightDatasetKind.Courses){
		if (!allfieldCourse.includes(STOKENStuffField)) {
			console.log("this STOKENStuff has an invalid field");
			return false;
		}
	}else {
		if (!allfieldRoom.includes(STOKENStuffField)) {
			console.log("this STOKENStuff has an invalid field");
			return false;
		}
	}

	return true;
}
