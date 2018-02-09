import * as bodyparser from "body-parser";
import * as express from "express";
import * as http from "http";
import * as rp from "request-promise";
import { AuthConfig } from "../common/auth_config";
import { basicAuth, statusPage } from "../common/middleware";
import { VlcConfig } from "./vlc_config";

class Vlc {
  private app: express.Express = express();
  private server: http.Server;

  constructor(authConfig: AuthConfig, private _vlcConfig: VlcConfig) {
    this.app.use(bodyparser.json());
    this.app.get("/status/", statusPage());
    this.app.use(basicAuth(authConfig));

    this.app.post("/pause", async (_, res: express.Response) => {
      console.log(await this.pause());
      res.status(200).send("Ok!");
    });

    this.app.post("/resume", async (_, res: express.Response) => {
      console.log(await this.resume());
      res.status(200).send("Ok!");
    });

    this.app.post("/set_volume_level/:percent", async (req: express.Request, res: express.Response) => {
      console.log(await this.setSoundLevel(req.params.percent));
      res.status(200).send("Ok!");
    });

    this.app.post("/set_stream_language/:stream/:language", async (req: express.Request, res: express.Response) => {
      console.log(await this.setStreamLanguage(req.params.stream, req.params.language));
      res.status(200).send("Ok!");
    });
  }

  public listen(port: number): void {
    this.server = this.app.listen(port);
  }

  public stop(): void {
    this.server.close();
  }

  // Playback controls
  public async resume() {
    return this.makeStatusRequest("?command=pl_forceresume");
  }

  public async pause() {
    return this.makeStatusRequest("?command=pl_forcepause");
  }

  // Sound controls
  public async setSoundLevel(percent: number) {
    return this.makeStatusRequest(`?command=volume&val=${Math.floor(percent * 2.56)}`);
  }

  // Audio/subtitles language control
  public async setStreamLanguage(streamType: string, language: string) {
    const streamPrefix = "Stream ";
    const status = await this.makeStatusRequest("");
    console.log(JSON.stringify(status));
    const streams = status.information.category;
    for (const stream in streams) {
      if (!stream.startsWith(streamPrefix))
        continue;
      if (streams[stream].Type.toLowerCase() != streamType)
        continue;

      const streamLanguage: string = streams[stream].Language;
      const streamIndex = Number(stream.slice(streamPrefix.length));
      if (streamLanguage.toLowerCase().match(language.toLowerCase()))
        return this.makeStatusRequest(`?command=${streamType}_track&val=${streamIndex}`);
    }
    throw Error(`No ${streamType} track for ${language} language found`);
  }

  private async makeStatusRequest(suffix: string): Promise<any> {
    const status = await rp.get(this._vlcConfig.url + "/requests/status.json" + suffix,
      { auth: { username: "", password: this._vlcConfig.password } });
    return JSON.parse(status);
  }
}

export default Vlc;
