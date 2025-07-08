import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { FaUserClock, FaUserCheck, FaUserTimes, FaDownload , FaSignOutAlt} from "react-icons/fa";



export default function AdminDashboard() {
  const navigate = useNavigate();

  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [rejectedUsers, setRejectedUsers] = useState([]);

  // Filters
  const [pendingFilter, setPendingFilter] = useState("");
  const [approvedFilter, setApprovedFilter] = useState("");
  const [rejectedFilter, setRejectedFilter] = useState("");

  // Pagination
  const itemsPerPage = 5;
  const [pendingPage, setPendingPage] = useState(1);
  const [approvedPage, setApprovedPage] = useState(1);
  const [rejectedPage, setRejectedPage] = useState(1);

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

  const filterUsers = (users, filter) =>
    users.filter(
      u =>
        u.full_name.toLowerCase().includes(filter.toLowerCase()) ||
        u.user_id.toLowerCase().includes(filter.toLowerCase()) ||
        u.email.toLowerCase().includes(filter.toLowerCase())
    );

  const paginate = (users, page) =>
    users.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const exportCSV = (users, filename) => {
    if (users.length === 0) return;
    const header = "Name,Role,User ID,Email\n";
    const rows = users.map(u =>
      `"${u.full_name}","${u.role}","${u.user_id}","${u.email}"`
    );
    const csv = header + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

   const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("admin_id");  // ✅ remove saved admin_id if you have stored it
    navigate("/admin/login");
  };
  if (loading) return <div className="p-4 text-center">Loading...</div>;

  // Filtered lists
  const filteredPending = filterUsers(pendingUsers, pendingFilter);
  const filteredApproved = filterUsers(approvedUsers, approvedFilter);
  const filteredRejected = filterUsers(rejectedUsers, rejectedFilter);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200 p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-4 text-center">Admin Dashboard</h1>

      <button
          onClick={handleLogout}
          className="flex items-center bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          <FaSignOutAlt className="mr-2" /> Logout
        </button>

      {/* One block per table */}
      {[{
        title: "Pending Users",
        icon: <FaUserClock className="text-yellow-500 mr-2" />,
        users: filteredPending,
        page: pendingPage,
        setPage: setPendingPage,
        filter: pendingFilter,
        setFilter: setPendingFilter,
        showActions: true,
        original: pendingUsers,
        filename: "pending_users.csv"
      },
      {
        title: "Approved Users",
        icon: <FaUserCheck className="text-green-500 mr-2" />,
        users: filteredApproved,
        page: approvedPage,
        setPage: setApprovedPage,
        filter: approvedFilter,
        setFilter: setApprovedFilter,
        showActions: false,
        original: approvedUsers,
        filename: "approved_users.csv"
      },
      {
        title: "Rejected Users",
        icon: <FaUserTimes className="text-red-500 mr-2" />,
        users: filteredRejected,
        page: rejectedPage,
        setPage: setRejectedPage,
        filter: rejectedFilter,
        setFilter: setRejectedFilter,
        showActions: false,
        original: rejectedUsers,
        filename: "rejected_users.csv"
      }].map((section, idx) => (
        <div key={idx} className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-xl font-semibold">
              {section.icon} {section.title}
            </div>
            <button
              onClick={() => exportCSV(section.users, section.filename)}
              className="flex items-center bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-sm"
            >
              <FaDownload className="mr-1" /> Export CSV
            </button>
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={section.filter}
            onChange={e => {
              section.setFilter(e.target.value);
              section.setPage(1);
            }}
            className="mb-3 w-full border px-2 py-1 rounded"
          />

          {section.users.length === 0 ? (
            <p className="text-gray-500">No users found.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 py-1 border">Name</th>
                      <th className="px-2 py-1 border">Role</th>
                      <th className="px-2 py-1 border">User ID</th>
                      <th className="px-2 py-1 border">Email</th>
                      {section.showActions && <th className="px-2 py-1 border">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {paginate(section.users, section.page).map(u => (
                      <tr key={u.user_id} className="text-center">
                        <td className="px-2 py-1 border">{u.full_name}</td>
                        <td className="px-2 py-1 border capitalize">{u.role}</td>
                        <td className="px-2 py-1 border">{u.user_id}</td>
                        <td className="px-2 py-1 border">{u.email}</td>
                        {section.showActions && (
                          <td className="px-2 py-1 border space-x-1">
                            <button
                              onClick={() => handleApprove(u.user_id, u.role)}
                              className="bg-green-500 text-white px-2 py-0.5 rounded hover:bg-green-600 text-xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(u.user_id, u.role)}
                              className="bg-red-500 text-white px-2 py-0.5 rounded hover:bg-red-600 text-xs"
                            >
                              Reject
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              <div className="flex justify-center mt-2 space-x-2">
                <button
                  onClick={() => section.setPage(p => Math.max(1, p - 1))}
                  disabled={section.page === 1}
                  className="px-2 py-1 rounded bg-gray-200 disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-sm pt-1">
                  Page {section.page} / {Math.ceil(section.users.length / itemsPerPage)}
                </span>
                <button
                  onClick={() =>
                    section.setPage(p =>
                      p < Math.ceil(section.users.length / itemsPerPage) ? p + 1 : p
                    )
                  }
                  disabled={section.page >= Math.ceil(section.users.length / itemsPerPage)}
                  className="px-2 py-1 rounded bg-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
