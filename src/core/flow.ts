import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { getChangedFiles, stageFiles, unstageFiles, hasUnpushedCommits, createCommit, pushCurrentBranch } from '../utils/git';
import { askStageAction, pickFiles, commitTypes, askCommitType, askMessageAndDesc, confirmCommitPreview } from '../prompts';
import { CmitConfig } from '../config';
import { incrementType } from '../utils/stats';

type Opts = {
  quick?: boolean;
  push?: boolean;
  amend?: boolean;
  ai?: boolean;
  rawArgs?: string[];
};

async function handleFileStaging(): Promise<{ staged: string[]; unstaged: string[]; untracked: string[] }> {
  let { staged, unstaged, untracked } = await getChangedFiles();

  while (true) {
    const action = await askStageAction(staged, unstaged, untracked);
    if (action === 'stage') {
      const toStage = await pickFiles('Select files to stage', [...unstaged, ...untracked]);
      if (toStage.length) {
        const spinner = ora('Staging files...').start();
        await stageFiles(toStage);
        spinner.succeed('Staged');
      }
    } else if (action === 'unstage') {
      const toUnstage = await pickFiles('Select files to unstage', staged);
      if (toUnstage.length) {
        const spinner = ora('Unstaging files...').start();
        await unstageFiles(toUnstage);
        spinner.succeed('Unstaged');
      }
    } else {
      break;
    }
    const changed = await getChangedFiles();
    staged = changed.staged;
    unstaged = changed.unstaged;
    untracked = changed.untracked;
  }

  return { staged, unstaged, untracked };
}

async function shouldAmend(opts: Opts): Promise<boolean> {
  if (opts.amend) {
    return true;
  }

  const unpushed = await hasUnpushedCommits();
  if (!unpushed) {
    return false;
  }

  const { amend } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'amend',
      message: 'There is a local commit not pushed. Add these changes to the last commit (amend)?',
      default: false,
    },
  ]);
  return amend;
}

async function performAmend(): Promise<void> {
  const spinner = ora('Amending last commit...').start();
  try {
    await createCommit('', '', true);
    spinner.succeed('Amended last commit');
    console.log(chalk.green('✅ Commit amended'));
  } catch (err) {
    spinner.fail('Amend failed');
    throw err;
  }
}

async function createNewCommit(staged: string[], opts: Opts, config: CmitConfig): Promise<void> {
  const typesChoice = commitTypes(config.types);
  const type = await askCommitType(typesChoice);
  const scope: string | undefined = undefined;
  const { message, description } = await askMessageAndDesc(type, scope, opts.quick, opts.rawArgs || []);

  const header = scope ? `${type}(${scope}): ${message}` : `${type}: ${message}`;
  const fullMessage = description ? `${header}\n\n${description}` : header;

  const ok = await confirmCommitPreview(fullMessage, staged);
  if (!ok) {
    console.log(chalk.yellow('Commit canceled.'));
    return;
  }

  const spinner = ora('Creating commit...').start();
  try {
    await createCommit(header, description);
    spinner.succeed('Commit created');
    incrementType(type);
    console.log(chalk.green(`✅ ${header}`));

    if (opts.push || config.autoPush) {
      const pushSpinner = ora('Pushing...').start();
      await pushCurrentBranch();
      pushSpinner.succeed('Pushed');
    }
  } catch (err) {
    spinner.fail('Commit failed');
    throw err;
  }
}

export async function runCommitFlow(opts: Opts, config: CmitConfig) {
  console.log(chalk.blueBright('\ncmit — interactive commit helper\n'));

  const { staged } = await handleFileStaging();

  if (!staged.length) {
    console.log(chalk.yellow('You have no staged files! Stage some files before committing.'));
    return;
  }

  if (await shouldAmend(opts)) {
    await performAmend();
    return;
  }

  await createNewCommit(staged, opts, config);
}
