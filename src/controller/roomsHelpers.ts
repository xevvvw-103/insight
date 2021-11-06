import {InsightDatasetKind, InsightError} from "./IInsightFacade";
import parse5 from "parse5";
import JSZip from "jszip";
import * as fs from "fs";

export function addDataRoom(object: any, id: string, content: string): Promise<string[]> {
	let that = object;
	return new Promise<string[]>((resolve, reject) => {
		let loadDatasetPromises: any[] = [];
		let buildings: any[] = [];
		let linkedBuildings: string[] = [];
		JSZip.loadAsync(content, {base64: true}).then((zip: any) => {
			zip.files["index.htm"].async("text").then((data: any) => {
				let indexTree = parse5.parse(data);
				let tbodyIndex = getTbody(indexTree);
				indexHelper(tbodyIndex, linkedBuildings);
			}).catch(() => {
				throw new InsightError("index.htm error");
			});
			zip.folder("campus").folder("discover").folder("buildings-and-classrooms")
				.forEach((relativePath: string, file: any) => {
					let validBuilding = getBuilding(file, relativePath, linkedBuildings, buildings, reject);
					loadDatasetPromises.push(validBuilding);
				});
			fileSaver(that, loadDatasetPromises, buildings, id);
		}).catch(() => {
			reject(new InsightError("loadAsync not working"));
		});
	});
}

function indexHelper(index: any, list: any[]) {
	index.childNodes.forEach((node: any) => {
		if (node.nodeName === "tr") {
			let block1 = node.childNodes[3];
			let rowName = block1.childNodes[0].value;
			let shortName = rowName.trim().replace("\n", "");
			list.push(shortName);
		}
	});
}

function getTbody (ast: any) {
	if (ast.nodeName === "tbody") {
		return ast;
	}

	if (ast.childNodes === undefined || ast.childNodes.length === 0) {
		return null;
	}

	for (let node of ast.childNodes) {
		let res: any = getTbody(node);
		if (res !== null) {
			return res;
		}
	}
}

function getBuildingInfo (ast: any) {
	try {
		return ast.childNodes[6].childNodes[3].childNodes[31]
			.childNodes[10].childNodes[1].childNodes[3].childNodes[1]
			.childNodes[3].childNodes[1].childNodes[1].childNodes[1];
	} catch {
		return null;
	}
}

function getGeoLocation(address: any) {
	let http = require("http");
	let AddressURL = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team140/"
		+ encodeURIComponent(address);

	return new Promise<any>((resolve, reject) => {
		http.get(AddressURL, (res: any) => {
			const { statusCode } = res;
			const contentType = res.headers["content-type"];

			let error;
			if (statusCode !== 200) {
				error = new Error("Request Failed.\n" +
					`Status Code: ${statusCode}`);
			} else if (!/^application\/json/.test(contentType)) {
				error = new Error("Invalid content-type.\n" +
					"Expected application/json but received ${contentType}");
			}
			if (error) {
				console.error(error.message);
				// consume response data to free up memory
				res.resume();
				return;
			}

			res.setEncoding("utf8");
			let rawData = "";
			res.on("data", (chunk: any) => {
				rawData += chunk;
			});
			res.on("end", () => {
				try {
					const parsedData = JSON.parse(rawData);
					resolve(parsedData);
				} catch (e: any) {
					console.error(e.message);
					reject(e);
				}
			});
		}).on("error", (e: any) => {
			console.error(`Got error: ${e.message}`);
		});
	});
}

async function buildingInfoFiller(object: any, info: any, file: any) {
	object["fullname"] = info.childNodes[1].childNodes[0].childNodes[0].value;
	object["shortname"] = file;
	object["address"] = info.childNodes[3].childNodes[0].childNodes[0].value;
	let latlon = await getGeoLocation(object["address"]);
	object["lat"] = latlon.lat;
	object["lon"] = latlon.lon;
}

function roomInfoFiller(node: any, object: any, array: any[], info: any, building: any) {
	let roomObj: any = {};
	if (node.nodeName === "tr") {
		roomObj["number"] = node.childNodes[1].childNodes[1].childNodes[0].value.toString();
		roomObj["fullname"] =
			info.childNodes[1].childNodes[0].childNodes[0].value;
		roomObj["shortname"] = building;
		roomObj["address"] =
			info.childNodes[3].childNodes[0].childNodes[0].value;
		roomObj["lat"] = object["lat"];
		roomObj["lon"] = object["lon"];
		roomObj["name"] = roomObj["shortname"] + "_" + roomObj["number"];
		roomObj["seats"] =
			node.childNodes[3].childNodes[0].value.trim().replace("\n", "");
		roomObj["type"] =
			node.childNodes[7].childNodes[0].value.trim().replace("\n", "");
		roomObj["furniture"] =
			node.childNodes[5].childNodes[0].value.trim().replace("\n", "");
		roomObj["href"] = node.childNodes[9].childNodes[1].childNodes[0]
			.parentNode.attrs[0].value;
		array.push(roomObj);
	}
}

function fileSaver(object: any, promise: any[], buildings: any[], id: string) {
	Promise.all(promise).then(() => {
		let allEmpty = true;
		buildings.forEach(function (building: any) {
			if (building["room"] !== []) {
				allEmpty = false;
			}
		});
		if (!allEmpty) {
			let num = 0;
			buildings.forEach((cont: any) => {
				if (cont["rooms"] !== undefined) {
					const curr = cont["rooms"].length;
					num = num + curr;
				}
			});
			object.datasetIDList.push(id);
			object.insightDatasets.push({id, kind: InsightDatasetKind.Rooms, numRows: num});
			fs.writeFileSync("./data/" + id + "$" + "rooms", JSON.stringify(buildings), "utf8");
			return Promise.resolve(object.insightDatasets);
		} else {
			return Promise.reject(new InsightError("no room"));
		}
	}).catch((error: any) => {
		return Promise.reject(new InsightError(error));
	});
}

function getBuilding
(file: any, relativePath: string, linkedBuildings: string[], buildings: any[], reject: (reason?: any) => void) {
	return file(relativePath).async("text")
		.then(async function success(fileData: string) {
			let buildingTree = parse5.parse(fileData);
			let tbodyBuilding = getTbody(buildingTree);
			let fileName = file.name.replace("campus/discover/buildings-and-classrooms/", "");
			if (linkedBuildings.includes(fileName)) {
				let buildingObj: any = [];
				let roomArray: any[] = [];
				let buildingInfo = getBuildingInfo(buildingTree);
				if (!buildingInfo) {
					buildingInfoFiller(buildingObj, buildingInfo, fileName);
				} else {
					throw new InsightError("building is empty");
				}
				if (!tbodyBuilding) {
					tbodyBuilding.childNodes.forEach((node: any) => {
						roomInfoFiller(node, buildingObj, roomArray, buildingInfo, fileName);
					});
					buildingObj["rooms"] = roomArray;
					buildings.push(buildingObj);
				} else {
					throw new InsightError("no room");
				}
			}
		}).catch(() => {
			reject(new InsightError());
		});
}

