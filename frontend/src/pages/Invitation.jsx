import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Invitation() {
  const { invitationId } = useParams();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const res = await api.get(
          `/api/workspace-invitations/${invitationId}`
        );

        setInvitation(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [invitationId]);

  const handleAccept = async () => {
    try {
      setProcessing(true);

      await api.post(
        `/api/workspace-invitations/${invitationId}/accept`
      );

      alert("Invitation accepted!");

      navigate(`/workspace/${invitation.workspaceId}/overview`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Something went wrong.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    try {
      setProcessing(true);

      await api.post(
        `/api/workspace-invitations/${invitationId}/decline`
      );

      alert("Invitation declined.");

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Something went wrong.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading invitation...
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="flex items-center justify-center h-full">
        Invitation not found.
      </div>
    );
  }

  return (
    <div className="flex justify-center py-16 px-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg border p-8">

        <h1 className="text-3xl font-bold mb-2">
          Workspace Invitation
        </h1>

        <p className="text-gray-600 mb-8">
          <strong>{invitation.inviter}</strong> invited you to join
        </p>

        <div className="bg-gray-50 rounded-xl p-5 border mb-8">
          <h2 className="text-xl font-semibold">
            {invitation.workspaceName}
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            Status: {invitation.status}
          </p>
        </div>

        {invitation.status === "PENDING" ? (
          <div className="flex gap-4">

            <button
              disabled={processing}
              onClick={handleAccept}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-60"
            >
              Accept
            </button>

            <button
              disabled={processing}
              onClick={handleDecline}
              className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-60"
            >
              Decline
            </button>

          </div>
        ) : (
          <div className="text-center text-lg font-semibold text-gray-600">
            This invitation has already been {invitation.status.toLowerCase()}.
          </div>
        )}

      </div>
    </div>
  );
}