import * as rp from "request-promise";

class Vlc {
  constructor(private _url: string, private _password: string) { }

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

  public async getSoundLevel(): Promise<number> {
    const status = await this.makeStatusRequest("");
    return Math.floor(status.volume / 2.56);
  }

  // Audio/subtitles language control
  public async setSubtitlesLanguate(language: string) {
    return this.setStreamLanguage("subtitle", language);
  }

  public async setAudioLanguage(language: string) {
    return this.setStreamLanguage("audio", language);
  }

  private async makeStatusRequest(suffix: string): Promise<any> {
    const status = await rp.get(this._url + "/requests/status.json" + suffix,
      { auth: { username: "", password: this._password } });
    return JSON.parse(status);
  }

  private async setStreamLanguage(streamType: string, language: string) {
    const streamPrefix = "Stream ";
    const status = await this.makeStatusRequest("");
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

}

export default Vlc;
