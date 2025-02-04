export interface SourceControlManager {
  add(snapShotPath: string): Promise<void>,
  commit(commitMessage: string, snapshotPath: string): Promise<void>,
  show(inputPath: string): Promise<string>
}