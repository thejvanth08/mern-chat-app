const Logout = ({user, logout}) => {
  return (
    <div className="p-2 text-center flex justify-center items-center">
      <span className="mr-2 text-sm text-gray-600 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-6 h-6"
        >
          <path
            fill-rule="evenodd"
            d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
            clip-rule="evenodd"
          />
        </svg>
        {user}
      </span>
      <button
        onClick={logout}
        className="text-sm bg-blue-100 px-3.5 py-2 text-gray-500 border rounded-sm"
      >
        logout
      </button>
    </div>
  );
}
export default Logout;