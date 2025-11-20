import chalk from 'chalk';
import ora from 'ora';
import { getChangedFiles, stageFiles, unstageFiles, hasUnpushedCommits, createCommit, pushCurrentBranch } from '../utils/git';
import { askStageAction, pickFiles, commitTypes, askCommitType, askMessageAndDesc, confirmCommitPreview, safePrompt } from '../prompts';
import { type CmitConfig } from '../config';
import { incrementType } from '../utils/stats';
import simpleGit from 'simple-git';

type Opts = {
  quick?: boolean;
  push?: boolean;
  amend?: boolean;
  ai?: boolean;
  rawArgs?: string[];
};

async function handleFileStaging(): Promise<{ staged: string[]; unstaged: string[]; untracked: string[] }> {
  // Normalize status so staged never appears in unstaged
  const normalize = (s: { staged: string[]; unstaged: string[]; untracked: string[] }) => ({
    staged: s.staged,
    unstaged: s.unstaged.filter((f) => !s.staged.includes(f)),
    untracked: s.untracked,
  });

  let status = normalize(await getChangedFiles());
  let { staged, unstaged, untracked } = status;

  while (true) {
    const action = await askStageAction(staged, unstaged, untracked);

    if (action === 'stage') {
      const toStage = await pickFiles('Select files to stage', [...unstaged, ...untracked]);
      if (toStage.length) {
        const spinner = ora('Staging files...').start();
        await stageFiles(toStage);

        // allow git index to update (fixes the "still unstaged" bug)
        await new Promise((res) => setTimeout(res, 50));

        spinner.succeed('Staged');
      }
    } else if (action === 'unstage') {
      const toUnstage = await pickFiles('Select files to unstage', staged);
      if (toUnstage.length) {
        const spinner = ora('Unstaging files...').start();
        await unstageFiles(toUnstage);

        await new Promise((res) => setTimeout(res, 50));

        spinner.succeed('Unstaged');
      }
    } else {
      break;
    }

    status = normalize(await getChangedFiles());
    staged = status.staged;
    unstaged = status.unstaged;
    untracked = status.untracked;
  }

  if (!staged.length) {
    console.log(chalk.yellow('⚠️ No staged files after changes. Aborting commit.'));
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

  const { amend } = await safePrompt([
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
  let type: string;
  let message: string;
  let description: string;
  let scope: string | undefined = undefined;

  // Quick mode branch
  if (opts.quick && opts.rawArgs) {
    const quickResult = await handleQuickMode(opts, config, staged);
    if (!quickResult) return; // quick mode exited or failed
    ({ type, message, description } = quickResult);
  } else {
    // Interactive branch
    const interactiveResult = await handleInteractiveMode(config, scope);
    if (!interactiveResult) return;
    ({ type, message, description } = interactiveResult);
  }

  const header = buildHeader(type, scope, message);
  const fullMessage = description ? `${header}\n\n${description}` : header;

  const confirmed = await previewAndConfirm(fullMessage, staged);
  if (!confirmed) return;

  await finalizeCommit(type, header, description, opts, config, staged);
}

async function handleQuickMode(opts: Opts, config: CmitConfig, staged: string[]) {
  const nonFlagArgs = opts.rawArgs!.filter((arg) => !arg.startsWith('-'));

  if (nonFlagArgs.length < 2) {
    console.log(chalk.red('❌ Quick mode requires: -q <type> <message> [description]'));
    return null;
  }

  const [type, message, ...descParts] = nonFlagArgs;
  const description = descParts.join(' ') || '';

  const validTypes = Object.keys(config.types || {});
  if (!validTypes.includes(type)) {
    console.log(chalk.red(`❌ Invalid commit type "${type}"`));
    console.log(chalk.yellow(`Valid types: ${validTypes.join(', ')}`));
    return null;
  }

  if (!message.trim()) {
    console.log(chalk.red('❌ Commit message cannot be empty.'));
    return null;
  }

  return { type, message, description };
}

async function handleInteractiveMode(config: CmitConfig, scope?: string) {
  const typesChoice = commitTypes(config.types);
  const type = await askCommitType(typesChoice);

  const result = await askMessageAndDesc(type, scope, false, []);
  if (!result.message.trim()) {
    console.log(chalk.red('❌ Commit message cannot be empty.'));
    return null;
  }

  return { type, message: result.message, description: result.description };
}

async function finalizeCommit(type: string, header: string, description: string, opts: Opts, config: CmitConfig, staged: string[]) {
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

function buildHeader(type: string, scope: string | undefined, message: string): string {
  return scope ? `${type}(${scope}): ${message}` : `${type}: ${message}`;
}

async function previewAndConfirm(fullMessage: string, staged: string[]) {
  const ok = await confirmCommitPreview(fullMessage, staged);
  if (!ok) console.log(chalk.yellow('Commit canceled.'));
  return ok;
}

//* MAIN FLOW
export async function runCommitFlow(opts: Opts, config: CmitConfig) {
  const git = simpleGit();
  const isRepo = await git.checkIsRepo();

  if (!isRepo) {
    console.log(chalk.red('❌ Not a git repository.'));
    return;
  }

  console.log(chalk.blueBright('\ncmit — interactive commit helper\n'));

  const { staged } = await handleFileStaging();

  if (!staged.length) {
    console.log(chalk.yellow('You have no staged files! Stage some files before committing.'));
    return;
  }

  const simpleStatus = await simpleGit().status();
  if (simpleStatus.conflicted.length > 0) {
    console.log(chalk.red('❌ Cannot commit with unresolved merge conflicts:'));
    console.log(chalk.red(simpleStatus.conflicted.join(', ')));
    return;
  }

  if (await shouldAmend(opts)) {
    await performAmend();
    return;
  }

  await createNewCommit(staged, opts, config);
}
