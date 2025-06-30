import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [rejectedUsers, setRejectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");
    if (role !== "admin" || !token) {
      navigate("/admin/login");
    } else {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        pendingStudentsRes, pendingTeachersRes,
        approvedStudentsRes, approvedTeachersRes,
        rejectedStudentsRes, rejectedTeachersRes
      ] = await Promise.all([
        api.get("/admin/list/pending/students"),
        api.get("/admin/list/pending/teachers"),
        api.get("/admin/list/approved/students"),
        api.get("/admin/list/approved/teachers"),
        api.get("/admin/list/rejected/students"),
        api.get("/admin/list/rejected/teachers"),
      ]);

      const mapUsers = (data, roleField, idField) =>
        data.map(u => ({ ...u, role: roleField, user_id: u[idField] }));

      setPendingUsers([
        ...mapUsers(pendingStudentsRes.data, "student", "roll_no"),
        ...mapUsers(pendingTeachersRes.data, "teacher", "employee_id"),
      ]);
      setApprovedUsers([
        ...mapUsers(approvedStudentsRes.data, "student", "roll_no"),
        ...mapUsers(approvedTeachersRes.data, "teacher", "employee_id"),
      ]);
      setRejectedUsers([
        ...mapUsers(rejectedStudentsRes.data, "student", "roll_no"),
        ...mapUsers(rejectedTeachersRes.data, "teacher", "employee_id"),
      ]);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
    setLoading(false);
  };

  const handleApprove = async (userId, role) => {
    try {
      if (role === "student") {
        await api.post(`/admin/approve/student/${userId}`);
      } else if (role === "teacher") {
        await api.post(`/admin/approve/teacher/${userId}`);
      }
      const approvedUser = pendingUsers.find(u => u.user_id === userId);
      setPendingUsers(prev => prev.filter(u => u.user_id !== userId));
      setApprovedUsers(prev => [...prev, approvedUser]);
    } catch (err) {
      console.error("Error approving user:", err);
    }
  };

  const handleReject = async (userId, role) => {
    try {
      if (role === "student") {
        await api.post(`/admin/reject/student/${userId}`);
      } else if (role === "teacher") {
        await api.post(`/admin/reject/teacher/${userId}`);
      }
      const rejectedUser = pendingUsers.find(u => u.user_id === userId);
      setPendingUsers(prev => prev.filter(u => u.user_id !== userId));
      setRejectedUsers(prev => [...prev, rejectedUser]);
    } catch (err) {
      console.error("Error rejecting user:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <>
          {/* Pending Users */}
          <div className="bg-white rounded shadow p-4 mb-6">
            <h2 className="text-xl font-semibold mb-2">Pending Users</h2>
            {pendingUsers.length === 0 ? (
              <p className="text-gray-500">No pending users.</p>
            ) : (
              <div className="space-y-2">
                {pendingUsers.map(user => (
                  <div key={user.user_id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{user.name} ({user.role})</p>
                      <p className="text-xs text-gray-600">{user.user_id} | {user.email}</p>
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleApprove(user.user_id, user.role)}
                        className="bg-green-500 text-white px-2 py-1 rounded"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(user.user_id, user.role)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Approved Users */}
          <div className="bg-white rounded shadow p-4 mb-6">
            <h2 className="text-xl font-semibold mb-2">Approved Users</h2>
            {approvedUsers.length === 0 ? (
              <p className="text-gray-500">No approved users yet.</p>
            ) : (
              <div className="space-y-1">
                {approvedUsers.map(user => (
                  <p key={user.user_id} className="text-sm">
                    {user.name} ({user.role} | {user.user_id})
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Rejected Users */}
          <div className="bg-white rounded shadow p-4">
            <h2 className="text-xl font-semibold mb-2">Rejected Users</h2>
            {rejectedUsers.length === 0 ? (
              <p className="text-gray-500">No rejected users yet.</p>
            ) : (
              <div className="space-y-1">
                {rejectedUsers.map(user => (
                  <p key={user.user_id} className="text-sm">
                    {user.name} ({user.role} | {user.user_id})
                  </p>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
