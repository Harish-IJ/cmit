import chalk from 'chalk';
import ora from 'ora';
import {
  getChangedFiles,
  stageFiles,
  unstageFiles,
  hasUnpushedCommits,
  createCommit,
  pushCurrentBranch,
} from '../utils/git';
import {
  askStageAction,
  pickFiles,
  commitTypes,
  askCommitType,
  askMessageAndDesc,
  confirmCommitPreview,
} from '../prompts';
import { CmitConfig } from '../config';
import { incrementType } from '../utils/stats';

type Opts = {
  quick?: boolean;
  push?: boolean;
  amend?: boolean;
  ai?: boolean;
  rawArgs?: string[];
};

export async function runCommitFlow(opts: Opts, config: CmitConfig) {
  console.log(chalk.blueBright('\ncmit — interactive commit helper\n'));

  // 1. show status and allow staging/unstaging
  let { staged, unstaged, untracked } = await getChangedFiles();

  // loop until user continues
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
      // continue
      break;
    }
    const changed = await getChangedFiles();
    staged = changed.staged;
    unstaged = changed.unstaged;
    untracked = changed.untracked;
  }

  if (!staged.length) {
    console.log(chalk.yellow('You have no staged files! Stage some files before committing.'));
    return;
  }

  // 2. detect unpushed commit and offer amend
  const unpushed = await hasUnpushedCommits();
  let useAmend = false;
  if (unpushed && !opts.amend) {
    // only prompt if user didn't pass --amend
    const { amend } = await require('inquirer').prompt([
      {
        type: 'confirm',
        name: 'amend',
        message:
          'There is a local commit not pushed. Add these changes to the last commit (amend)?',
        default: false,
      },
    ]);
    useAmend = amend;
  } else if (opts.amend) {
    useAmend = true;
  }

  // if amend chosen, perform amend and exit
  if (useAmend) {
    const spinner = ora('Amending last commit...').start();
    try {
      await createCommit('', '', true);
      spinner.succeed('Amended last commit');
      console.log(chalk.green('✅ Commit amended'));
      return;
    } catch (err) {
      spinner.fail('Amend failed');
      throw err;
    }
  }

  // 3. commit type selection (allow custom types from config)
  const typesChoice = commitTypes(config.types);
  const type = await askCommitType(typesChoice);

  // 4. scope auto-detection (not implemented in checked features — left for later)
  let scope: string | undefined = undefined;

  // 5. get message + description (supports quick mode inline args)
  const { message, description } = await askMessageAndDesc(
    type,
    scope,
    opts.quick,
    opts.rawArgs || [],
  );

  // build commit header
  const header = scope ? `${type}(${scope}): ${message}` : `${type}: ${message}`;
  const fullMessage = description ? `${header}\n\n${description}` : header;

  // 6. confirm & commit
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
