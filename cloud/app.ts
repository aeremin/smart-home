import * as bodyparser from "body-parser";
import * as express from "express";
import * as http from "http";
import * as rp from "request-promise";
import { AuthConfig } from "../common/auth_config";
import { basicAuth, statusPage } from "../common/middleware";
import { CloudConfig } from "./cloud_config";

class App {
  private app: express.Express = express();
  private server: http.Server;

  constructor(private _authConfig: AuthConfig, private _cloudConfig: CloudConfig) {
    this.app.use(bodyparser.json());
    this.app.get("/status/", statusPage());
    this.app.use(basicAuth(_authConfig));

    this.app.post("/", (req, res) => {
      console.log(JSON.stringify(req.body));
      const intentName: string = req.body.result.metadata.intentName;
      const params: any = req.body.result.parameters;
      if (intentName == "connect_to_projector")
        this.connectoToProjector(params.hdmi_source);
      if (intentName == "disable_power")
        this.disablePower(params.device);
      if (intentName == "enable_power")
        this.enablePower(params.device);

      if (intentName == "pause_playback")
        this.vlcHttp("/pause");
      if (intentName == "resume_playback")
        this.vlcHttp("/resume");
      if (intentName == "set_volume_level")
        this.vlcHttp(`/set_volume_level/${params.level}`);
      if (intentName == "set_stream_language")
        this.vlcHttp(`/set_stream_language/${params.vlc_stream}/${params.language}`);

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
      nintendo: "KEY_PROG4",
    };
    this.enablePower("projector");
    return this.irSendHttp("hdmi_switch", hdmiSourceToKey[hdmiSource]);
  }

  private enablePower(device: string) {
    if (device == "sound system")
      return this.irSendHttp("sound_system", "POWER");

    if (device == "projector")
      return this.irSendHttp("projector", "KEY_POWER");
  }

  private disablePower(device: string) {
    if (device == "sound system")
      return this.irSendHttp("sound_system", "POWER");

    if (device == "projector") {
      const disable = () => this.irSendHttp("projector", "KEY_SUSPEND");
      disable();
      setTimeout(disable, 1000);
    }
  }

  private async irSendHttp(receiver: string, key: string) {
    const status = await rp.get(`${this._cloudConfig.irUrl}/ir_send/${receiver}/${key}`,
      { auth: { username: this._authConfig.username, password: this._authConfig.password } });
    return JSON.parse(status);
  }

  private async vlcHttp(path: string) {
    const status = await rp.get(this._cloudConfig.vlcUrl + path,
      { auth: { username: this._authConfig.username, password: this._authConfig.password } });
    return JSON.parse(status);
  }
}

export default App;
