import {InsightError} from "./IInsightFacade";
import * as parse5 from "parse5";

function getTbody (ast: any): any {
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

function getContainedBuildings(ast: any, list: string[]) {
	for (let node of ast.childNodes) {
		if (node.nodeName === "tr") {
			let buildingCode = node.childNodes[3].childNodes[0].value.trim().replace("\n", "");
			if (buildingCode.length !== 0) {
				list.push(buildingCode);
			}
		}
	}
}

function getInfo (ast: any): any {
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

function storeRoomInfo
(id: string, tree: any, fullname: string, address: string,  buildingCode: string, latlon: any, roomList: any[]) {
	for (let child of tree.childNodes) {
		let room: any = {};
		if (child.nodeName === "tr") {
			room[id + "_fullname"] = String(fullname);
			room[id + "_shortname"] = String(buildingCode);
			room[id + "_number"] = String(child.childNodes[1].childNodes[1].childNodes[0].value);
			room[id + "_name"] = String(room[id + "_shortname"] + "_" + room[id + "_number"]);
			room[id + "_address"] = String(address);
			room[id + "_lat"] = Number(latlon.lat);
			room[id + "_lon"] = Number(latlon.lon);
			room[id + "_seats"] = Number(child.childNodes[3].childNodes[0].value.trim().replace("\n", ""));
			room[id + "_type"] = String(child.childNodes[7].childNodes[0].value.trim().replace("\n", ""));
			room[id + "_furniture"] = String(child.childNodes[5].childNodes[0].value.trim().replace("\n", ""));
			room[id + "_href"] = String(child.childNodes[9].childNodes[1].attrs[0].value);
			roomList.push(room);
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
(id: string, list: string[], zip: any, reject: (reason?: any) => void, roomsPromise: Array<Promise<any>>) {
	list.forEach((buildingCode) => {
		let path = "rooms/campus/discover/buildings-and-classrooms/" + buildingCode;
		let roomList: any[] = [];
		if (zip.file(path)) {
			let promise = zip.file(path).async("string").then(async (buildingFile: any) => {
				let buildingTree = parse5.parse(buildingFile);
				let buildingInfo = getInfo(buildingTree);
				let buildingTbodyTree = getTbody(buildingTree);
				if (buildingInfo !== null) {
					let fullName = buildingInfo.childNodes[1].childNodes[0].childNodes[0].value;
					let address = buildingInfo.childNodes[3].childNodes[0].childNodes[0].value;
					let latlon = await getGeoLocation(address);
					if (buildingTbodyTree !== null) {
						storeRoomInfo(id, buildingTbodyTree, fullName, address, buildingCode, latlon, roomList);
					}
				}
				return roomList;
			}).catch(() => {
				reject(new InsightError("building file error"));
			});
			roomsPromise.push(promise);
		}
	});
}
