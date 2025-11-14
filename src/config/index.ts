import { cosmiconfig } from 'cosmiconfig';

export type CmitConfig = {
  types?: Record<string, string>;
  emoji?: boolean;
  autoScope?: boolean;
  lintBefore?: boolean;
  aiEnabled?: boolean;
  autoPush?: boolean;
};

const explorer = cosmiconfig('cmit');

export async function loadConfig(): Promise<CmitConfig> {
  const result = await explorer.search();
  if (result && result.config) {
    return result.config as CmitConfig;
  }
  // defaults
  return {
    types: {
      feat: 'new feature',
      fix: 'bug fix',
      docs: 'documentation',
      style: 'formatting/style',
      refactor: 'refactor',
      test: 'test',
      chore: 'chore',
    },
    emoji: false,
    autoScope: false,
    lintBefore: false,
    aiEnabled: false,
    autoPush: false,
  };
}
