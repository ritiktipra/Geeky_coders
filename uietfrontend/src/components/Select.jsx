import React from "react";

const UserCard = ({ user, onApprove, onReject }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h3 className="font-semibold text-lg">{user.name}</h3>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      {user.roll_no && <p>Roll No: {user.roll_no}</p>}
      {user.employee_id && <p>Employee ID: {user.employee_id}</p>}

      <div className="flex gap-2 mt-3">
        {onApprove && (
          <button
            onClick={() => onApprove(user._id)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded"
          >
            Approve
          </button>
        )}
        {onReject && (
          <button
            onClick={() => onReject(user._id)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
          >
            Reject
          </button>
        )}
      </div>
    </div>
  );
};

export default UserCard;
