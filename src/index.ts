import { argv } from 'node:process';
import chalk from 'chalk';
import { runCommitFlow } from './core/flow';
import { loadConfig } from './config';
import { details } from './details';

(async () => {
  const args = argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(chalk.bold('cmit — interactive commit helper'));
    console.log('Usage: cmit [options]');
    console.log('  -q, --quick     quick mode: provide type + message inline');
    console.log('  --push          push after commit');
    console.log('  --amend         amend last local commit');
    console.log('  --version       show version');
    process.exit(0);
  }

  if (args.includes('--version') || args.includes('-v')) {
    console.log(`cmit ${details.version}`);
    process.exit(0);
  }

  const config = await loadConfig();
  const opts = {
    quick: args.includes('-q') || args.includes('--quick'),
    push: args.includes('--push'),
    amend: args.includes('--amend'),
    ai: args.includes('--ai'),
    rawArgs: args,
  };

  try {
    await runCommitFlow(opts, config);
  } catch (err) {
    console.error(chalk.red('Error:'), (err as Error).message);
    process.exit(1);
  }
})();

//* Global fallback handlers
process.on('unhandledRejection', (err) => {
  console.log(chalk.red('Unhandled rejection:'), err);
});

process.on('uncaughtException', (err) => {
  console.log(chalk.red('Unhandled error:'), err);
});

process.on('SIGINT', () => {
  console.log(chalk.red('\n✋ Cancelled.'));
  process.exit(1);
});
