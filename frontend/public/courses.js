document.getElementById("click-me-button").addEventListener("click", performQuery);

async function performQuery() {
	try {
		JSON.parse(document.getElementById("inputQ").value);
	} catch(e) {
		alert(e);
	}
	let query = JSON.parse(document.getElementById("inputQ").value);
	let res = await fetch('/query', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(query)
	})
		.then((response) => {
			if (!response.ok) {
				alert("Invalid query!");
				throw new Error();
			}
			return response.json();
		})
		.then((data) => {
			return data["result"];
		});
	let columns = query["OPTIONS"]["COLUMNS"];
	generateTables(res, columns);
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
