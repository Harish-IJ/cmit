import inquirer from 'inquirer';
import chalk from 'chalk';
import { defaultCommitTypes } from '../utils/constants';

export async function safePrompt<T = Record<string, any>>(questions: any): Promise<T> {
  try {
    const result = await inquirer.prompt(questions);
    return result as T;
  } catch (err: any) {
    if (err?.isTtyError || err?.message?.includes('force closed')) {
      console.log(chalk.red('\n✋ Cancelled.'));
      process.exit(1);
    }
    throw err;
  }
}

export const commitTypes = (custom?: Record<string, string>): { name: string; value: string }[] => {
  const merged = { ...defaultCommitTypes, ...(custom || {}) } as Record<string, string>;
  return Object.keys(merged).map((k) => ({
    name: `${k} — ${merged[k]}`,
    value: k,
  }));
};

export async function askStageAction(staged: string[], unstaged: string[], untracked: string[]) {
  console.log(chalk.bold('\nStaged files:'), staged.length ? staged.join(', ') : chalk.dim('none'));
  console.log(chalk.bold('Unstaged files:'), unstaged.length ? unstaged.join(', ') : chalk.dim('none'));
  console.log(chalk.bold('Untracked files:'), untracked.length ? untracked.join(', ') : chalk.dim('none'));

  const { action } = await safePrompt<{ action: string }>([
    {
      type: 'list',
      name: 'action',
      message: 'Choose an action',
      choices: [
        { name: 'Stage files', value: 'stage' },
        { name: 'Unstage files', value: 'unstage' },
        { name: 'Continue to commit', value: 'continue' },
      ],
    },
  ]);
  return action;
}

export async function pickFiles(message: string, files: string[]) {
  if (!files.length) return [];
  const { chosen } = await safePrompt<{ chosen: string[] }>([
    {
      type: 'checkbox',
      name: 'chosen',
      message,
      choices: files.map((f) => ({ name: f, value: f })),
    },
  ]);
  return chosen || [];
}

export async function askCommitType(typesChoices: { name: string; value: string }[]) {
  const { type } = await safePrompt<{ type: string }>([
    { type: 'list', name: 'type', message: 'Choose commit type', choices: typesChoices },
  ]);
  return type;
}

export async function askMessageAndDesc(type: string, scope?: string, quick?: boolean, quickArgs?: string[]) {
  if (quick && quickArgs && quickArgs.length >= 2) {
    return { message: quickArgs[1], description: quickArgs.slice(2).join(' ') || '' };
  }

  const { message } = await safePrompt<{ message: string }>([
    {
      type: 'input',
      name: 'message',
      message: 'Short commit message (imperative):',
      validate: (v: string) => (v.trim().length === 0 ? 'Message required' : true),
    },
  ]);

  const { description } = await safePrompt<{ description: string }>([
    {
      type: 'input',
      name: 'description',
      message: 'Optional longer description (press enter to skip):',
      default: '',
    },
  ]);

  return { message, description };
}

export async function confirmCommitPreview(fullMessage: string, files: string[]) {
  console.log('\n' + chalk.green('Commit preview:'));
  console.log(chalk.bold(fullMessage) + '\n');
  console.log(chalk.dim('Staged files: ' + files.join(', ')));
  const { ok } = await safePrompt<{ ok: boolean }>([{ type: 'confirm', name: 'ok', message: 'Proceed to commit?', default: true }]);
  return ok;
}
