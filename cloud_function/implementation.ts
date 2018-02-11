import axios, { AxiosResponse } from "axios";
import { AuthConfig } from "./auth_config";
import { CloudConfig } from "./cloud_config";

export class Implementation {
  constructor(private _authConfig: AuthConfig, private _cloudConfig: CloudConfig) { }

  public async connectoToProjector(hdmiSource: string): Promise<AxiosResponse> {
    const hdmiSourceToKey: { [key: string]: string } = {
      computer: "KEY_PROG1",
      playstation: "KEY_PROG2",
      chromecast: "KEY_PROG3",
      nintendo: "KEY_PROG4",
    };
    const response = await this.enablePower("projector");
    if (response.status != 200)
      return response;
    return this.irSendHttp("hdmi_switch", hdmiSourceToKey[hdmiSource]);
  }

  public async enablePower(device: string): Promise<AxiosResponse> {
    if (device == "sound system")
      return this.irSendHttp("sound_system", "POWER");

    if (device == "projector")
      return this.irSendHttp("projector", "KEY_POWER");

    throw new RangeError("Unknown device");
  }

  public async disablePower(device: string): Promise<AxiosResponse> {
    if (device == "sound system")
      return this.irSendHttp("sound_system", "POWER");

    if (device == "projector") {
      const disable = () => this.irSendHttp("projector", "KEY_SUSPEND");
      const response = await disable();
      if (response.status != 200)
        return response;
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return await disable();
    }

    throw new RangeError("Unknown device");
  }

  public async vlcHttp(path: string): Promise<AxiosResponse> {
    const status: AxiosResponse = await axios.post(this._cloudConfig.vlcUrl + path, {},
      { auth: { username: this._authConfig.username, password: this._authConfig.password } });
    return status;
  }

  private async irSendHttp(receiver: string, key: string): Promise<AxiosResponse> {
    const status: AxiosResponse = await axios.post(`${this._cloudConfig.irUrl}/ir_send/${receiver}/${key}`, {},
      { auth: { username: this._authConfig.username, password: this._authConfig.password } });
    return status;
  }
}
