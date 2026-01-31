import React, { useState } from 'react';
import { Eye, EyeOff, GraduationCap, Info } from 'lucide-react';
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
  const [showDomainHelper, setShowDomainHelper] = useState(false);
  const [showSignUpPopup, setShowSignUpPopup] = useState(false);
  const [showForgotPasswordPopup, setShowForgotPasswordPopup] = useState(false);
  const [showGoogleContent, setShowGoogleContent] = useState(false);

  // Function to extract and shorten domain from full URL
  const shortenDomainUrl = (url: string): string => {
    try {
      // Remove protocol if present
      let cleanUrl = url.replace(/^https?:\/\//, '');
      
      // Remove any path after the domain
      const domainMatch = cleanUrl.match(/^([^\/]+)/);
      if (domainMatch) {
        cleanUrl = domainMatch[1];
      }
      
      // Remove common student portal paths
      const pathsToRemove = [
        '/PXP2_Login_Student.aspx',
        '/PXP_Login_Student.aspx',
        '/Home/Portal',
        '/StudentPortal',
        '/Portal',
        '/Home',
      ];
      
      pathsToRemove.forEach(path => {
        cleanUrl = cleanUrl.replace(path, '');
      });
      
      // Remove any remaining trailing slashes
      cleanUrl = cleanUrl.replace(/\/+$/, '');
      
      // Return just the domain without protocol
      return cleanUrl;
    } catch (error) {
      console.error('Error shortening URL:', error);
      return url; // Return original URL if shortening fails
    }
  };

  // Handle URL input with auto-shortening
  const handleUrlChange = (value: string) => {
    // If it looks like a full URL, auto-shorten it
    if (value.includes('http') && value.includes('/')) {
      const shortened = shortenDomainUrl(value);
      setDistrictUrl(shortened);
    } else {
      setDistrictUrl(value);
    }
  };
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
            Never used Gradely before?{" "}
            <button
              onClick={() => setShowSignUpPopup(true)}
              className="text-[#60a6fa] hover:text-[#4d8ce8] underline"
            >
              Sign up
            </button>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="districtUrl">District URL</Label>
                <button
                  type="button"
                  onClick={() => setShowDomainHelper(!showDomainHelper)}
                  className="text-xs text-[#60a6fa] hover:text-[#4d8ce8] underline flex items-center gap-1"
                >
                  <Info className="size-3" />
                  Help me find my domain
                </button>
              </div>
              
              {showDomainHelper && (
                <div className="p-3 bg-[#60a6fa]/10 dark:bg-[#60a6fa]/10 rounded-lg border border-[#60a6fa]/30 dark:border-[#60a6fa]/30 mb-3">
                  <p className="text-sm text-[#60a6fa] dark:text-[#60a6fa] mb-2">
                    Paste any link from your StudentVUE website below, and it will automatically shorten it and fill the domain.
                  </p>
                  <Input
                    type="text"
                    placeholder="Paste your full StudentVUE URL here..."
                    onChange={(e) => {
                      const fullUrl = e.target.value;
                      if (fullUrl.includes('http') && fullUrl.includes('/')) {
                        const shortened = shortenDomainUrl(fullUrl);
                        setDistrictUrl(shortened);
                        toast.success('Domain shortened successfully!');
                      }
                    }}
                    className="h-9 text-xs"
                  />
                </div>
              )}
              
              <Input
                id="districtUrl"
                type="text"
                placeholder="[your-district]-psv.edupoint.com"
                value={districtUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
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
                onClick={() => setShowForgotPasswordPopup(true)}
                className="text-sm text-[#60a6fa] hover:text-[#4d8ce8] underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <Button type="submit" disabled={loading} className="w-full h-11 text-base">
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>

        {/* Sign Up Popup */}
        {showSignUpPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  Sign up for Gradely
                </h2>
                <button
                  onClick={() => setShowSignUpPopup(false)}
                  className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                >
                  ×
                </button>
              </div>

              {/* How do you sign in to StudentVUE? */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-white">
                  How do you sign in to StudentVUE?
                </h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12"
                    onClick={() => setShowGoogleContent(!showGoogleContent)}
                  >
                    With Google
                  </Button>
                  
                  {/* Google content that expands when clicked */}
                  {showGoogleContent && (
                    <div className="ml-4 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900">
                      <h4 className="font-medium mb-2 text-red-800 dark:text-red-200">Google Sign-In Not Supported</h4>
                      <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                        Unfortunately Gradely doesn't support Google Sign-In. You'll need to create a password for StudentVUE that Gradely can sign you in with instead. You'll still be able to use Sign in with Google with StudentVUE afterwards.
                      </p>
                      
                      <h4 className="font-medium mb-2 text-red-800 dark:text-red-200">Why isn't this supported?</h4>
                      <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                        Gradely needs direct access to your StudentVUE credentials to fetch your grades and calculate GPA. Google Sign-In doesn't provide the necessary permissions for third-party applications to access StudentVUE data.
                      </p>
                      
                      <h4 className="font-medium mb-2 text-red-800 dark:text-red-200">What should I do?</h4>
                      <ol className="text-sm text-red-700 dark:text-red-300 space-y-1 list-decimal list-inside">
                        <li>Go to your district's StudentVUE login page</li>
                        <li>Click "Forgot Password" or "Create Account"</li>
                        <li>Create a new password for your StudentVUE account</li>
                        <li>Use that password to sign in to Gradely</li>
                      </ol>
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12"
                    onClick={() => {
                      setShowSignUpPopup(false);
                      toast.info("You can just sign in here");
                    }}
                  >
                    With a password
                  </Button>
                </div>
              </div>

              {/* Already used Gradely? */}
              <div className="mb-6 p-4 bg-[#60a6fa]/10 dark:bg-[#60a6fa]/10 rounded-lg">
                <p className="text-sm text-[#60a6fa] dark:text-[#60a6fa]">
                  Already used Gradely?{" "}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSignUpPopup(false)}
                    className="text-[#60a6fa] hover:text-[#4d8ce8] underline h-6 px-2"
                  >
                    Log in
                  </Button>
                </p>
              </div>

              {/* Trademark notice */}
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                StudentVUE is a registered trademark of Edupoint Educational Systems LLC. Gradely is not affiliated with or endorsed by Edupoint Educational Systems LLC.
              </div>
            </div>
          </div>
        )}

        {/* Forgot Password Popup */}
        {showForgotPasswordPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  Password Reset Help
                </h2>
                <button
                  onClick={() => setShowForgotPasswordPopup(false)}
                  className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                >
                  ×
                </button>
              </div>

              {/* How do you sign in to StudentVUE? */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-white">
                  How do you sign in to StudentVUE?
                </h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12"
                    onClick={() => {
                      // Don't close popup, just show content
                    }}
                  >
                    With Google
                  </Button>
                  
                  {/* Password Reset Help inside With Google section */}
                  <div className="ml-4 p-4 bg-[#60a6fa]/10 dark:bg-[#60a6fa]/10 rounded-lg border border-[#60a6fa]/30 dark:border-[#60a6fa]/30">
                    <h4 className="font-medium mb-2 text-neutral-900 dark:text-white">Create a password</h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                      Gradely isn't able to use Sign in with Google to sign you in. You'll need to create a password for StudentVUE that Gradely can sign you in with instead. You'll still be able to use Sign in with Google with StudentVUE afterwards.
                    </p>
                    
                    <h4 className="font-medium mb-2 text-neutral-900 dark:text-white">Password Reset Help</h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                      The exact link to reset your password depends on your district. If you don't know how to find it, try these steps:
                    </p>
                    
                    {/* Find automatically */}
                    <div className="mb-4">
                      <h5 className="text-sm font-medium mb-2 text-neutral-900 dark:text-white">Find automatically</h5>
                      <Input
                        placeholder="Paste any link to your StudentVUE page"
                        onChange={(e) => {
                          const url = e.target.value;
                          if (url.includes('http') && url.includes('/')) {
                            toast.success("District detected! You can use this domain for login.");
                          }
                        }}
                        className="mb-2"
                      />
                    </div>

                    {/* Find manually */}
                    <div>
                      <h5 className="text-sm font-medium mb-2 text-neutral-900 dark:text-white">Find manually</h5>
                      <ol className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1 list-decimal list-inside">
                        <li>Go to your district's StudentVUE login page (may need to log out temporarily).</li>
                        <li>Open the 'More Options' dropdown.</li>
                        <li>Click 'Forgot Password'.</li>
                      </ol>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12"
                    onClick={() => {
                      setShowForgotPasswordPopup(false);
                      toast.info("You can just sign in here");
                    }}
                  >
                    With a password
                  </Button>
                </div>
              </div>

              {/* Already used Gradely? */}
              <div className="mb-6 p-4 bg-[#60a6fa]/10 dark:bg-[#60a6fa]/10 rounded-lg">
                <p className="text-sm text-[#60a6fa] dark:text-[#60a6fa]">
                  Already used Gradely? <strong>Log in</strong>
                </p>
              </div>

              {/* Trademark notice */}
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                StudentVUE is a registered trademark of Edupoint Educational Systems LLC. GradeCompass is not affiliated with or endorsed by Edupoint Educational Systems LLC.
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-sm text-neutral-600 dark:text-neutral-400 mt-6">
          © 2026 Gradely. All rights reserved.
        </p>
      </div>
    </div>
  );
}
