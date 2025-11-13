import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import simpleGit from 'simple-git';
import { cosmiconfig } from 'cosmiconfig';

async function main() {
  console.log(chalk.blueBright('Starting dependency test...\n'));

  const spinnerGit = ora('Testing simple-git...').start();
  try {
    const git = simpleGit();
    const status = await git.status();
    spinnerGit.succeed('simple-git OK!');
    console.log(chalk.green('Git status loaded'));
    console.log(chalk.gray(JSON.stringify(status, null, 2)));
  } catch (err) {
    spinnerGit.fail('simple-git FAILED');
    console.error(err);
  }

  const answer = await inquirer.prompt<{ ok: string }>([
    {
      type: 'list',
      name: 'ok',
      message: 'Is inquirer working?',
      choices: ['Yes', 'No'],
    },
  ]);

  console.log(chalk.yellow(`You selected: ${answer.ok}`));

  console.log(chalk.magenta('Chalk coloring works'));

  const spinner = ora('Testing ora spinner...').start();
  setTimeout(() => {
    spinner.succeed('Ora spinner OK!');
  }, 1000);

  const explorer = cosmiconfig('cmit');
  const configResult = await explorer.search();

  console.log(
    chalk.cyan('\nCosmiconfig result:'),
    configResult?.config ? chalk.green('Config found!') : chalk.red('No config found.'),
  );

  if (configResult?.config) {
    console.log(chalk.gray(JSON.stringify(configResult.config, null, 2)));
  }

  console.log(chalk.green('\n All dependencies tested!'));
}

main();
