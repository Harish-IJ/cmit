export const defaultCommitTypes = {
  // TODO: Refactor with short detailed explanation message
  feat: 'new feature',
  fix: 'bug fix',
  docs: 'documentation',
  style: 'formatting/style',
  refactor: 'refactor',
  test: 'test',
  chore: 'chore',
};

export const defaultConfig = {
  types: { ...defaultCommitTypes },
  emoji: false, // TODO: yet to confirm
  autoScope: false, // TODO: yet to come
  lintBefore: false, // TODO: yet to confirm
  autoPush: false,
};
