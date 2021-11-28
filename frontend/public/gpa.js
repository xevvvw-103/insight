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
		.then((array) => {
			generateTables(array);
		})
}
function generateTables(data) {
	let text = "<table class='GeneratedTable'><thead><tr><th>Course Title</th><th>Overall Avg</th></tr></thead><tbody>";
	data.forEach((ele) => {
		text += "<tr><td>" + ele["courses_title"] + "</td><td>" + ele["overallAvg"] + "</td>></tr>";
	});
	text += "</tbody></table>";
	document.getElementById("table-scroll").innerHTML = text;

}
