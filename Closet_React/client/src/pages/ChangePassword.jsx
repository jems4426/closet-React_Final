import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, Eye, EyeOff, ShieldCheck, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: Password
  const [email, setEmail] = useState(user?.email || '');
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendEmailCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:4000/api/password/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`Verification code sent to ${email}`);
        setStep(2);
      } else {
        toast.error(data.message || 'Failed to send verification code');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:4000/api/password/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Code verified successfully!');
        setStep(3);
      } else {
        toast.error(data.message || 'Invalid verification code');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/password/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Password changed successfully!');
        navigate('/profile');
      } else {
        toast.error(data.message || 'Failed to change password');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
  };

  const getPasswordStrength = (password) => {
    if (password.length >= 10) return { text: "Strong", color: "text-green-600" };
    if (password.length >= 6) return { text: "Medium", color: "text-yellow-600" };
    return { text: "Weak", color: "text-red-600" };
  };

  const resendCode = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/password/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        toast.success('New verification code sent!');
      } else {
        toast.error('Failed to resend code');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-fashion-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <button 
          onClick={() => navigate('/profile')} 
          className="flex items-center text-gray-600 hover:text-rose-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Back to Profile
        </button>

        <div className="rounded-3xl border border-white/40 bg-white/30 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              {step === 1 && <Mail className="h-12 w-12 text-rose-600" />}
              {step === 2 && <ShieldCheck className="h-12 w-12 text-rose-600" />}
              {step === 3 && <Lock className="h-12 w-12 text-rose-600" />}
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {step === 1 && "Verify Your Email"}
              {step === 2 && "Enter Verification Code"}
              {step === 3 && "Set New Password"}
            </h1>
            <p className="text-gray-600 text-sm mt-2">
              {step === 1 && "We'll send a verification code to your email"}
              {step === 2 && "Enter the 6-digit code sent to your email"}
              {step === 3 && "Create a strong new password"}
            </p>
          </div>

          {/* Step 1: Email Verification */}
          {step === 1 && (
            <form onSubmit={sendEmailCode} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="h-5 w-5 text-gray-400 absolute top-3 left-3" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white/50 backdrop-blur"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Sending Code...' : 'Send Verification Code'}
              </button>
            </form>
          )}

          {/* Step 2: Code Verification */}
          {step === 2 && (
            <form onSubmit={verifyCode} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white/50 backdrop-blur text-center text-lg font-mono"
                />
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Didn't receive the code?
                </p>
                <button
                  type="button"
                  onClick={resendCode}
                  className="text-rose-600 hover:text-rose-700 font-medium text-sm"
                >
                  Resend Code
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-lg transition-all"
              >
                Verify Code
              </button>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={changePassword} className="space-y-6">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-500 mr-2" />
                <span className="text-green-600 font-medium">Email Verified!</span>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="h-5 w-5 text-gray-400 absolute top-3 left-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white/50 backdrop-blur"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {newPassword && (
                  <p className={`text-xs mt-1 font-medium ${getPasswordStrength(newPassword).color}`}>
                    Password Strength: {getPasswordStrength(newPassword).text}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="h-5 w-5 text-gray-400 absolute top-3 left-3" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white/50 backdrop-blur"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-lg transition-all"
              >
                Change Password
              </button>
            </form>
          )}

          {/* Progress Indicator */}
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              {[1, 2, 3].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`w-3 h-3 rounded-full transition-all ${
                    stepNumber <= step ? 'bg-rose-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;