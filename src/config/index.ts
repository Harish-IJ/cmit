import chalk from 'chalk';
import { cosmiconfig } from 'cosmiconfig';
import { defaultConfig } from '../utils/constants';

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
      if (typeof result.config !== 'object' || result.config === null || Array.isArray(result.config)) {
        throw new Error('Configuration must be an object');
      }

      if (result.config.types && typeof result.config.types !== 'object') {
        console.log(chalk.yellow("⚠️ Invalid 'types' in .cmitrc, using defaults."));
        result.config.types = undefined;
      }

      return result.config as CmitConfig;
    }
  } catch (err: any) {
    if (err.filepath) {
      const enhancedErr = new Error(err.message);
      (enhancedErr as any).filepath = err.filepath;
      throw enhancedErr;
    }
    throw err;
  }

  // defaults
  return defaultConfig;
}
