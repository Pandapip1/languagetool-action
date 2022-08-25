import core from '@actions/core';
import github from '@actions/github';
import { GitHub, getOctokitOptions } from '@actions/github/lib/utils';
import { throttling } from '@octokit/plugin-throttling';
import { PullRequestEvent } from '@octokit/webhooks-types';

const unknown = '<unknown>';
const ThrottledOctokit = GitHub.plugin(throttling);
// Initialize GitHub API
const GITHUB_TOKEN = core.getInput('token');
const octokit = new ThrottledOctokit(getOctokitOptions(GITHUB_TOKEN, { throttle: {
  onRateLimit: (retryAfter: number, options: any) => {
    octokit.log.warn(`Request quota exhausted for request ${options?.method || unknown} ${options?.url || unknown}`);
    if (options?.request?.retryCount <= 2) {
      console.log(`Retrying after ${retryAfter} seconds!`);
      return true;
    }
  },
  onSecondaryRateLimit: (_retryAfter: number, options: any) => octokit.log.warn(`Abuse detected for request ${options?.method || unknown} ${options?.url || unknown}`),
} }));

async function run() {
  // Deconstruct the payload
  const payload = github.context.payload as PullRequestEvent;
  const { repository, pull_request } = payload;
  let pull_number = pull_request?.number;

  // Process files
  const files = await octokit.paginate(octokit.rest.pulls.listFiles, {
    owner: repository.owner.login,
    repo: repository.name,
    pull_number
  });

    
};

run();