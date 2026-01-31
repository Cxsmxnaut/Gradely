import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { GraduationCap, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';

interface GradelyUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  createdAt: string;
  lastLogin: string;
}

export function GradelyLoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    displayName: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.username || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }

    if (!isLogin && !formData.displayName) {
      setError('Display name is required for account creation');
      return false;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        await handleLogin();
      } else {
        await handleSignup();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    // Get existing users from localStorage
    const existingUsers = JSON.parse(localStorage.getItem('gradely_users') || '{}');
    
    // Find user by username or email
    const user = Object.values(existingUsers).find((u: any) => 
      u.username === formData.username || u.email === formData.email
    );

    if (!user) {
      throw new Error('Invalid username/email or password');
    }

    // In a real app, we'd verify password hash
    // For now, we'll just check if password exists (simplified)
    const storedUser = user as GradelyUser;
    
    // Store current session
    const session = {
      userId: storedUser.id,
      username: storedUser.username,
      email: storedUser.email,
      displayName: storedUser.displayName,
      loginTime: new Date().toISOString(),
      isGradelyUser: true
    };

    localStorage.setItem('gradely_session', JSON.stringify(session));
    localStorage.setItem('gradely_current_user', JSON.stringify(storedUser));

    setSuccess('Login successful! Redirecting...');
    
    // Redirect to dashboard after successful login
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1000);
  };

  const handleSignup = async () => {
    // Get existing users
    const existingUsers = JSON.parse(localStorage.getItem('gradely_users') || '{}');
    
    // Check if username or email already exists
    const userExists = Object.values(existingUsers).some((u: any) => 
      u.username === formData.username || u.email === formData.email
    );

    if (userExists) {
      throw new Error('Username or email already exists');
    }

    // Create new user
    const newUser: GradelyUser = {
      id: 'gradely_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      email: formData.email,
      username: formData.username,
      displayName: formData.displayName,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    // Store user (in a real app, we'd hash the password)
    existingUsers[newUser.id] = newUser;
    localStorage.setItem('gradely_users', JSON.stringify(existingUsers));

    // Create session
    const session = {
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
      displayName: newUser.displayName,
      loginTime: new Date().toISOString(),
      isGradelyUser: true
    };

    localStorage.setItem('gradely_session', JSON.stringify(session));
    localStorage.setItem('gradely_current_user', JSON.stringify(newUser));

    setSuccess('Account created successfully! Redirecting...');
    
    // Redirect to dashboard after successful signup
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1000);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFormData({
      email: '',
      username: '',
      password: '',
      displayName: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-blue-600/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="size-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Gradely
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            {isLogin ? 'Welcome back to Gradely' : 'Create your Gradely account'}
          </p>
        </div>

        {/* Login/Signup Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isLogin ? <LogIn className="size-5" /> : <UserPlus className="size-5" />}
              {isLogin ? 'Sign In' : 'Sign Up'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              {/* Username */}
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Choose a username"
                  required
                />
              </div>

              {/* Display Name (only for signup) */}
              {!isLogin && (
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>
              )}

              {/* Password */}
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
              </div>

              {/* Confirm Password (only for signup) */}
              {!isLogin && (
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Confirm your password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Success Message */}
              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  'Processing...'
                ) : (
                  <>
                    {isLogin ? <LogIn className="size-4 mr-2" /> : <UserPlus className="size-4 mr-2" />}
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </>
                )}
              </Button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <Button
                  variant="link"
                  className="ml-1 p-0 h-auto font-normal"
                  onClick={toggleMode}
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* StudentVUE Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Want to use StudentVUE instead?
          </p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => window.location.href = '/login'}
          >
            Login with StudentVUE
          </Button>
        </div>
      </div>
    </div>
  );
}
