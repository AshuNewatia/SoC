import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Workspaces</h1>
        <button
          onClick={() => navigate('/login')}
          className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
        >
          Logout
        </button>
      </div>
      <p className="text-gray-600">You don't have any workspaces yet.</p>
      <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        + Create Workspace
      </button>
    </div>
  );
}

export default Dashboard;