const Avatar = ({ id, username }) => {
  // diff colors for diff users
  const colors = ["bg-red-200", "bg-green-200", "bg-purple-200", "bg-blue-200", "bg-yellow-200", "bg-teal-200"];
  // userId is in hex value
  const userIdBase10 = parseInt(id, 16);
  // range -> 0 to colors.length - 1
  const colorIndex = userIdBase10 % colors.length;
  const color = colors[colorIndex];

  return (
    <div className={`${color} w-8 h-8 rounded-full flex justify-center items-center`}>
      <span>{username[0]}</span>
    </div>
  );
}
export default Avatar;