const Avatar = ({ id, username, isOnline }) => {
  // diff colors for diff users
  const colors = ["bg-red-200", "bg-green-200", "bg-purple-200", "bg-blue-200", "bg-yellow-200", "bg-teal-200"];
  // userId is in hex value
  const userIdBase10 = parseInt(id, 16);
  // range -> 0 to colors.length - 1
  const colorIndex = userIdBase10 % colors.length;
  const color = colors[colorIndex];

  return (
    <div className={`${color} relative w-8 h-8 rounded-full flex justify-center items-center`}>
      <span>{username[0]}</span>
      <div className={`${isOnline ? "bg-green-300" : "bg-gray-300"} absolute w-3 h-3 bottom-0 right-0 rounded-full border border-white shadow-md`}></div>
    </div>
  );
}
export default Avatar;