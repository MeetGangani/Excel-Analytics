import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register, reset } from '../redux/slices/authSlice';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);

  const { name, email, password, confirmPassword } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user, isLoading, isError, isSuccess, message, registerSuccess } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message || 'Registration failed');
    }

    // Redirect when registered
    if (registerSuccess) {
      toast.success('Registration successful!');
      navigate('/dashboard');
    } else if (user && !registerSuccess) {
      // Just redirect without showing toast if user exists but not from a fresh registration
      navigate('/dashboard');
    }

    dispatch(reset());
  }, [user, isError, registerSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
    
    if (e.target.name === 'confirmPassword' || e.target.name === 'password') {
      setTimeout(() => {
        if (e.target.name === 'confirmPassword') {
          setPasswordMatch(e.target.value === password);
        } else {
          setPasswordMatch(confirmPassword === e.target.value);
        }
      }, 100);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setPasswordMatch(false);
      toast.error('Passwords do not match');
      return;
    }
    
    const userData = {
      name,
      email,
      password,
    };

    dispatch(register(userData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-white">
      {/* Main content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="flex flex-col md:flex-row-reverse">
          {/* Left side - Form */}
          <div className="w-full md:w-1/2 p-8 md:p-14">
            <div className="mb-6">
              {/* <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex items-center mb-5 justify-start"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none">
                    <path d="M4 13H10V19H4V13Z" className="fill-white" />
                    <path d="M4 5H10V11H4V5Z" className="fill-white opacity-70" />
                    <path d="M12 5H18V11H12V5Z" className="fill-white" />
                    <path d="M12 13H18V19H12V13Z" className="fill-white opacity-70" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold ml-3 text-gray-800">Excel Analytics</h1>
              </motion.div> */}
              
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-2xl font-bold text-gray-900 mb-1"
              >
                Create your account
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-gray-600"
              >
                Join our platform to unlock Excel insights
              </motion.p>
            </div>

            <motion.form 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              onSubmit={onSubmit} 
              className="space-y-4 text-left"
            >
              {isError && (
                <div className="bg-red-50 p-4 rounded-lg text-sm text-red-600 flex items-start">
                  <svg className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{message}</span>
                </div>
              )}
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="pl-12 w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="John Doe"
                    value={name}
                    onChange={onChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="pl-12 w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="you@example.com"
                    value={email}
                    onChange={onChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="pl-12 w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="••••••••"
                    value={password}
                    onChange={onChange}
                    minLength="6"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7A9.97 9.97 0 014.02 8.971m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    className={`pl-12 w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      passwordMatch ? 'border-gray-300' : 'border-red-500'
                    }`}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={onChange}
                    minLength="6"
                  />
                  {!passwordMatch && (
                    <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="show-password"
                  name="show-password"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  onChange={() => setShowPassword(!showPassword)}
                  checked={showPassword}
                />
                <label htmlFor="show-password" className="ml-2 block text-sm text-gray-700 text-left">
                  Show password
                </label>
              </div>

              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isLoading || !passwordMatch}
                  className="w-full flex justify-center items-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-all duration-200 text-sm font-medium"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      Create Account
                      <svg className="ml-2 -mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </motion.button>
              </div>
              
              <p className="text-center text-xs text-gray-500 mt-4">
                By creating an account, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
              </p>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </motion.form>
          </div>
          
          {/* Right side - Feature display */}
          <div className="hidden md:block md:w-1/2 bg-blue-600">
            <div className="h-full p-14 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="relative z-10"
              >
                <h2 className="text-white text-3xl font-bold mb-6">Join Our Platform Today</h2>
                <p className="text-blue-100 mb-8">Creating an account gives you access to powerful Excel analytics tools and features.</p>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                      <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Personalized Dashboard</h3>
                      <p className="text-blue-100 text-sm">Track your analytics and manage your Excel files in one place</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                      <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Save Your Progress</h3>
                      <p className="text-blue-100 text-sm">Save and revisit your analysis at any time</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                      <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Premium Features</h3>
                      <p className="text-blue-100 text-sm">Access advanced analytics and visualization tools</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
