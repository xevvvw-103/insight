import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "./IInsightFacade";
import * as fs from "fs-extra";
import * as JSZip from "jszip";
import * as checkHelper from "./checkHelperFunctions";
import * as matchHelper from "./matchHelperFunctions";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	public insightDatasets: InsightDataset[];
	public datasetIDList: string[];

	constructor() {
		console.trace("InsightFacadeImpl::init()");
		this.insightDatasets = [];
		this.datasetIDList = [];
		// initiate the folder to store data
		if (!fs.existsSync("./data/")) {
			fs.mkdirSync("./data/");
		}
		let thisObject: this;
		thisObject = this;
		let files = fs.readdirSync("./data/");
		files.forEach(function (fileName) {
			thisObject.datasetIDList.push(fileName);
			let data;
			let currentDataset: InsightDataset;
			let id: string = fileName;
			let numOfRows: number;
			numOfRows = 0;
			try {
				const content = fs.readFileSync("./data/" + fileName, "utf8");
				data = JSON.parse(content);
				numOfRows = data.length;
				currentDataset = {id, kind: InsightDatasetKind.Courses, numRows: numOfRows};
				thisObject.insightDatasets.push(currentDataset);
			} catch (err) {
				return Promise.reject(new InsightError("files in data dir reading error"));
			}
		});
		console.log("This the loaded datasetIDList in the InsightFacade Constructor: ");
		console.log(thisObject.datasetIDList);
		console.log("");
		console.log("This the loaded insightDatasets in the InsightFacade Constructor: ");
		console.log(thisObject.insightDatasets);
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		let thisObject: this;
		thisObject = this;
		let coursesPromisesList: any[] = [];
		checkHelper.setTheStoredIDList(thisObject.datasetIDList);
		return new Promise(function (resolve, reject) {
			if (!checkHelper.isIDValid(id)) {
				return reject(new InsightError("invalid ID"));
			}
			if (kind === InsightDatasetKind.Courses) {
				JSZip.loadAsync(content, {base64: true}).then((zipObj: any) => {
					const coursesFolder = zipObj.folder("courses");
					coursesFolder.forEach((relativePath: string, file: any) => {
						const currentCoursePromise = file.async("string");
						coursesPromisesList.push(currentCoursePromise);
					});
					let sectionsListToStore: any[] = [];
					let numOfRows: number = 0;
					Promise.all(coursesPromisesList).then((coursesList: any) => {
						if (coursesList.length === 0) {
							return reject(new InsightError("no course file in the courses folder"));
						}
						for (const course of coursesList) {
							try {
								let currentCourseSectionsList = JSON.parse(course)["result"];
								if (currentCourseSectionsList.length > 0) {
									for (const section of currentCourseSectionsList) {
										sectionsListToStore.push(checkHelper.makeSectionToStore(id, section));
										numOfRows += 1;
									}
								}
							} catch (e) {
								return reject(new InsightError("try adding sections error"));
							}
						}
						if (sectionsListToStore.length === 0) {
							return reject(new InsightError("the sections list to be stored is empty"));
						} else {
							thisObject.addDatasetHelper(id, sectionsListToStore, numOfRows);
							return resolve(thisObject.datasetIDList);
						}
					});
				});
			} else {
				reject(new InsightError("invalid kind, should be Course only"));
			}
		});
	}

	// 			}).catch(function (error: any) {
	// 				return reject(new InsightError(error));
	// 			});
	// 		}).catch(function (error: any) {
	// 			return reject(new InsightError(error));
	// 		});
	// 	}  else {
	// 		return reject(new InsightError("invalid kind, should be Course only"));
	// 	}
	// });

	public removeDataset(id: string): Promise<string> {
		let thisObject: this;
		thisObject = this;
		let path: string = "./data/" + id;
		return new Promise((resolve, reject) => {
			if (id === null) {
				return reject(new InsightError("ID is null"));
			}
			if (id.includes("_")) {
				return reject(new InsightError("ID contains an underscore"));
			}
			if (!id.trim()) {
				return reject(new InsightError("ID contains only white spaces"));
			}
			if (fs.existsSync(path)) {
				fs.unlink(path, (err2) => {
					if (err2) {
						return reject(new InsightError("unexpected error"));
					} else {
						// remove id from datasetIDList
						thisObject.datasetIDList.forEach((currentID, index) => {
							if (currentID === id) {
								delete thisObject.datasetIDList[index];
							}
						});
						// remove insightDataset from insightDatasets
						thisObject.insightDatasets.forEach((currentInsightDataset, index) => {
							if (currentInsightDataset.id === id) {
								delete thisObject.datasetIDList[index];
							}
						});
						return resolve(id);
					}
				});
			} else {
				return reject(new NotFoundError("remove file/id not exist"));
			}
		});
	}

	public listDatasets(): Promise<InsightDataset[]> {
		let thisObject: this;
		thisObject = this;
		return new Promise<InsightDataset[]>(function (resolve) {
			return resolve(thisObject.insightDatasets);
		});
	}

	public performQuery(query: any): Promise<any[]> {
		let thisObject: this;
		thisObject = this;
		checkHelper.setTheStoredIDList(thisObject.datasetIDList);
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
				try {
					const content = fs.readFileSync("./data/" + checkHelper.currentReferencingDatasetID, "utf8");
					data = JSON.parse(content);
				} catch (err) {
					return reject(new InsightError("file reading error"));
				}
				let matchedResult: any[];
				let resultFilteredColumns: any[];
				matchedResult = matchHelper.matchFILTER(data, theFILTERInWHERE);
				if (matchedResult.length > 5000) {
					return reject(new InsightError("Only queries with a maximum of 5000 results are supported."));
				} else {
					resultFilteredColumns = checkHelper.filterTheCOLUMNS(matchedResult, columns, order);
					return resolve(resultFilteredColumns);
				}
			} else {
				return reject(new InsightError("This query is not valid"));
			}
		});
	}

	public addDatasetHelper(id: string, sectionsListToStore: any[], numOfRows: number) {
		let currentDataset: InsightDataset = {id, kind: InsightDatasetKind.Courses, numRows: numOfRows};
		fs.writeFileSync("./data/" + id, JSON.stringify(sectionsListToStore), "utf8");
		this.insightDatasets.push(currentDataset);
		this.datasetIDList.push(id);
		console.log("dataset: " + id + " added successfully");
	}
}
