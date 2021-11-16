export let theStoredIDList: string[] = [];

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
