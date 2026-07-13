import { Octokit } from "@octokit/rest";
const getOctokit = (token) => new Octokit({ auth: token });

export const fetchGithubIssues = async (token, repoString) => {
  if (!token || !repoString) return [];
  const [owner, repo] = repoString.split("/");

  try {
    const octokit = getOctokit(token);
    console.log("Fetching for:", repoString);
    const response = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: 'all',
      per_page: 50, 
    });

    console.log("GitHub Response Data:", response.data);
    const pureIssues = response.data.filter(issue => !issue.pull_request);

    console.log("Issues after filtering:", pureIssues.length); 
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

    return response.data.number; 
  } catch (error) {
    console.error("Failed to create GitHub issue:", error.message);
    return null;
  }
};

export const updateGithubIssueState = async (token, repoString, issueNumber, state) => {
  if (!token || !repoString || !issueNumber) return null;
  const [owner, repo] = repoString.split("/");

  const normalizedState = String(state).toLowerCase();
  const githubState = (normalizedState === "done" || normalizedState === "completed") ? "closed" : "open";


  try {
    const octokit = getOctokit(token);
    await octokit.rest.issues.update({
      owner,
      repo,
      issue_number: Number(issueNumber), 
      state: githubState,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28", 
      },
    });
  } catch (error) {
    console.error(`Failed to update GitHub issue #${issueNumber}:`, error.message);
  }
};