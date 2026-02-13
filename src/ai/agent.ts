import type { Agent } from '../components/store';

export abstract class AIAgent {
  protected _agent: Agent;

  constructor(agent: Agent) {
    this._agent = agent;
  }

  abstract init(): Promise<void>;

  abstract sendMessage(messageContent: string): Promise<string | undefined>;
}
