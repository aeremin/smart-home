import * as basic_auth from "basic-auth";
import * as express from "express";
import { Config } from "./config";

function statusPage() {
  return (_: express.Request, res: express.Response) => res.status(200).send("I am alive!");
}

function basicAuth(config: Config) {
  return async (req: express.Request, res: express.Response, next: any) => {
    const credentials = basic_auth(req);
    if (credentials && credentials.name == config.username && credentials.pass == config.password)
      return next();
    res.header("WWW-Authentificate", "Basic");
    res.status(401).send("Access denied");
  };
}

export {statusPage, basicAuth};
