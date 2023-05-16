import React, { useState } from 'react';
import './App.css';
import FileUploader from './FileUploader';
import Login from './Login';

function App() {
  // Declare a state variable to hold the authentication status
  const [authenticated, setAuthenticated] = useState(false);

  // Function to handle successful login
  const handleLogin = () => {
    setAuthenticated(true);
  };

  return (
    <div className="App">
      {/* Render Login only if not authenticated */}
      {!authenticated && <Login onLogin={handleLogin} />}
      {/* Render FileUploader only if authenticated */}
      {authenticated && <FileUploader />}
    </div>
  );
}

export default App;
