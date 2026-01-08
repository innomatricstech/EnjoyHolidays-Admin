import React, { useState } from 'react';
import {
  Container, Paper, TextField, Button, Typography,
  Box, Alert, CircularProgress, InputAdornment, IconButton,
  FormControlLabel, Checkbox
} from '@mui/material';
import { Visibility, VisibilityOff, Lock, Person, Login } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// 🔥 IMPORT Firestore functions
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; 
import { auth, db } from "../firebase/firebase";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    rememberMe: false 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Auth Login
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Extract name from email (you can modify this logic as needed)
      const email = user.email;
      const name = email.split('@')[0]; // Use the part before @ as name
      const displayName = name.charAt(0).toUpperCase() + name.slice(1); // Capitalize first letter

      // 2. 🔥 SAVE TO DATABASE (Firestore)
      await setDoc(doc(db, "admin_users", user.uid), {
        email: user.email,
        name: displayName,
        lastLogin: serverTimestamp(),
        role: "admin"
      }, { merge: true });

      // 3. Store Session
      const token = await user.getIdToken();
      const storage = formData.rememberMe ? localStorage : sessionStorage;
      storage.setItem('adminToken', token);
      storage.setItem('adminUser', JSON.stringify({ 
        email: user.email, 
        uid: user.uid,
        name: displayName 
      }));

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={10} sx={{ p: 4, width: '100%', borderRadius: 3 }}>
        <Box textAlign="center" mb={4}>
          <Lock sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" fontWeight="bold">Admin Login</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth label="Email" name="email" value={formData.email}
            onChange={handleChange} disabled={loading} margin="normal"
            InputProps={{ startAdornment: (<InputAdornment position="start"><Person /></InputAdornment>) }}
          />
          <TextField
            fullWidth label="Password" name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password} onChange={handleChange}
            disabled={loading} margin="normal"
            InputProps={{
              startAdornment: (<InputAdornment position="start"><Lock /></InputAdornment>),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <FormControlLabel
            control={<Checkbox name="rememberMe" checked={formData.rememberMe} onChange={handleChange} />}
            label="Remember me"
          />
          <Button
            type="submit" fullWidth variant="contained" disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Login />}
            sx={{ py: 1.5, borderRadius: 2, mt: 2 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default AdminLogin;