import simpleGit from 'simple-git';
import { SourceControlManager } from './sourceControlManager';
const git = simpleGit();

export class GitActions implements SourceControlManager {
  async add(snapShotPath: string): Promise<void> {
    await git.add(snapShotPath);
  }
  async commit(commitMessage: string, snapshotPath: string): Promise<void> {
    await git.commit(commitMessage, snapshotPath);
  }
  async show(inputPath: string): Promise<string> {
    return await git.show([`HEAD:${inputPath}`])
  }
}