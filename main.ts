import App from "./app";
import { Config } from "./config";

// tslint:disable-next-line:no-var-requires
const configUnparsed: Config = require("config.json");

new App(configUnparsed).listen(5000);
