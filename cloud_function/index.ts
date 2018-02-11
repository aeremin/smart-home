import { AxiosResponse } from "axios";
import * as basic_auth from "basic-auth";
import * as express from "express";
import { Implementation } from "./implementation";

const authConfig = { username: "", password: "" };

const impl = new Implementation(
  authConfig,
  {
    irUrl: "",
    vlcUrl: "",
  });

export async function http(req: express.Request, res: express.Response) {
  const credentials = basic_auth(req);
  if (!(credentials && credentials.name == authConfig.username && credentials.pass == authConfig.password)) {
    res.header("WWW-Authentificate", "Basic");
    res.status(401).send("Access denied");
    return;
  }

  console.log(JSON.stringify(req.body));
  const intentName: string = req.body.result.metadata.intentName;
  const params: any = req.body.result.parameters;

  let response: AxiosResponse<any>;

  if (intentName == "connect_to_projector")
    response = await impl.connectoToProjector(params.hdmi_source);
  else if (intentName == "disable_power")
    response = await impl.disablePower(params.device);
  else if (intentName == "enable_power")
    response = await impl.enablePower(params.device);

  else if (intentName == "pause_playback")
    response = await impl.vlcHttp("/pause");
  else if (intentName == "resume_playback")
    response = await impl.vlcHttp("/resume");
  else if (intentName == "set_volume_level")
    response = await impl.vlcHttp(`/set_volume_level/${params.level}`);
  else if (intentName == "set_stream_language")
    response = await impl.vlcHttp(`/set_stream_language/${params.vlc_stream}/${params.language}`);
  else
    throw RangeError("Unknow intentName");

  res.status(response.status).send(response.data);
}
