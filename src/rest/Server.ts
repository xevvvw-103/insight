import express, {Application, Request, Response} from "express";
import * as http from "http";
import cors from "cors";
import InsightFacade from "../controller/InsightFacade";
import {InsightDatasetKind, InsightError, NotFoundError} from "../controller/IInsightFacade";
import fs from "fs";

export default class Server {
	private readonly port: number;
	private express: Application;
	private server: http.Server | undefined;

	constructor(port: number) {
		console.info(`Server::<init>( ${port} )`);
		this.port = port;
		this.express = express();

		this.registerMiddleware();
		this.registerRoutes();

		// NOTE: you can serve static frontend files in from your express server
		// by uncommenting the line below. This makes files in ./frontend/public
		// accessible at http://localhost:<port>/
		this.express.use(express.static("./frontend/public"));
	}

	/**
	 * Starts the server. Returns a promise that resolves if success. Promises are used
	 * here because starting the server takes some time and we want to know when it
	 * is done (and if it worked).
	 *
	 * @returns {Promise<void>}
	 */
	public start(): Promise<void> {
		return new Promise((resolve, reject) => {
			console.info("Server::start() - start");
			if (this.server !== undefined) {
				console.error("Server::start() - server already listening");
				reject();
			} else {
				this.server = this.express.listen(this.port, () => {
					console.info(`Server::start() - server listening on port: ${this.port}`);
					resolve();
				}).on("error", (err: Error) => {
					// catches errors in server start
					console.error(`Server::start() - server ERROR: ${err.message}`);
					reject(err);
				});
			}
		});
	}

	/**
	 * Stops the server. Again returns a promise so we know when the connections have
	 * actually been fully closed and the port has been released.
	 *
	 * @returns {Promise<void>}
	 */
	public stop(): Promise<void> {
		console.info("Server::stop()");
		return new Promise((resolve, reject) => {
			if (this.server === undefined) {
				console.error("Server::stop() - ERROR: server not started");
				reject();
			} else {
				this.server.close(() => {
					console.info("Server::stop() - server closed");
					resolve();
				});
			}
		});
	}

	// Registers middleware to parse request before passing them to request handlers
	private registerMiddleware() {
		// JSON parser must be place before raw parser because of wildcard matching done by raw parser below
		this.express.use(express.json());
		this.express.use(express.raw({type: "application/*", limit: "10mb"}));

		// enable cors in request headers to allow cross-origin HTTP requests
		this.express.use(cors());
	}

	// Registers all request handlers to routes
	private registerRoutes() {
		// This is an example endpoint this you can invoke by accessing this URL in your browser:
		// http://localhost:4321/echo/hello
		this.express.get("/echo/:msg", Server.echo);

		// TODO: your other endpoints should go here
		this.express.put("/dataset/:id/:kind", Server.addData);
		this.express.delete("/dataset/:id", Server.removeData);
		this.express.post("/query", Server.performQuery);
		this.express.get("/datasets", Server.listData);
	}

	private static addData(req: Request, res: Response) {
		console.log(`Server::put(..) - params: ${JSON.stringify(req.params)}`);
		const rooms = fs.readFileSync("./test/resources/archives/rooms.zip");
		const courses = fs.readFileSync("./test/resources/archives/courses.zip");
		const insightFacade = new InsightFacade();
		let content;
		let kind = (req.params.kind === "courses") ? InsightDatasetKind.Courses :
			(req.params.kind === "rooms") ? InsightDatasetKind.Rooms : null;
		if (kind === InsightDatasetKind.Rooms) {
			content = rooms.toString("base64");
		} else if (kind === InsightDatasetKind.Courses) {
			content = courses.toString("base64");
		}
		if (content && kind) {
			insightFacade.addDataset(req.params.id, content, kind).then((response) => {
				res.status(200).json({result: response + " added"});
			}).catch((err) => {
				res.status(400).json({error: err.message});
			});
		} else {
			let err = new InsightError("not valid request");
			res.status(400).json({error: err.message});
		}
	}

	private static listData(req: Request, res: Response) {
		console.log(`Server::list(..) - params: ${JSON.stringify(req.params)}`);
		const insightFacade = new InsightFacade();
		insightFacade.listDatasets().then((response) => {
			res.status(200).json({result: response});
		}).catch((err) => {
			res.status(400).json({error: err.message});
		});
	}

	private static removeData(req: Request, res: Response) {
		console.trace("Server::delete(..) - params: " + JSON.stringify(req.params));
		const insightFacade = new InsightFacade();
		if (insightFacade.datasetIDList.includes(req.params.id)) {
			insightFacade.removeDataset(req.params.id).then((response) => {
				res.status(200).json({result: response + " deleted"});
			}).catch((err) => {
				res.status(400).json({error: err.message});
			});
		} else {
			let error = new NotFoundError("NotFoundError");
			res.status(404).json({error: error.message});
		}
	}

	private static performQuery(req: Request, res: Response) {
		console.log("Server::post(..) - params: " + JSON.stringify(req.params));
		const insightFacade = new InsightFacade();
		let query = req.body;
		insightFacade.performQuery(query).then((response) => {
			res.status(200).json({result: response});
		}).catch(function (err) {
			res.status(400).json({result: err.message});
		});
	}

	// The next two methods handle the echo service.
	// These are almost certainly not the best place to put these, but are here for your reference.
	// By updating the Server.echo function pointer above, these methods can be easily moved.
	private static echo(req: Request, res: Response) {
		try {
			console.log(`Server::echo(..) - params: ${JSON.stringify(req.params)}`);
			const response = Server.performEcho(req.params.msg);
			res.status(200).json({result: response});
		} catch (err) {
			res.status(400).json({error: err});
		}
	}

	private static performEcho(msg: string): string {
		if (typeof msg !== "undefined" && msg !== null) {
			return `${msg}...${msg}`;
		} else {
			return "Message not provided";
		}
	}
}
