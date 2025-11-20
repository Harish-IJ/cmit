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
  try {
    const result = await explorer.search();
    if (result?.config) {
      // Basic validation: ensure config is an object
      if (typeof result.config !== 'object' || result.config === null || Array.isArray(result.config)) {
        throw new Error('Configuration must be an object');
      }
      return result.config as CmitConfig;
    }
  } catch (err: any) {
    // Re-throw with filepath context if available
    if (err.filepath) {
      const enhancedErr = new Error(err.message);
      (enhancedErr as any).filepath = err.filepath;
      throw enhancedErr;
    }
    throw err;
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
