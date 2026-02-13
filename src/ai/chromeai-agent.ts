import { AIAgent } from './agent';

export class ChromeAIAgent extends AIAgent {
  public session: LanguageModel | null = null;

  async init(): Promise<void> {
    const lastProgress = 0;

    this.session = await LanguageModel.create({
      expectedInputs: [{ type: 'text', languages: ['en'] }],
      expectedOutputs: [{ type: 'text', languages: ['en'] }],
      initialPrompts: [{ role: 'system', content: this._agent.prompt }],
      monitor: (m) => {
        m.addEventListener('downloadprogress', (e) => {
          const percentage = Math.floor(e.loaded * 100);

          if (lastProgress === percentage) {
            return;
          }

          console.log(`${this._agent.name} - Downloaded: ${percentage}`);

          if (percentage === 100) {
            console.log(`${this._agent.name} - AI model downloaded`);
          }
        });
      },
    });
  }

  async sendMessage(messageContent: string): Promise<string | undefined> {
    return this.session?.prompt(messageContent);
  }
}
