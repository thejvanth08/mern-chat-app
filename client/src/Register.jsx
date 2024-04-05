import { useState } from "react";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form
        action="http://localhost:5000/register"
        className="w-64 mx-auto mb-12"
        method="POST"
      >
        <input
          value={username}
          name="username"
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          placeholder="username"
          required
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <input
          value={password}
          name="password"
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="password"
          required
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <button className="bg-blue-500 text-white block w-full rounded-sm">
          Register
        </button>
      </form>
    </div>
  );
}
export default Register;