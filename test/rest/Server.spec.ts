import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";
import {expect, use} from "chai";
import chaiHttp from "chai-http";
import * as fs from "fs";
import * as chai from "chai";

describe("Facade D3", function () {

	let facade: InsightFacade;
	let server: Server;

	use(chaiHttp);

	before(function () {
		facade = new InsightFacade();
		server = new Server(4321);
		// TODO: start server here once and handle errors properly
		server.start();
	});

	after(function () {
		// TODO: stop server here once!
		server.stop();
	});

	beforeEach(function () {
		// might want to add some process logging here to keep track of what"s going on
	});

	afterEach(function () {
		// might want to add some process logging here to keep track of what"s going on
	});

	// Sample on how to format PUT requests
	it("PUT test for courses dataset", function () {
		try {
			return chai.request("http://localhost:4321")
				.put("/dataset/test1/courses")
				.send(fs.readFileSync("./test/resources/archives/courses.zip"))
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res) {
					// some logging here please!
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// some logging here please!
					console.log(err);
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
			console.log("ERROR: " + err);
		}
	});

	// The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
	it("POST test for ROOMS dataset", function () {
		try {
			const queryStr = fs.readFileSync("./test/resources/queries/complex.json").toString("base64");
			const queryJson = JSON.parse(queryStr);
			return chai.request("http://localhost:4321")
				.post("/query")
				.send(queryJson.query)
				.then((res) => {
					// some logging here please!
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err: any) {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});
});
