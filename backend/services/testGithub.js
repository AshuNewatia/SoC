import { fetchGithubIssues, createGithubIssue, updateGithubIssueState } from './githubService.js';

const runTest = async () => {
  // Replace this with your actual GitHub Personal Access Token (Classic)
  // Make sure the token has "repo" scope checked!
  const TOKEN = "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"; 
  const REPO = "AshuNewatia/MyTestRepo";

  try {
    console.log("🚀 Starting GitHub Integration Test...");

    // 1. Test PUSH (Create an issue)
    console.log(`\n📝 1. Creating a test issue in ${REPO}...`);
    const newIssueNum = await createGithubIssue(
      TOKEN, 
      REPO, 
      "Test Task from CampusFlow Backend", 
      "If you see this, the API push connection is working perfectly!"
    );
    console.log(`✅ Success! Created Issue #${newIssueNum}`);

    // 2. Test PULL (Fetch issues)
    console.log("\n📥 2. Fetching existing issues...");
    const issues = await fetchGithubIssues(TOKEN, REPO);
    console.log(`✅ Success! Found ${issues.length} issues.`);
    console.log("Here is the latest one:", issues[0]);

    // 3. Test SYNC (Update state)
    console.log(`\n🔄 3. Closing Issue #${newIssueNum}...`);
    await updateGithubIssueState(TOKEN, REPO, newIssueNum, "Done");
    console.log(`✅ Success! Issue #${newIssueNum} closed on GitHub.`);

    console.log("\n🎉 ALL TESTS PASSED!");

  } catch (error) {
    console.error("\n❌ TEST FAILED:");
    console.error(error.message);
  }
};

runTest();