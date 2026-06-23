export const getRoleFromEmail = (email) => {
  const username = email
    .split("@")[0]
    .toLowerCase();

  return /\d/.test(username)
    ? "student"
    : "professor";
};