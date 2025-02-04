import { SourceControlManager } from "./sourceControlManager";

export class GitMock implements SourceControlManager {
  public commitCalls: [string, string][] = [];
  public addCalls: string[] = [];
  public showCalls: [string, string][] = [];
  public content: string;

  constructor(content: string = 'File content') {
    this.content = content;
  }

  async add(snapShotPath: string): Promise<void> {
    this.addCalls.push(snapShotPath);
  }
  async commit(commitMessage: string, snapshotPath: string): Promise<void> {
    this.commitCalls.push([commitMessage, snapshotPath]);
  }
  async show(inputPath: string): Promise<string> {
    this.showCalls.push([inputPath, 'result']);
    return this.content;
  }
}
