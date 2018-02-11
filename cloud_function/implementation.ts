import * as rp from "request-promise";
import { AuthConfig } from "./auth_config";
import { CloudConfig } from "./cloud_config";

export class Implementation {
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
