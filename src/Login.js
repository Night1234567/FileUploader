import React, { useState } from 'react';

function Login(props) {
  // Declare state variables to hold email and password
  const [username, setUser] = useState('');
  const [password, setPassword] = useState('');

const handleLogin = (event) => {
    event.preventDefault();
    // Check if email and password are valid
    // In this example, we assume that the email and password are hardcoded
    if (username === 'user' && password === 'password123') {
      // Call onLogin prop to update authentication status in App component
      props.onLogin();
    } else {
      alert('Invalid email or password');
    }
  };
  

  // Render the login form
  return (
    <div className="grid h-screen place-items-center">
      <form onSubmit={handleLogin}>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          username:
          <input type="username" value={username} onChange={(event) => setUser(event.target.value)} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Password:
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <button type="submit" className="bg-blue-500 rounded text-white px-4 py-2 hover:bg-blue-700">Login</button>
      </form>
    </div>
  );
}

export default Login;
