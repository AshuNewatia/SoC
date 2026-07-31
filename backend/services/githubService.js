import { Octokit } from "@octokit/rest";

const getOctokit = (token) => new Octokit({ auth: token });

// 🛠 Helper: Clean repoString (removes full URLs or trailing .git)
const parseRepoString = (repoString) => {
  if (!repoString) return { owner: "", repo: "" };
  let clean = repoString.trim().replace(/\.git$/, "");
  if (clean.includes("github.com/")) {
    clean = clean.split("github.com/")[1];
  }
  const parts = clean.split("/");
  return { owner: parts[0] || "", repo: parts[1] || "" };
};

// -------------------------------------------------------------
// 1. FETCH ISSUES
// -------------------------------------------------------------
export const fetchGithubIssues = async (token, repoString) => {
  if (!token || !repoString) return [];
  const { owner, repo } = parseRepoString(repoString);

  try {
    const octokit = getOctokit(token);
    const response = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: "all",
      per_page: 50,
    });

    const pureIssues = response.data.filter((issue) => !issue.pull_request);

    return pureIssues.map((issue) => ({
      title: issue.title,
      description: issue.body || "No description provided.",
      status: issue.state === "closed" ? "Done" : "Todo",
      githubIssueNumber: issue.number,
      githubUrl: issue.html_url,
    }));
  } catch (error) {
    console.error("Failed to fetch GitHub issues:", error.message);
    throw new Error("Could not pull issues from GitHub. Check repo name and token permissions.");
  }
};

// -------------------------------------------------------------
// 2. CREATE ISSUE
// -------------------------------------------------------------
export const createGithubIssue = async (token, repoString, title, description) => {
  if (!token || !repoString) return null;
  const { owner, repo } = parseRepoString(repoString);

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

// -------------------------------------------------------------
// 3. UPDATE ISSUE STATE
// -------------------------------------------------------------
export const updateGithubIssueState = async (token, repoString, issueNumber, state) => {
  if (!token || !repoString || !issueNumber) return null;
  const { owner, repo } = parseRepoString(repoString);

  const normalizedState = String(state).toLowerCase();
  const githubState =
    normalizedState === "done" ||
    normalizedState === "completed" ||
    normalizedState === "closed"
      ? "closed"
      : "open";

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

// -------------------------------------------------------------
// 4. NEW: FETCH REPOSITORY COMMIT ANALYTICS (Solves the "0 Commits" issue)
// -------------------------------------------------------------
export const fetchGithubRepoStats = async (token, repoString) => {
  if (!token || !repoString) return { totalCommits: 0, contributors: 0, branches: 0 };
  const { owner, repo } = parseRepoString(repoString);

  try {
    const octokit = getOctokit(token);

    // Fetch Commits List
    const commitsResponse = await octokit.rest.repos.listCommits({
      owner,
      repo,
      per_page: 100, // Retrieves recent commit history
    });

    // Fetch Contributors List
    const contributorsResponse = await octokit.rest.repos.listContributors({
      owner,
      repo,
      per_page: 100,
    });

    // Fetch Branches
    const branchesResponse = await octokit.rest.repos.listBranches({
      owner,
      repo,
    });

    return {
      totalCommits: commitsResponse.data.length || 0,
      contributors: contributorsResponse.data.length || 0,
      branches: branchesResponse.data.length || 0,
      recentCommits: commitsResponse.data.slice(0, 5).map((commit) => ({
        message: commit.commit.message,
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        url: commit.html_url,
      })),
    };
  } catch (error) {
    console.error("Failed to fetch GitHub repo stats:", error.message);
    return { totalCommits: 0, contributors: 0, branches: 0, recentCommits: [] };
  }
};