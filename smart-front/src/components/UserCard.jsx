// import React from "react";

// const UserCard = ({ user, onApprove }) => {
//   return (
//     <div className="user-card">
//       <div>
//         <strong>{user.name}</strong> ({user.email}) 📧
//       </div>
//       <button onClick={() => onApprove(user.id)}>✅ Approve</button>
//     </div>
//   );
// };

// export default UserCard;
import React from "react";

const UserCard = ({ user, onApprove }) => {
  return (
    <div className="user-card">
      <div>
        <strong>{user?.name || "Unknown"}</strong> ({user?.email || "N/A"}) 📧
      </div>
      <button onClick={() => onApprove(user?.id)}>✅ Approve</button>
    </div>
  );
};

export default UserCard;
