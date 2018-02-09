import * as bodyparser from "body-parser";
import * as child from "child_process";
import * as express from "express";
import * as http from "http";
import { AuthConfig } from "../common/auth_config";
import { basicAuth, statusPage } from "../common/middleware";

class App {
  private app: express.Express = express();
  private server: http.Server;

  constructor(authConfig: AuthConfig) {
    this.app.use(bodyparser.json());
    this.app.get("/status/", statusPage());
    this.app.use(basicAuth(authConfig));

    this.app.post("/ir_send/:receiver/:key", async (req: express.Request, res: express.Response) => {
      await this.irSend(req.params.receiver, req.params.key);
      res.status(200).send("Ok!");
    });

    setInterval(() => this.soundSystemKeepAlive(), 60 * 60 * 1000); // 1 hour
  }

  public listen(port: number): void {
    this.server = this.app.listen(port);
  }

  public stop(): void {
    this.server.close();
  }

  private soundSystemKeepAlive() {
    this.irSend("sound_system", "VOL_PLUS");
    this.irSend("sound_system", "VOL_MINUS");
  }

  private irSend(receiver: string, key: string) {
    const cmd = `irsend SEND_ONCE ${receiver} ${key}`;
    console.log(`Performing command '${cmd}'`);
    child.exec(cmd, (error, stdout, stderr) => console.debug("Result of command run:", error, stdout, stderr));
  }
}

export default App;
