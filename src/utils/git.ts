// src/utils/git.ts
import simpleGit, { SimpleGit, StatusResult } from 'simple-git';
const git: SimpleGit = simpleGit();

/**
 * Return the status object from simple-git
 */
export async function getStatus(): Promise<StatusResult> {
  return git.status();
}

/**
 * Stage the given files
 */
export async function stageFiles(files: string[]): Promise<void> {
  await git.add(files);
}

/**
 * Unstage given files
 */
export async function unstageFiles(files: string[]): Promise<void> {
  // git reset HEAD -- <files...>
  await git.raw(['reset', 'HEAD', '--', ...files]);
}

/**
 * Create a commit. If `amend` is true, amend the previous commit.
 * message = header, description is optional.
 */
export async function createCommit(
  message: string,
  description?: string,
  amend = false,
): Promise<void> {
  const full = description ? `${message}\n\n${description}` : message;
  if (amend) {
    // Note: simple-git options for amend require raw args
    await git.commit(full, undefined, { '--amend': null });
  } else {
    await git.commit(full);
  }
}

/**
 * Push current branch to origin
 */
export async function pushCurrentBranch(): Promise<void> {
  const branchSummary = await git.branch();
  const current = branchSummary.current;
  if (!current) throw new Error('Could not determine current branch');
  await git.push('origin', current);
}

/**
 * Return whether there are local unpushed commits.
 * If upstream not configured, returns false.
 */
export async function hasUnpushedCommits(): Promise<boolean> {
  try {
    const out = await git.raw(['rev-list', '--count', '@{u}..HEAD']);
    return parseInt(out.trim(), 10) > 0;
  } catch {
    // upstream not set or other git error
    return false;
  }
}

/**
 * Return arrays of staged / unstaged / untracked files
 */
export async function getChangedFiles(): Promise<{
  staged: string[];
  unstaged: string[];
  untracked: string[];
}> {
  const s = await getStatus();
  return { staged: s.staged, unstaged: s.modified, untracked: s.not_added };
}
