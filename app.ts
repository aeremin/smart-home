import * as basic_auth from "basic-auth";
import * as bodyparser from "body-parser";
import * as child from "child_process";
import * as express from "express";
import * as http from "http";
import { Config } from "./config";

class App {
  private app: express.Express = express();
  private server: http.Server;

  constructor(private config: Config) {
    this.app.use(bodyparser.json());

    const auth = async (req: express.Request, res: express.Response, next: any) => {
      const credentials = basic_auth(req);
      if (credentials && credentials.name == config.username && credentials.pass == config.password)
        return next();
      res.header("WWW-Authentificate", "Basic");
      res.status(401).send("Access denied");
    };

    this.app.use(auth);

    this.app.post("/", (req, res) => {
      console.log(JSON.stringify(req.body));
      const intentName: string = req.body.result.metadata.intentName;
      const params: any = req.body.result.parameters;
      if (intentName == "connect_to_projector")
        this.connectoToProjector(params.hdmi_source);
      res.status(200).send("Ok!");
    });
  }

  public listen(port: number): void {
    this.server = this.app.listen(port);
  }

  public stop(): void {
    this.server.close();
  }

  private connectoToProjector(hdmiSource: string) {
    const hdmiSourceToKey: { [key: string]: string } = {
      computer: "KEY_PROG1",
      playstation: "KEY_PROG2",
      chromecast: "KEY_PROG3",
    };
    this.irSend("projector", "KEY_POWER");
    return this.irSend("hdmi_switch", hdmiSourceToKey[hdmiSource]);
  }

  private async disablePower(device: string) {
    if (device == "sound system")
      return this.irSend("sound_system", "POWER");

    if (device == "projector") {
      const disable = () => this.irSend("projector", "KEY_POWER");
      disable();
      setTimeout(disable, 1000);
    }
  }

  private irSend(receiver: string, key: string) {
    const cmd = `irsend SEND_ONCE ${receiver} ${key}`;
    console.log(`Performing command '${cmd}'`);
    child.exec(cmd, (error, stdout, stderr) => console.debug("Result of command run:", error, stdout, stderr));
  }
}

export default App;
