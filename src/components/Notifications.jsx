import React from "react";
import { useNavigate } from "react-router-dom";

const notifications = [
  { id: 1, type: "like", message: "John liked your post", targetId: "123" },
  { id: 2, type: "view", message: "Sarah viewed your profile", targetId: "45" },
  { id: 3, type: "cart", message: "You added a new item to cart" },
  { id: 4, type: "comment", message: "Mike commented on your post", targetId: "99" },
  { id: 5, type: "system", message: "Your subscription will expire soon" },
];

const Notifications = () => {
  const navigate = useNavigate();

  const handleClick = (n) => {
    switch (n.type) {
      case "like":
      case "comment":
        navigate(`/post/${n.targetId}`);
        break;
      case "view":
        navigate(`/profile/${n.targetId}`);
        break;
      case "cart":
        navigate(`/cart`);
        break;
      case "system":
        navigate(`/settings`);
        break;
      default:
        console.log("Unknown notification type");
    }
  };

  return (
    <div className="max-w-md p-4 mx-auto mt-8">
      <h2 className="mb-4 text-2xl font-bold">Notifications</h2>
      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => handleClick(n)}
            className="p-3 transition rounded-lg shadow cursor-pointer hover:bg-gray-100"
          >
            {n.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
