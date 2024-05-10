import Avatar from "./Avatar";

const OnlinePeople = ({ properOnlinePeople, selectedUserId, setSelectedUserId }) => {
  return (
    <>
      {Object.keys(properOnlinePeople).length > 0 &&
        Object.keys(properOnlinePeople).map((userId) => (
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
                isOnline={true}
                id={userId}
                username={properOnlinePeople[userId]}
              ></Avatar>
              <span className="text-gray-800">
                {properOnlinePeople[userId]}
              </span>
            </div>
          </div>
        ))}
    </>
  );
}
export default OnlinePeople;