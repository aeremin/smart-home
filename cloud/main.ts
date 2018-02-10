import createApp from "./app";

// tslint:disable-next-line:no-var-requires
const config = require("../config.json");
createApp(config.authConfig, config.cloudConfig).listen(5000);
