document.getElementById("gpa-button").addEventListener("click", listCourses);

async function listCourses() {
	let query = {
		"WHERE": {
			"GT": {
				"courses_avg": 90
			}
		},
		"OPTIONS": {
			"COLUMNS": [
				"courses_title", "overallAvg"
			],
			"ORDER": {
				"dir": "DOWN",
				"keys": ["overallAvg"]
			}
		},
		"TRANSFORMATIONS": {
			"GROUP": ["courses_title"],
			"APPLY": [{
				"overallAvg": {
					"AVG": "courses_avg"
				}
			}]
		}
	}

	 await fetch('/query', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(query)
	})
		.then((response) => response.json())
		.then((data) => {
			return data["result"];
		})
		.then((res) => {
			let columns = query["OPTIONS"]["COLUMNS"];
			generateTables(res, columns);
		})
}
function generateTables(res, columns) {
	let text = "<table class='GeneratedTable'><thead><tr>";
	columns.forEach((title) => {
		text += "<th>" + title + "</th>";
	})
	text += "</tr></thead><tbody>";
	res.forEach((ele) => {
		text += "<tr>";
		columns.forEach((title) => {
			text += "<td>" + ele[title] + "</td>";
		})
		text += "</tr>";
	});
	text += "</tbody></table>";
	document.getElementById("result").innerHTML = text;
}
