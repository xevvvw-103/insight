import {InsightError} from "./IInsightFacade";
import parse5 from "parse5";

export function getTbody (ast: any): any {
	if (ast.nodeName === "tbody") {
		return ast;
	}
	if (ast.childNodes === undefined) {
		return null;
	}
	for (let child of ast.childNodes) {
		if (getTbody(child) !== null) {
			return getTbody(child);
		}
	}
	return null;
}

export function getContainedBuildings(ast: any, list: string[]) {
	for (let node of ast.childNodes) {
		if (node.nodeName === "tr") {
			let buildingCode = node.childNodes[3].childNodes[0].value.trim().replace("\n", "");
			if (buildingCode.length !== 0) {
				list.push(buildingCode);
			}
		}
	}
}

export function getInfo (ast: any): any {
	if (ast.nodeName === "div" && ast.attrs[0].value === "building-info") {
		return ast;
	}
	if (ast.childNodes === undefined) {
		return null;
	}
	for (let child of ast.childNodes) {
		if (getInfo(child) !== null) {
			return getInfo(child);
		}
	}
	return null;
}

export function getGeoLocation(address: any) {
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

export function storeRoomInfo
(buildingTbodyTree: any, building: any, buildingCode: string, latlon: any, roomList: any[]) {
	let room: any = {};
	for (let child of buildingTbodyTree.childNodes) {
		if (child.nodeName === "tr") {
			room["fullname"] = building["fullname"];
			room["shortname"] = buildingCode;
			room["number"] = child.childNodes[1].childNodes[1].childNodes[0].value;
			room["name"] = room["shortname"] + "_" + room["number"];
			room["address"] = building["address"];
			room["lat"] = latlon.lat;
			room["lon"] = latlon.lon;
			room["seat"] = child.childNodes[3].childNodes[0].value.trim().replace("\n", "");
			room["type"] = child.childNodes[7].childNodes[0].value.trim().replace("\n", "");
			room["furniture"] = child.childNodes[5].childNodes[0].value.trim().replace("\n", "");
			room["href"] = child.childNodes[9].childNodes[1].attrs[0].value;
			roomList.push(room);
			// console.log(room);
		}
	}
}

export async function indexHandler(zip: any, reject: (reason?: any) => void, containedBuildingList: string[]) {
	if (!zip.folder("rooms") || !zip.folder("rooms").file("index.htm")) {
		reject(new InsightError("Invalid Room Zip"));
	}
	const index = await zip.file("rooms/index.htm").async("string");
	const indexTree = parse5.parse(index);
	let indexTbody = getTbody(indexTree);
	getContainedBuildings(indexTbody, containedBuildingList);
}

export function infoHandler
(containedBuildingList: string[], zip: any, reject: (reason?: any) => void, roomsPromise: Array<Promise<any>>) {
	containedBuildingList.forEach((buildingCode) => {
		let path = "rooms/campus/discover/buildings-and-classrooms/" + buildingCode;
		let building: any = {};
		let roomList: any[] = [];
		let promise = zip.file(path).async("string").then(async (buildingFile: any) => {
			let buildingTree = parse5.parse(buildingFile);
			let buildingInfo = getInfo(buildingTree);
			let buildingTbodyTree = getTbody(buildingTree);
			if (buildingInfo !== null) {
				building["fullname"] = buildingInfo.childNodes[1].childNodes[0].childNodes[0].value;
				building["address"] = buildingInfo.childNodes[3].childNodes[0].childNodes[0].value;
				let latlon = await getGeoLocation(building["address"]);
				if (buildingTbodyTree !== null) {
					storeRoomInfo(buildingTbodyTree, building, buildingCode, latlon, roomList);
				}
			}
			return roomList;
		}).catch(() => {
			reject(new InsightError("building file error"));
		});
		roomsPromise.push(promise);
	});
}

