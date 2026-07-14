import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api'; // Use your custom api instance rather than raw axios
import { Loader2, AlertTriangle } from 'lucide-react';

export default function JoinWorkspace() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("joining"); // joining | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const processWorkspaceJoin = async () => {
      try {
        // ✅ Fire request using your pre-configured client instance
        const response = await api.post('/api/workspaces/join-by-token', { inviteToken: token });

        // Look for the workspace ID fallback options if it's nested differently
        const workspaceId = response.data?.workspaceId || response.data?.workspace?._id;

        if (workspaceId) {
          // Navigate them straight into the dynamic workspace route
          navigate(`/workspace/${workspaceId}`);
        } else {
          console.error("Payload missing target workspace ID registry:", response.data);
          setStatus("error");
          setMessage("Joined successfully, but could not locate the workspace routing ID.");
        }
      } catch (err) {
        console.error("Workspace link consumer failed:", err);
        setStatus("error");
        
        if (err.response?.status === 401) {
          setMessage("You must be logged in to accept this invitation link.");
          // Redirect them to login page after a short delay
          setTimeout(() => navigate('/login', { state: { from: window.location.pathname } }), 2500);
        } else {
          setMessage(err.response?.data?.message || "This invitation token is invalid or has expired.");
        }
      }
    };

    if (token) {
      processWorkspaceJoin();
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center space-y-4">
        {status === "joining" ? (
          <>
            <Loader2 className="animate-spin text-primary mx-auto" size={40} />
            <h2 className="text-xl font-bold text-slate-800">Processing Invitation</h2>
            <p className="text-sm text-slate-500">Adding your profile to the workspace configuration...</p>
          </>
        ) : (
          <>
            <div className="p-3 bg-red-100 text-red-600 rounded-full w-fit mx-auto">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Invitation Failed</h2>
            <p className="text-sm text-red-600 font-medium">{message}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-2 w-full px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition text-sm"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}