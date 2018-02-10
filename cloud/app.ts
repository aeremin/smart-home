import * as bodyparser from "body-parser";
import * as express from "express";
import * as rp from "request-promise";
import { AuthConfig } from "../common/auth_config";
import { basicAuth, statusPage } from "../common/middleware";
import { CloudConfig } from "./cloud_config";

function createApp(authConfig: AuthConfig, cloudConfig: CloudConfig): express.Express {
  const app: express.Express = express();
  app.use(bodyparser.json());
  app.get("/status/", statusPage());
  app.use(basicAuth(authConfig));

  const impl = new Implementation(authConfig, cloudConfig);
  app.post("/", (req, res) => {
    console.log(JSON.stringify(req.body));
    const intentName: string = req.body.result.metadata.intentName;
    const params: any = req.body.result.parameters;
    if (intentName == "connect_to_projector")
      impl.connectoToProjector(params.hdmi_source);
    if (intentName == "disable_power")
      impl.disablePower(params.device);
    if (intentName == "enable_power")
      impl.enablePower(params.device);

    if (intentName == "pause_playback")
      impl.vlcHttp("/pause");
    if (intentName == "resume_playback")
      impl.vlcHttp("/resume");
    if (intentName == "set_volume_level")
      impl.vlcHttp(`/set_volume_level/${params.level}`);
    if (intentName == "set_stream_language")
      impl.vlcHttp(`/set_stream_language/${params.vlc_stream}/${params.language}`);

    res.status(200).send("Ok!");
  });

  return app;
}

class Implementation {
  constructor(private _authConfig: AuthConfig, private _cloudConfig: CloudConfig) { }

  public connectoToProjector(hdmiSource: string) {
    const hdmiSourceToKey: { [key: string]: string } = {
      computer: "KEY_PROG1",
      playstation: "KEY_PROG2",
      chromecast: "KEY_PROG3",
      nintendo: "KEY_PROG4",
    };
    this.enablePower("projector");
    return this.irSendHttp("hdmi_switch", hdmiSourceToKey[hdmiSource]);
  }

  public enablePower(device: string) {
    if (device == "sound system")
      return this.irSendHttp("sound_system", "POWER");

    if (device == "projector")
      return this.irSendHttp("projector", "KEY_POWER");
  }

  public disablePower(device: string) {
    if (device == "sound system")
      return this.irSendHttp("sound_system", "POWER");

    if (device == "projector") {
      const disable = () => this.irSendHttp("projector", "KEY_SUSPEND");
      disable();
      setTimeout(disable, 1000);
    }
  }

  public async vlcHttp(path: string) {
    const status = await rp.post(this._cloudConfig.vlcUrl + path,
      { auth: { username: this._authConfig.username, password: this._authConfig.password } });
    return status;
  }

  private async irSendHttp(receiver: string, key: string) {
    const status = await rp.post(`${this._cloudConfig.irUrl}/ir_send/${receiver}/${key}`,
      { auth: { username: this._authConfig.username, password: this._authConfig.password } });
    return JSON.parse(status);
  }
}

export default createApp;
