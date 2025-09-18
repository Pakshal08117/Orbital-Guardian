import React, { useMemo, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import VerticalSolarSystem from "@/components/dashboard/VerticalSolarSystem";

const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Min 6 characters"),
});

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Min 6 characters"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Valid email required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [emailSent, setEmailSent] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const resetForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  // Reset forms when mode changes
  const handleModeChange = (newMode: "login" | "signup" | "reset") => {
    setMode(newMode);
    setEmailSent(null); // Clear email sent state
    setResetEmailSent(null); // Clear reset email state
    loginForm.reset();
    signupForm.reset();
    resetForm.reset();
  };

  // Resend verification email with improved error handling and feedback
  const handleResendEmail = async () => {
    if (!emailSent) return;
    
    toast({ 
      title: "Sending verification email", 
      description: "Please wait..." 
    });
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailSent,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?verified=true`
        }
      });
      
      if (error) {
        console.error("Email resend error:", error);
        toast({ 
          title: "Failed to resend", 
          description: error.message || "Please try again later", 
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Email sent!", 
          description: `Verification email sent again to ${emailSent}. Please check your inbox and spam folder.` 
        });
      }
    } catch (e) {
      console.error("Email resend exception:", e);
      toast({ 
        title: "Email service error", 
        description: "Unable to send verification email. Please try again later.", 
        variant: "destructive" 
      });
    }
  };
   
   const handleGoogleSignIn = async () => {
     try {
       // Log the attempt for debugging
       console.log("Attempting Google sign-in");
       
       const { error } = await supabase.auth.signInWithOAuth({
         provider: 'google',
         options: {
           redirectTo: `${window.location.origin}/auth?callback=google-auth`,
           queryParams: {
             access_type: 'offline',
             prompt: 'consent',
           }
         },
       });
       
       if (error) {
         console.error("Google sign-in error:", error);
         toast({ title: "Google sign-in failed", description: error.message, variant: "destructive" });
       } else {
         console.log("Google sign-in initiated successfully");
       }
     } catch (e) {
       console.error("Google auth error:", e);
       toast({ 
         title: "Authentication Error", 
         description: "Failed to connect to Google. Please try again later.", 
         variant: "destructive" 
       });
     }
   };
   
   const onForgotPasswordSubmit = async (values: ForgotPasswordFormValues) => {
     toast({ 
       title: "Processing request", 
       description: "Sending password reset email..." 
     });
     
     try {
       const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
         redirectTo: `${window.location.origin}/auth?callback=password-reset`,
       });
       
       if (error) {
         console.error("Password reset error:", error);
         toast({ 
           title: "Failed to send reset email", 
           description: error.message, 
           variant: "destructive" 
         });
         return;
       }
       
       setResetEmailSent(values.email);
       toast({ 
         title: "Reset email sent", 
         description: `Password reset instructions sent to ${values.email}. Please check your inbox and spam folder.` 
       });
     } catch (e) {
       console.error("Password reset exception:", e);
       toast({ 
         title: "Email service error", 
         description: "Unable to send password reset email. Please try again later.", 
         variant: "destructive" 
       });
     }
   };

  // Check for verification success and auth callbacks on component mount
  useEffect(() => {
    const verified = searchParams.get('verified');
    const callback = searchParams.get('callback');
    const sessionExpired = searchParams.get('session') === 'expired';
    const error = searchParams.get('error');
    
    // Handle session expiration error
    if (error === 'session_expired' || sessionExpired) {
      toast({
        title: "Session expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive"
      });
      // Clear the URL parameter
      window.history.replaceState({}, '', '/auth');
      // Switch to login mode
      setMode('login');
    }
    
    if (verified === 'true') {
      toast({
        title: "Email verified successfully!",
        description: "Your account has been activated. You can now log in.",
      });
      // Clear the URL parameter
      window.history.replaceState({}, '', '/auth');
      // Switch to login mode
      setMode('login');
    }
    
    // Handle session expiration
    if (sessionExpired) {
      toast({
        title: "Session expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive"
      });
      // Clear any remaining auth data
      localStorage.removeItem('orbital-sentinel-auth-token');
      // Clear the URL parameter
      window.history.replaceState({}, '', '/auth');
    }
    
    // Handle Google auth callback
    if (callback === 'google-auth') {
      // Check if user is authenticated after Google redirect
      const checkSession = async () => {
        try {
          console.log("Checking session after Google auth callback");
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Session check error:", error);
            toast({
              title: "Authentication error",
              description: error.message,
              variant: "destructive"
            });
            return;
          }
          
          if (data.session) {
            console.log("Session found, user authenticated");
            toast({
              title: "Successfully signed in with Google!",
              description: "Welcome to Orbital Guardian!",
            });
            navigate('/');
          } else {
            console.log("No session found after Google callback");
            toast({
              title: "Authentication failed",
              description: "Unable to complete Google sign-in. Please try again.",
              variant: "destructive"
            });
          }
        } catch (e) {
          console.error("Session check exception:", e);
          toast({
            title: "Authentication error",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive"
          });
        }
      };
      
      checkSession();
      // Clear the URL parameter
      window.history.replaceState({}, '', '/auth');
    }
  }, [searchParams, navigate]);

  const title = useMemo(() => {
    switch (mode) {
      case "login": return "Login";
      case "signup": return "Create account";
      case "reset": return "Reset password";
      default: return "Login";
    }
  }, [mode]);
  
  const description = useMemo(() => {
    switch (mode) {
      case "login": return "Access your Orbital Guardian dashboard.";
      case "signup": return "Sign up to start monitoring space debris.";
      case "forgot-password": return "We'll send you a link to reset your password.";
      default: return "Access your Orbital Guardian dashboard.";
    }
  }, [mode]);

  const onLoginSubmit = async (values: LoginFormValues) => {
    try {
      // Clear any existing tokens before login attempt
      localStorage.removeItem('orbital-sentinel-auth-token');
      
      // Show loading toast
      toast({ 
        title: "Logging in", 
        description: "Please wait..." 
      });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        console.error("Login error:", error);
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
        return;
      }

      // Verify session is valid after login
      if (!data.session || !data.user) {
        console.error("No session or user after login");
        toast({ 
          title: "Session Error", 
          description: "Failed to establish a valid session. Please try again.", 
          variant: "destructive" 
        });
        return;
      }
      
      // Log session details for debugging
      console.log("Login successful, session established", {
        user: data.user.id,
        expires_at: data.session.expires_at,
        refresh_token: data.session.refresh_token ? "Present" : "Missing"
      });

      toast({ title: "Welcome back!", description: "Successfully logged in." });
      // Redirect to dashboard on success
      navigate("/");
    } catch (e) {
      console.error("Login exception:", e);
      toast({ 
        title: "Login Error", 
        description: "An unexpected error occurred. Please try again.", 
        variant: "destructive" 
      });
    }
  };

  const onSignupSubmit = async (values: SignupFormValues) => {
    const redirectUrl = `${window.location.origin}/auth?verified=true`;
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { 
          display_name: values.name,
          full_name: values.name
        },
      },
    });
    
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      return;
    }
    
    // Check if email confirmation is required
    if (data.user && !data.session) {
      // Email confirmation required
      setEmailSent(values.email);
      toast({
        title: "Verification email sent!",
        description: `Please check your email (${values.email}) and click the verification link to activate your account.`,
      });
    } else if (data.session) {
      // User is immediately signed in (email confirmation disabled)
      toast({
        title: "Account created!",
        description: "Welcome to Orbital Guardian! Redirecting to dashboard...",
      });
      navigate("/");
    } else {
      // Fallback
      toast({
        title: "Account created!",
        description: "Please check your email for verification instructions.",
      });
    }
  };


  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      <Helmet>
        <title>{`${title} – Orbital Sentinel`}</title>
        <meta name="description" content="Login or create an account to use Orbital Sentinel space debris monitoring." />
        <link rel="canonical" href={`${window.location.origin}/auth`} />
      </Helmet>
      
      {/* Left side - Live rotating solar system */}
      <div className="bg-black md:w-1/2 p-0 flex flex-col justify-center items-stretch text-white">
        <VerticalSolarSystem />
      </div>
      
      {/* Right side - Auth forms */}
      <div className="bg-gray-50 dark:bg-gray-900 md:w-1/2 p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <h2 className="text-2xl font-bold mb-2 text-black dark:text-white">{title}</h2>
          <p className="mb-6 text-black dark:text-white/90">{description}</p>
          
          <div className="flex border rounded-lg overflow-hidden mb-8 shadow-sm">
            <button
              type="button"
              className={`flex-1 px-4 py-3 text-center font-medium transition-all duration-200 ${mode === "login" ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
              onClick={() => handleModeChange("login")}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`flex-1 px-4 py-3 text-center font-medium transition-all duration-200 ${mode === "signup" ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
              onClick={() => handleModeChange("signup")}
            >
              Sign Up
            </button>
            <button
              type="button"
              className={`flex-1 px-4 py-3 text-center font-medium transition-all duration-200 ${mode === "reset" ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
              onClick={() => handleModeChange("reset")}
            >
              Reset
            </button>
          </div>

      {mode === "login" ? (
        <>
          <Form {...loginForm} key="login-form">
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="you@example.com" 
                        className="h-11 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-sm font-medium">Password</FormLabel>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-sm text-blue-600 hover:text-blue-800" 
                        type="button"
                        onClick={() => handleModeChange("reset")}
                      >
                        Forgot password?
                      </Button>
                    </div>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="h-11 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
              >
                Sign In
              </Button>
            </form>
          </Form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-50 dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full mt-6 h-11 flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm rounded-md transition-colors"
              onClick={handleGoogleSignIn}
            >
              <FcGoogle className="h-5 w-5" />
              <span className="font-medium">Sign in with Google</span>
            </Button>
          </div>
        </>
      ) : mode === "signup" ? (
        <Form {...signupForm} key="signup-form">
          <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-5">
            <FormField
              control={signupForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      placeholder="John Doe" 
                      autoComplete="name"
                      className="h-11 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-500" />
                </FormItem>
              )}
            />
            
            <FormField
              control={signupForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="you@example.com" 
                      className="h-11 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={signupForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      className="h-11 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-500" />
                  <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            >
              Create Account
            </Button>
          </form>
        </Form>
      ) : (
        <>
          <Form {...resetForm} key="reset-form">
            <form onSubmit={resetForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-5">
              <FormField
                control={resetForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="you@example.com" 
                        className="h-11 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                    <p className="text-xs text-gray-500 mt-1">We'll send you a link to reset your password</p>
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
              >
                Send Reset Link
              </Button>
              
              <div className="text-center mt-4">
                <Button 
                  type="button" 
                  variant="link" 
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={() => setMode("login")}
                >
                  Back to Login
                </Button>
              </div>
            </form>
          </Form>
          
          {resetEmailSent && (
            <div className="mt-6 p-6 bg-blue-50 border border-blue-100 rounded-lg shadow-sm">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg">Reset Email Sent</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4 text-center">
                We've sent a password reset link to <strong className="text-blue-600">{resetEmailSent}</strong>.
                Please check your inbox and click the link to reset your password.
              </p>
              <p className="text-xs text-gray-500 mb-4 text-center">
                If you don't see the email, check your spam folder or try resending it.
              </p>
              <div className="flex flex-col space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full border-blue-300 hover:bg-blue-50 text-blue-600" 
                  onClick={() => onForgotPasswordSubmit({ email: resetEmailSent })}
                >
                  Resend Reset Email
                </Button>
              <Button 
                variant="ghost" 
                className="w-full hover:bg-gray-100" 
                  onClick={() => setMode("login")}
                >
                  Back to Login
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Email Verification Banner */}
      {emailSent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full border border-blue-100">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Please check your email</h3>
            </div>
            <p className="text-gray-600 mb-6 text-center">
              We've sent a verification email to <strong className="text-blue-600">{emailSent}</strong>. 
              Click the link in the email to activate your account.
            </p>
            <p className="text-sm text-gray-500 mb-6 text-center">
              If you don't see the email, check your spam folder or try resending it.
            </p>
            <div className="flex flex-col space-y-3">
              <Button 
                variant="outline" 
                className="w-full h-11 border-blue-300 hover:bg-blue-50 text-blue-600 font-medium" 
                onClick={handleResendEmail}
              >
                Resend Verification Email
              </Button>
              <Button 
                variant="ghost" 
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium" 
                onClick={() => handleModeChange('login')}
              >
                Back to Login
              </Button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </main>
  );
}
