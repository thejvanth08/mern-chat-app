import { useState, useContext } from "react";
import { UserContext } from "./UserContextProvider";
import axios from "axios";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const {setUser, setId} = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { id } = await axios.post("/register", {
      username,
      password,
    });
    setUser(username);
    setId(id);
    alert(username);
  }

  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form
        className="w-64 mx-auto mb-12"
        onSubmit={handleSubmit}
        method="post"
        // action="http://localhost:3000/register"
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
        <button type="submit" className="bg-blue-500 text-white block w-full rounded-sm">
          Register
        </button>
      </form>
    </div>
  );
}
export default Register;