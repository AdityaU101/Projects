import { FC } from "react";

const Notification: FC<NotificationData> = ({ sentiment, label, message, icon }) => {
  let colors = "";
  switch (sentiment) {
    case "positive":
      colors = "bg-green-200 text-green-700";
      break;
    case "negative":
      colors = "bg-red-200 text-red-700";
      break;
    case "neutral":
      colors = "bg-yellow-200 text-yellow-700";
      break;
  }

  return (
    <div className="absolute left-[50%] top-4 translate-x-[-50%] rounded border border-gray-300 bg-white text-lg shadow-lg">
      <div className={`flex items-center gap-4 px-4 py-2 font-bold ${colors}`}>
        <i className={`fa-solid ${icon}`}></i>
        <span>{label}</span>
      </div>
      <div className="p-4">
        <p>{message}</p>
      </div>
    </div>
  );
};

export default Notification;
