import Avatar from "./Avatar";

const OfflinePeople = ({ offlinePeople, selectedUserId, setSelectedUserId }) => {
  return (
    <>
      {Object.keys(offlinePeople).length > 0 &&
        Object.keys(offlinePeople).map((userId) => (
          <div
            key={userId}
            onClick={() => {
              setSelectedUserId(userId);
            }}
            className={`border-b border-gray-100 flex items-center gap-2 cursor-pointer ${
              userId === selectedUserId ? "bg-blue-100" : ""
            }`}
          >
            {userId === selectedUserId && (
              <div className="w-1 bg-blue-500 h-16 rounded-r-md"></div>
            )}
            <div className="flex gap-2 px-4 py-4">
              <Avatar
                isOnline={false}
                id={userId}
                username={offlinePeople[userId]}
              ></Avatar>
              <span className="text-gray-800">{offlinePeople[userId]}</span>
            </div>
          </div>
        ))}
    </>
  );
}
export default OfflinePeople;