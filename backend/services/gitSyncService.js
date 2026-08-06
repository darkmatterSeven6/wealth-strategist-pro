const { exec } = require('child_process');
const path = require('path');
const dataStore = require('./dataStore');

const REPO_ROOT = path.join(__dirname, '..', '..');

/**
 * Execute a shell command inside the repository root
 */
function runGitCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: REPO_ROOT, timeout: 30000 }, (error, stdout, stderr) => {
      if (error) {
        // If git commit returns 1 because nothing was changed, handle gracefully
        return resolve({ success: false, error: error.message, stderr, stdout });
      }
      resolve({ success: true, stdout: stdout.trim(), stderr: stderr.trim() });
    });
  });
}

class GitSyncService {
  /**
   * Save all local in-memory state to disk and commit/push to GitHub repository
   */
  async saveAndPush(customMessage = null) {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    // 1. Force flush current DataStore state to disk
    const db = dataStore.getDb();
    const localSaveSuccess = dataStore.saveDb(db);

    if (!localSaveSuccess) {
      return {
        success: false,
        error: 'Failed to write local database (db.json) to disk.',
        localSaved: false,
        githubPushed: false,
        timestamp
      };
    }

    const defaultMsg = `chore: Sync & save latest financial state [${timestamp}]`;
    const message = customMessage || defaultMsg;

    try {
      // 2. Stage all modifications (database, configs, overrides)
      await runGitCommand('git add .');

      // 3. Check status
      const statusRes = await runGitCommand('git status --porcelain');
      let commitOutput = '';
      let hasChanges = false;

      if (statusRes.stdout && statusRes.stdout.length > 0) {
        hasChanges = true;
        // Commit changes
        const commitRes = await runGitCommand(`git commit -m "${message.replace(/"/g, '\\"')}"`);
        commitOutput = commitRes.stdout || commitRes.stderr;
      }

      // 4. Push to remote origin main
      const pushRes = await runGitCommand('git push origin main');
      const pushSuccess = pushRes.success || !pushRes.stderr.includes('fatal:');

      // 5. Get latest commit hash
      const logRes = await runGitCommand('git log -1 --format="%h - %s (%cr)"');
      const lastCommit = logRes.stdout || 'Latest commit';

      // Log in system sync logs
      dataStore.addSyncLog(
        'GitHub Cloud Sync',
        pushSuccess ? 'success' : 'warning',
        pushSuccess
          ? `Synced state to GitHub (${hasChanges ? 'new commit pushed' : 'already up-to-date'})`
          : `Saved locally; GitHub push warning: ${pushRes.stderr || pushRes.error}`
      );

      return {
        success: true,
        localSaved: true,
        githubPushed: pushSuccess,
        hasNewChanges: hasChanges,
        commitMessage: message,
        lastCommit,
        pushOutput: pushRes.stdout || pushRes.stderr,
        timestamp
      };
    } catch (err) {
      console.error('[GitSyncService] Error during git sync:', err);
      dataStore.addSyncLog('GitHub Cloud Sync', 'error', `Git sync failed: ${err.message}`);
      return {
        success: true, // local save succeeded
        localSaved: true,
        githubPushed: false,
        error: err.message,
        timestamp
      };
    }
  }

  /**
   * Check if there are local uncommitted or unpushed changes
   */
  async getStatus() {
    try {
      const statusRes = await runGitCommand('git status --porcelain');
      const logRes = await runGitCommand('git log -1 --format="%h - %s (%cr)"');
      const dirtyFiles = statusRes.stdout ? statusRes.stdout.split('\n').filter(Boolean) : [];

      return {
        success: true,
        isClean: dirtyFiles.length === 0,
        dirtyCount: dirtyFiles.length,
        dirtyFiles,
        lastCommit: logRes.stdout || 'Unknown',
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }
}

module.exports = new GitSyncService();
