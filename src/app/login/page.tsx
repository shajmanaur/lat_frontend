'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';
import { FaUser, FaLock, FaGlobe } from 'react-icons/fa';
import { authApi } from '@/services/api';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    
    try {
      const response = await authApi.login({ username, password });
      if (response.status === 'success' || response.status === true) {
        // The backend returns { status: 'success', data: { access_token, user } }
        const payload = response.data || response.response?.data;
        localStorage.setItem('token', payload.access_token);
        localStorage.setItem('user', JSON.stringify(payload.user));
        router.push('/');
      } else {
        const msg = Array.isArray(response.message)
          ? response.message.map((m: any) => m.constraints ? Object.values(m.constraints).join(', ') : m).join('\n')
          : response.message || 'Login failed';
        setErrorMsg(msg);
      }
    } catch (err: any) {
      const data = err.response?.data;
      const msg = Array.isArray(data?.message)
        ? data.message.map((m: any) => m.constraints ? Object.values(m.constraints).join(', ') : String(m)).join('\n')
        : data?.message || 'Login failed';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <FaGlobe className={styles.logoIcon} /> LAT Admin
          </div>
          <p className={styles.subtitle}>Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleLogin}>
          {errorMsg && (
            <div className={styles.errorMsg}>{errorMsg}</div>
          )}
          <div className={styles.formGroup}>
            <label className={styles.label}>Username</label>
            <div className={styles.inputWrapper}>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <FaUser className={styles.inputIcon} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <input 
                type="password" 
                className={styles.input} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FaLock className={styles.inputIcon} />
            </div>
          </div>

          <div className={styles.options}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" className={styles.checkbox} />
              Remember me
            </label>
            <a href="#" className={styles.forgotLink}>Forgot password?</a>
          </div>

          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
