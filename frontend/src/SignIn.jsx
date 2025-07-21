import { useState } from 'react';

export default function SignIn({ onAuth, onSwitch, onGoHome }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch('http://localhost:5002/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) onAuth(username);
    else setError('Invalid credentials');
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Sign In</h2>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
        <button type="submit">Sign In</button>
        {error && <div className="auth-error">{error}</div>}
        <div className="auth-switch">Don't have an account? <span onClick={onSwitch}>Sign Up</span></div>
      </form>
      {onGoHome && (
        <button className="auth-gohome" style={{marginTop: '1rem'}} onClick={onGoHome}>Go to Homepage</button>
      )}
    </div>
  );
} 