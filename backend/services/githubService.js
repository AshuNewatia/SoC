import { Octokit } from "@octokit/rest";

// Helper to initialize Octokit with the user's token
const getOctokit = (token) => new Octokit({ auth: token });

/**
 * ==========================================
 * 1. PULL: FETCH ISSUES FROM GITHUB
 * ==========================================
 * Used when initially linking a repo or pressing a "Sync" button.
 */
export const fetchGithubIssues = async (token, repoString) => {
  if (!token || !repoString) return [];
  const [owner, repo] = repoString.split("/");

  try {
    const octokit = getOctokit(token);
    const response = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: 'all', // Get both open and closed issues
      per_page: 50, // Grab the latest 50
    });

    // GitHub treats Pull Requests as issues, so we filter them out
    const pureIssues = response.data.filter(issue => !issue.pull_request);

    // Map GitHub's format to match your CampusFlow task schema
    return pureIssues.map(issue => ({
      title: issue.title,
      description: issue.body || "No description provided.",
      status: issue.state === 'closed' ? 'Done' : 'Todo',
      githubIssueNumber: issue.number,
      githubUrl: issue.html_url,
    }));

  } catch (error) {
    console.error("Failed to fetch GitHub issues:", error.message);
    throw new Error("Could not pull issues from GitHub. Please check the repo name and token permissions.");
  }
};

/**
 * ==========================================
 * 2. PUSH: CREATE NEW ISSUE ON GITHUB
 * ==========================================
 * Used when a user creates a new task on the CampusFlow board.
 */
export const createGithubIssue = async (token, repoString, title, description) => {
  if (!token || !repoString) return null;
  const [owner, repo] = repoString.split("/");

  try {
    const octokit = getOctokit(token);
    const response = await octokit.rest.issues.create({
      owner,
      repo,
      title,
      body: description || "No description provided.",
    });
    
    // Return the new issue number so we can save it to the MongoDB task
    return response.data.number; 
  } catch (error) {
    console.error("Failed to create GitHub issue:", error.message);
    return null;
  }
};

/**
 * ==========================================
 * 3. PUSH: UPDATE ISSUE STATE ON GITHUB
 * ==========================================
 * Used when a user drags a task between columns (e.g., Todo -> Done).
 */
export const updateGithubIssueState = async (token, repoString, issueNumber, state) => {
  if (!token || !repoString || !issueNumber) return null;
  const [owner, repo] = repoString.split("/");

  // GitHub issues only have "open" or "closed" states
  // We map your Kanban states to GitHub's binary states
  const githubState = state === "Done" ? "closed" : "open";

  try {
    const octokit = getOctokit(token);
    await octokit.rest.issues.update({
      owner,
      repo,
      issue_number: issueNumber,
      state: githubState,
    });
  } catch (error) {
    console.error(`Failed to update GitHub issue #${issueNumber}:`, error.message);
  }
};