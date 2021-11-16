import {InsightDatasetKind} from "./IInsightFacade";
import {
	allfieldCourse,
	allfieldRoom,
	currentAPPLYKeys,
	currentGROUP,
	currentReferencingDatasetID,
	currentReferencingDatasetIDType,
	setCurrentColumns,
	setCurrentReferencingDatasetID,
	setCurrentReferencingDatasetIDType,
	theStoredDatasetList,
	theStoredIDList
} from "./checkHelperFunctions";

export function checkCOLUMNSValidOrNot(COLUMNS: any, hasTransformations: boolean): boolean {
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

		if (hasTransformations){
			if (!currentGROUP.includes(eachCOLUMN) && !currentAPPLYKeys.includes(eachCOLUMN)){
				console.log("this COLUMN is not referenced in TRANSFORMATIONS");
				return false;
			}
		}else {
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

	}
	setCurrentColumns(COLUMNSList);
	console.log("COLUMNS in OPTIONS is valid");
	return true;
}
function checkEachCOLUMNParsingValidOrNot(eachCOLUMNParsing: string[]): boolean {
	let eachCOLUMNIDString: string = eachCOLUMNParsing[0];
	let eachCOLUMNField: string = eachCOLUMNParsing[1];

	if (!theStoredIDList.includes(eachCOLUMNIDString)) {
		console.log("the dataset ID referenced in COLUMNS hasn't been added yet");
		return false;
	} else {
		if (currentReferencingDatasetID === "") {
			setCurrentReferencingDatasetID(eachCOLUMNIDString);
			for (const dataset of theStoredDatasetList){
				if (dataset.id === currentReferencingDatasetID){
					setCurrentReferencingDatasetIDType(dataset.kind);
				}
			}
		} else {
			if (eachCOLUMNIDString !== currentReferencingDatasetID) {
				console.log("the COLUMNS are referencing different datasets");
				return false;
			}
		}
	}
	if (currentReferencingDatasetIDType === InsightDatasetKind.Courses){
		if (!allfieldCourse.includes(eachCOLUMNField)) {
			console.log("this COLUMN has an invalid field");
			return false;
		}
	}else {
		if (!allfieldRoom.includes(eachCOLUMNField)) {
			console.log("this COLUMN has an invalid field");
			return false;
		}
	}

	return true;
}
