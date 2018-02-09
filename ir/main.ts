import App from "./app";

// tslint:disable-next-line:no-var-requires
const config = require("../config.json");
new App(config.authConfig).listen(5001);
