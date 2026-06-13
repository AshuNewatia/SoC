export const deleteTask = (
  id
) =>
  axios.delete(
    `${API}/${id}`
  );