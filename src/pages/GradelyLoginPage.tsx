import React, { useState, useRef } from 'react';
import { Eye, EyeOff, Mail, User, Facebook, Github, Linkedin } from 'lucide-react';
import { useGradelyAuth } from '@/contexts/GradelyAuthContext';
import { toast } from 'sonner';

export function GradelyLoginPage() {
  const { login, signup } = useGradelyAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
    dateOfBirth: '',
    phoneNumber: ''
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleMode = () => {
    const container = containerRef.current;
    if (container) {
      if (isLogin) {
        container.classList.add('active');
      } else {
        container.classList.remove('active');
      }
    }
    setIsLogin(!isLogin);
    setFormData({
      username: '',
      email: '',
      password: '',
      displayName: '',
      dateOfBirth: '',
      phoneNumber: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      if (!formData.username || !formData.password) {
        toast.error('Please fill in all fields');
        return;
      }
    } else {
      if (!formData.username || !formData.displayName || !formData.email || !formData.password || !formData.dateOfBirth) {
        toast.error('Please fill in all fields');
        return;
      }
      
      // Age validation - must be 13 or older
      const birthDate = new Date(formData.dateOfBirth);
      const minAgeDate = new Date(Date.now() - 13 * 365 * 24 * 60 * 60 * 1000);
      if (birthDate > minAgeDate) {
        toast.error('You must be at least 13 years old to use Gradely');
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        // For login, use username as email since that's what the form expects
        await login(formData.username, formData.password);
        toast.success('Login successful! Redirecting...');
      } else {
        await signup(
          formData.email,
          formData.password,
          formData.displayName,
          formData.dateOfBirth,
          formData.phoneNumber
        );
        toast.success('Account created successfully! Please check your email to verify.');
      }
      setTimeout(() => (window.location.href = '/dashboard'), 1000);
    } catch (err: any) {
      toast.error(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-[#e2e2e2] to-[#c9d6ff]">
        <div ref={containerRef} className="container">
          {/* Login Form */}
          <div className="form-box login">
            <form onSubmit={handleSubmit}>
              <h1>Login</h1>
              <div className="input-box">
                <input
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={e => handleInputChange('username', e.target.value)}
                  required
                />
                <User className="bx bxs-user" />
              </div>
              <div className="input-box">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
              <div className="forgot-link">
                <a href="#">Forgot Password?</a>
              </div>
              
              {/* Legal Disclaimer */}
              <div className="legal-disclaimer">
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  Gradely is not affiliated with any school or educational institution.
                  <br />
                  By logging in, you confirm you are at least 13 years old.
                </p>
              </div>
              
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
              <p>or login with social platforms</p>
              <div className="social-icons">
                <a href="#"><Mail className="bx bxl-google" /></a>
                <a href="#"><Facebook className="bx bxl-facebook" /></a>
                <a href="#"><Github className="bx bxl-github" /></a>
                <a href="#"><Linkedin className="bx bxl-linkedin" /></a>
              </div>
            </form>
          </div>

          {/* Register Form */}
          <div className="form-box register">
            <form onSubmit={handleSubmit}>
              <h1>Registration</h1>
              <div className="input-box">
                <input
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={e => handleInputChange('username', e.target.value)}
                  required
                />
                <User className="bx bxs-user" />
              </div>
              <div className="input-box">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.displayName}
                  onChange={e => handleInputChange('displayName', e.target.value)}
                  required
                />
                <User className="bx bxs-user" />
              </div>
              <div className="input-box">
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  required
                />
                <Mail className="bx bxs-envelope" />
              </div>
              <div className="input-box">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
              
              {/* Age Verification */}
              <div className="input-box">
                <input
                  type="date"
                  placeholder="Date of Birth"
                  value={formData.dateOfBirth}
                  onChange={e => handleInputChange('dateOfBirth', e.target.value)}
                  required
                  max={new Date(Date.now() - 13 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
                <User className="bx bxs-user" />
              </div>
              
              {/* Legal Disclaimer */}
              <div className="legal-disclaimer">
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  Gradely is not affiliated with any school or educational institution.
                  <br />
                  By registering, you confirm you are at least 13 years old and agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
              
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Creating Account...' : 'Register'}
              </button>
              <p>or register with social platforms</p>
              <div className="social-icons">
                <a href="#"><Mail className="bx bxl-google" /></a>
                <a href="#"><Facebook className="bx bxl-facebook" /></a>
                <a href="#"><Github className="bx bxl-github" /></a>
                <a href="#"><Linkedin className="bx bxl-linkedin" /></a>
              </div>
            </form>
          </div>

          {/* Toggle Box */}
          <div className="toggle-box">
            <div className="toggle-panel toggle-left">
              <h1>Hello, Welcome!</h1>
              <p>Don't have an account?</p>
              <button className="btn register-btn" onClick={toggleMode}>Register</button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Welcome Back!</h1>
              <p>Already have an account?</p>
              <button className="btn login-btn" onClick={toggleMode}>Login</button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: "Poppins", sans-serif;
          text-decoration: none;
          list-style: none;
        }

        .min-h-screen {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(90deg, #e2e2e2, #c9d6ff);
        }

        .dark .min-h-screen {
          background: linear-gradient(90deg, #1a1a1a, #2d2d2d);
        }

        .container {
          position: relative;
          width: 95%;
          max-width: 1000px;
          height: 650px;
          background: #fff;
          margin: 20px auto;
          border-radius: 30px;
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }

        @media screen and (max-width: 768px) {
          .container {
            width: 95%;
            height: calc(100vh - 40px);
            max-height: 700px;
            margin: 20px auto;
            border-radius: 20px;
          }
        }

        .dark .container {
          background: #1f1f1f;
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
        }

        .container h1 {
          font-size: clamp(28px, 5vw, 36px);
          margin: -10px 0;
        }

        .dark .container h1 {
          color: #fff;
        }

        .container p {
          font-size: 14.5px;
          margin: 15px 0;
        }

        .dark .container p {
          color: #ccc;
        }

        form {
          width: 100%;
        }

        .form-box {
          position: absolute;
          right: 0;
          width: 50%;
          height: 100%;
          background: #fff;
          display: flex;
          align-items: center;
          color: #333;
          text-align: center;
          padding: clamp(20px, 4vw, 40px);
          z-index: 1;
          transition: 0.6s ease-in-out 1.2s, visibility 0s 1s;
        }

        @media screen and (max-width: 768px) {
          .form-box {
            padding: 20px;
          }
        }

        .dark .form-box {
          background: #1f1f1f;
          color: #fff;
        }

        .container.active .form-box {
          right: 50%;
        }

        .form-box.register {
          visibility: hidden;
        }

        .container.active .form-box.register {
          visibility: visible;
        }

        .input-box {
          position: relative;
          margin: 30px 0;
        }

        .input-box input {
          width: 100%;
          padding: 13px 50px 13px 20px;
          background: #eee;
          border-radius: 8px;
          border: none;
          outline: none;
          font-size: clamp(14px, 2.5vw, 16px);
          color: #333;
          font-weight: 500;
        }

        @media screen and (max-width: 400px) {
          .input-box input {
            padding: 12px 45px 12px 15px;
            font-size: 14px;
          }
        }

        .dark .input-box input {
          background: #2d2d2d;
          color: #fff;
        }

        .input-box input::placeholder {
          color: #888;
          font-weight: 400;
        }

        .dark .input-box input::placeholder {
          color: #999;
        }

        .input-box svg {
          position: absolute;
          right: 40px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 20px;
          color: #333;
        }

        .dark .input-box svg {
          color: #fff;
        }

        .input-box button {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: #333;
          cursor: pointer;
          padding: 0;
          font-size: 20px;
        }

        .dark .input-box button {
          color: #fff;
        }

        .forgot-link {
          margin: -15px 0 15px;
        }

        .forgot-link a {
          font-size: 14.5px;
          color: #333;
        }

        .dark .forgot-link a {
          color: #ccc;
        }

        .btn {
          width: 100%;
          height: 48px;
          background: #7494ec;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          border: none;
          cursor: pointer;
          font-size: 16px;
          color: #fff;
          font-weight: 600;
        }

        .social-icons {
          display: flex;
          justify-content: center;
        }

        .social-icons a {
          display: inline-flex;
          padding: 10px;
          border: 2px solid #ccc;
          border-radius: 8px;
          font-size: 24px;
          color: #333;
          margin: 0 8px;
        }

        .dark .social-icons a {
          border-color: #555;
          color: #fff;
        }

        .toggle-box {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .toggle-box::before {
          content: "";
          position: absolute;
          left: -250%;
          width: 300%;
          height: 100%;
          background: #7494ec;
          border-radius: 150px;
          z-index: 2;
          transition: 1.8s ease-in-out;
        }

        .container.active .toggle-box::before {
          left: 50%;
        }

        .toggle-panel {
          position: absolute;
          width: 50%;
          height: 100%;
          color: #fff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 2;
          transition: 0.6s ease-in-out;
        }

        .toggle-panel.toggle-left {
          left: 0;
          transition-delay: 1.2s;
        }

        .container.active .toggle-panel.toggle-left {
          left: -50%;
          transition-delay: 0.6s;
        }

        .toggle-panel.toggle-right {
          right: -50%;
          transition-delay: 0.6s;
        }

        .container.active .toggle-panel.toggle-right {
          right: 0;
          transition-delay: 1.2s;
        }

        .toggle-panel p {
          margin-bottom: 20px;
        }

        .toggle-panel .btn {
          width: 160px;
          height: 46px;
          background: transparent;
          border: 2px solid #fff;
          box-shadow: none;
        }

        @media screen and (max-width: 650px) {
          .container {
            height: calc(100vh - 40px);
          }

          .form-box {
            bottom: 0;
            width: 100%;
            height: 70%;
          }

          .container.active .form-box {
            right: 0;
            bottom: 30%;
          }

          .toggle-box::before {
            left: 0;
            top: -270%;
            width: 100%;
            height: 300%;
            border-radius: 20vw;
          }

          .container.active .toggle-box::before {
            left: 0;
            top: 70%;
          }

          .container.active .toggle-panel.toggle-left {
            left: 0;
            top: -30%;
          }

          .toggle-panel {
            width: 100%;
            height: 30%;
          }

          .toggle-panel.toggle-left {
            top: 0;
          }

          .toggle-panel.toggle-right {
            right: 0;
            bottom: -30%;
          }

          .container.active .toggle-panel.toggle-right {
            bottom: 0;
          }
        }

        @media screen and (max-width: 400px) {
          .form-box {
            padding: 20px;
          }

          .toggle-panel h1 {
            font-size: 30px;
          }
        }
      `}</style>
    </>
  );
}
