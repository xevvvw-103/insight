import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "./IInsightFacade";
import * as fs from "fs-extra";
import * as JSZip from "jszip";
import * as checkHelper from "./checkHelperFunctions";
import * as matchHelper from "./matchHelperFunctions";
import * as otherHelper from "./otherHelperFunctions";
import * as transformationsHelper from "./transformationHelperFunctions";
import {indexHandler, infoHandler,} from "./roomsHelpers";


/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	public insightDatasets: InsightDataset[] = [];
	public datasetIDList: string[] = [];
	public sectionsListToStore: any[] = [];

	constructor() {
		console.trace("InsightFacadeImpl::init()");
		// initiate the folder to store data
		this.LoadFiles();
	}

	private LoadFiles() {
		this.insightDatasets = [];
		this.datasetIDList = [];
		if (!fs.existsSync("./data/")) {
			fs.mkdirSync("./data/");
		}
		let thisObject: this;
		thisObject = this;
		let files = fs.readdirSync("./data/");
		files.forEach(function (fileName) {
			let content = JSON.parse(fs.readFileSync("./data/" + fileName, "utf8"));
			// file name format: id + $ + kind
			let thisID = fileName.split("$")[0];
			let thisKind = (fileName.split("$")[1] === InsightDatasetKind.Courses.toString()) ?
				InsightDatasetKind.Courses : InsightDatasetKind.Rooms;
			thisObject.datasetIDList.push(thisID);
			let currentDataset: InsightDataset;
			let numOfRows: number = 0;
			try {
				numOfRows = content.length;
				currentDataset = {id: thisID, kind: thisKind, numRows: numOfRows};
				thisObject.insightDatasets.push(currentDataset);
			} catch (err) {
				return Promise.reject(new InsightError("An error occurred in reading ./data/ files"));
			}
		});
		console.log("Loaded datasetIDList: ");
		console.log(thisObject.datasetIDList);
		console.log("-------------------------");
		console.log("Loaded insightDatasets: ");
		console.log(thisObject.insightDatasets);
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		let thisObject: this;
		thisObject = this;
		thisObject.LoadFiles();
		let coursesPromisesList: any[] = [];
		otherHelper.setTheStoredIDList(thisObject.datasetIDList);
		return new Promise(function (resolve, reject) {
			if (!otherHelper.isIDValid(id)) {
				return reject(new InsightError("invalid ID"));
			}
			if (kind === InsightDatasetKind.Courses) {
				JSZip.loadAsync(content, {base64: true}).then((zipObj: any) => {
					const coursesFolder = zipObj.folder("courses");
					coursesFolder.forEach((relativePath: string, file: any) => {
						coursesPromisesList.push(file.async("string"));
					});
					thisObject.sectionsListToStore = [];
					Promise.all(coursesPromisesList).then((coursesList: any) => {
						if (coursesList.length === 0) {
							return reject(new InsightError("no course file in the courses folder"));
						}
						thisObject.updateHelper(thisObject, coursesList, id, reject);
						let numOfRows: number = thisObject.sectionsListToStore.length;
						if (thisObject.sectionsListToStore.length === 0) {
							reject(new InsightError("the sections list is empty"));
						}
						thisObject.addDatasetHelper(id, thisObject.sectionsListToStore, kind, numOfRows);
						return resolve(thisObject.datasetIDList);
					});
				}).catch(function (error: any) {
					return reject(new InsightError(error));
				});
			} else if (kind === InsightDatasetKind.Rooms) {
				let roomsPromise: Array<Promise<any>> = [];
				let containedBuildingList: string[] = [];
				JSZip.loadAsync(content, {base64: true}).then(async (zip: any) => {
					await indexHandler(zip, reject, containedBuildingList);
					infoHandler(id, containedBuildingList, zip, reject, roomsPromise);
					Promise.all(roomsPromise).then((roomList) => {
						thisObject.lastStep(thisObject, roomList, id, kind);
						resolve(thisObject.datasetIDList);
					});
				}).catch(() => {
					reject(new InsightError("index.htm error"));
				});
			}
		});
	}

	private updateHelper(thisObject: this, coursesList: any, id: string, reject: (reason?: any) => void) {
		let updateSuccessOrNot: boolean = thisObject.updateSectionsListToStore(coursesList, id);
		if (!updateSuccessOrNot) {
			reject(new InsightError("try adding sections error"));
		}
	}

	private lastStep(thisObject: this, roomList: any[], id: string, kind: InsightDatasetKind.Rooms) {
		let result: any[] = [];
		thisObject.updateResult(roomList, result);
		let numOfRows = result.length;
		thisObject.addDatasetHelper(id, result, kind, numOfRows);
	}

	private updateResult(roomList: any[], result: any[]) {
		roomList.forEach((roomsInBuilding) => {
			if (roomsInBuilding.length !== 0) {
				roomsInBuilding.forEach((room: any) => {
					result.push(room);
				});
			}
		});
	}

	public removeDataset(id: string): Promise<string> {
		let thisObject: this;
		thisObject = this;
		thisObject.LoadFiles();
		function deleteHelper() {
			thisObject.datasetIDList.forEach((currentID, index) => {
				if (currentID === id) {
					delete thisObject.datasetIDList[index];
				}
			});
			thisObject.insightDatasets.forEach((currentInsightDataset, index) => {
				if (currentInsightDataset.id === id) {
					delete thisObject.insightDatasets[index];
				}
			});
		}
		return new Promise((resolve, reject) => {
			try {
				const path = "./data/" + id;
				if (fs.existsSync(path + "$" + "courses")) {
					fs.unlink("./data/" + id + "$" + "courses", function (err: any) {
						if (err) {
							throw new InsightError("unexpected error");
						} else {
							deleteHelper();
							resolve(id);
						}
					});
				} else if (fs.existsSync(path + "$" + "rooms")) {
					fs.unlink("./data/" + id + "$" + "rooms", function (err: any) {
						if (err) {
							throw new InsightError("unexpected error");
						} else {
							deleteHelper();
							resolve(id);
						}
					});
				}
			} catch (err) {
				reject(new NotFoundError("remove file/id not exist"));
			}
		});
	}

	public listDatasets(): Promise<InsightDataset[]> {
		let thisObject: this;
		thisObject = this;
		thisObject.LoadFiles();
		return new Promise<InsightDataset[]>(function (resolve) {
			return resolve(thisObject.insightDatasets);
		});
	}

	public performQuery(query: any): Promise<any[]> {
		let thisObject: this;
		thisObject = this;
		thisObject.LoadFiles();
		checkHelper.setTheStoredIDList(thisObject.datasetIDList);
		checkHelper.setTheStoredDatasetList(thisObject.insightDatasets);
		return new Promise((resolve, reject) => {
			if (checkHelper.checkQUERYValidOrNot(query)) {
				let theFILTERInWHERE: any = query["WHERE"];
				let options: any = query["OPTIONS"];
				let columns: any[] = options["COLUMNS"];
				let order: string = "";
				if (Object.keys(options).includes("ORDER")) {
					order = options["ORDER"];
				}
				let data: any[] = [];

				let path: string = "./data/" + checkHelper.currentReferencingDatasetID + "$" +
					checkHelper.currentReferencingDatasetIDType;
				try {
					const content = fs.readFileSync(path, "utf8");
					data = JSON.parse(content);
				} catch (err) {
					return reject(new InsightError("file reading error"));
				}
				let matchedResult: any[];
				let resultFilteredColumns: any[];
				matchedResult = matchHelper.matchFILTER(data, theFILTERInWHERE);
				if (Object.keys(query).includes("TRANSFORMATIONS")){
					let transformations: any = query["TRANSFORMATIONS"];
					let group: string[] = transformations["GROUP"];
					let apply: any[] = transformations["APPLY"];
					matchedResult = transformationsHelper.doTransformations(matchedResult, group, apply);
				}
				if (matchedResult.length > 5000) {
					checkHelper.resetAllStuff();
					return reject(new InsightError("Only queries with a maximum of 5000 results are supported."));
				} else {
					resultFilteredColumns = matchHelper.filterTheCOLUMNS(matchedResult, columns, order);
					checkHelper.resetAllStuff();
					return resolve(resultFilteredColumns);
				}
			} else {
				checkHelper.resetAllStuff();
				return reject(new InsightError("This query is not valid"));
			}
		});
	}

	public updateSectionsListToStore(coursesList: any, id: string): boolean {
		this.sectionsListToStore = [];
		for (const course of coursesList) {
			try {
				let currentCourseSectionsList = JSON.parse(course)["result"];
				if (currentCourseSectionsList.length > 0) {
					for (const section of currentCourseSectionsList) {
						this.sectionsListToStore.push(otherHelper.makeSectionToStore(id, section));
					}
				}
			} catch (e) {
				return false;
			}
		}
		return true;
	}

	public addDatasetHelper(id: string, sectionsListToStore: any[], kind: InsightDatasetKind, numOfRows: number) {
		let currentDataset: InsightDataset = {id, kind, numRows: numOfRows};
		fs.writeFileSync("./data/" + id + "$" + kind, JSON.stringify(sectionsListToStore), "utf8");
		this.insightDatasets.push(currentDataset);
		this.datasetIDList.push(id);
		console.log("dataset: " + id + "$" + kind + " added successfully");
	}
}
