import { Octokit } from "@octokit/rest";

// Helper to initialize Octokit with the workspace's token
const getOctokit = (token) => new Octokit({ auth: token });

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
    return response.data.number; // Return the new issue number
  } catch (error) {
    console.error("Failed to create GitHub issue:", error.message);
    return null;
  }
};

export const updateGithubIssueState = async (token, repoString, issueNumber, state) => {
  if (!token || !repoString || !issueNumber) return null;
  const [owner, repo] = repoString.split("/");

  // GitHub issues only have "open" or "closed" states
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
    console.error("Failed to update GitHub issue:", error.message);
  }
};