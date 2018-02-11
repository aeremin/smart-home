import * as express from "express";
import { Implementation } from "./implementation";

const impl = new Implementation(
  { username: "", password: "" },
  {
    irUrl: "",
    vlcUrl: "",
  });

export async function http(req: express.Request, res: express.Response) {
  console.log(JSON.stringify(req.body));
  const intentName: string = req.body.result.metadata.intentName;
  const params: any = req.body.result.parameters;
  if (intentName == "connect_to_projector")
    await impl.connectoToProjector(params.hdmi_source);
  if (intentName == "disable_power")
    await impl.disablePower(params.device);
  if (intentName == "enable_power")
    await impl.enablePower(params.device);

  if (intentName == "pause_playback")
    await impl.vlcHttp("/pause");
  if (intentName == "resume_playback")
    await impl.vlcHttp("/resume");
  if (intentName == "set_volume_level")
    await impl.vlcHttp(`/set_volume_level/${params.level}`);
  if (intentName == "set_stream_language")
    await impl.vlcHttp(`/set_stream_language/${params.vlc_stream}/${params.language}`);

  res.status(200).send("Ok!");
}
