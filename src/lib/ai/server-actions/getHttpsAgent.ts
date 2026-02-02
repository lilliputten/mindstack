import { Agent, AgentOptions } from 'node:https';

let httpsAgent: Agent | undefined;

export function getHttpsAgent() {
  if (httpsAgent) {
    return httpsAgent;
  }
  const options = {
    rejectUnauthorized: false, // Disable certificate check
  } satisfies AgentOptions;
  httpsAgent = new Agent(options);
  return httpsAgent;
}
