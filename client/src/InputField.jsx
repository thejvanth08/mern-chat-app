const InputField = ({ selectedUserId, sendMessage, inputMsg, setInputMsg, sendFile }) => {
  return (
    <>
      {!!selectedUserId && (
        <form className="flex gap-2" onSubmit={sendMessage}>
          <input
            onChange={(e) => setInputMsg(e.target.value)}
            value={inputMsg}
            type="text"
            placeholder="type your message here"
            className="bg-white border p-2 flex-grow rounded-sm"
          />
          <label
            type="button"
            htmlFor="file"
            className="bg-blue-200 p-2 text-gray-600 rounded-sm border border-blue-300 cursor-pointer"
          >
            <input
              type="file"
              id="file"
              onChange={sendFile}
              className="hidden"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
              />
            </svg>
          </label>
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
              />
            </svg>
          </button>
        </form>
      )}
    </>
  );
}
export default InputField;