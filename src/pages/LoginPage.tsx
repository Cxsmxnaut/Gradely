import React, { useState } from 'react';
import { Eye, EyeOff, GraduationCap } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Checkbox } from '@/app/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function LoginPage() {
  const [districtUrl, setDistrictUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!districtUrl || !username || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    // Basic URL validation for Edupoint format
    if (!districtUrl.includes('.edupoint.com') && !districtUrl.includes('.edupoint.org')) {
      toast.error('Please enter a valid Edupoint district URL (e.g., ca-pleas.edupoint.com)');
      return;
    }

    setLoading(true);
    
    try {
      const success = await login(districtUrl, username, password, remember);
      
      if (!success) {
        toast.error('Invalid credentials or district URL');
      } else {
        toast.success('Welcome back!');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-neutral-950 dark:to-neutral-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary text-white mb-4">
            <GraduationCap className="size-8" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Gradely
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Track your academic journey
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 border border-neutral-200 dark:border-neutral-800">
          <h2 className="text-2xl font-semibold mb-6 text-neutral-900 dark:text-white">
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* District URL */}
            <div className="space-y-2">
              <Label htmlFor="districtUrl">District URL</Label>
              <Input
                id="districtUrl"
                type="text"
                placeholder="ca-pleas.edupoint.com"
                value={districtUrl}
                onChange={(e) => setDistrictUrl(e.target.value)}
                className="h-11"
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                >
                  {showPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(checked) => setRemember(checked as boolean)}
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer"
                >
                  Remember me
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <Button type="submit" disabled={loading} className="w-full h-11 text-base">
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Demo Credentials:
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              District URL: <span className="font-mono font-semibold">ca-pleas.edupoint.com</span>
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Username: <span className="font-mono font-semibold">student123</span>
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Password: <span className="font-mono font-semibold">password</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-neutral-600 dark:text-neutral-400 mt-6">
          © 2026 Gradely. All rights reserved.
        </p>
      </div>
    </div>
  );
}
