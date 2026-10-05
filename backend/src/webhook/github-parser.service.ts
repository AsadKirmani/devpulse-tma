import { Injectable, Logger } from '@nestjs/common';

interface ParsedCommitMetric {
  repository: string;
  author: string;
  branch: string;
  commits: Array<{ message: string; url: string }>;
  totalCommits: number;
}

@Injectable()
export class GitHubParserService {
  private readonly logger = new Logger(GitHubParserService.name);

  /**
   * Parses raw incoming payloads from GitHub Webhooks
   * @param headers HTTP Headers from incoming request
   * @param payload Raw body JSON object
   */
  parsePushEvent(headers: any, payload: any): ParsedCommitMetric | null {
    // 1. Identify GitHub events using their custom native transmission header
    const gitHubEvent = headers['x-github-event'];
    
    if (gitHubEvent !== 'push') {
      this.logger.log(`Skipping event handling: Unsupported target action "${gitHubEvent}"`);
      return null;
    }

    try {
      // 2. Extract repository infrastructure properties
      const repository = payload.repository?.full_name || 'Unknown Repo';
      const branch = payload.ref ? payload.ref.replace('refs/heads/', '') : 'unknown';
      const author = payload.pusher?.name || 'anonymous';
      
      // 3. Compile map arrays for commit array metadata
      const commits = (payload.commits || []).map((commit: any) => ({
        message: commit.message,
        url: commit.url,
      }));

      return {
        repository,
        author,
        branch,
        commits,
        totalCommits: commits.length,
      };
    } catch (error: any) {
      this.logger.error(`Failed parsing event body structures safely: ${error.message}`);
      return null;
    }
  }
}
