import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(true);

  const toggleMode = () => setIsSignUp(!isSignUp);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 neon-text">NRX PAY</h1>
          <p className="text-muted-foreground font-bold">Trade USDT at highest rate</p>
        </div>
        
        <Card className="border-border">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold neon-text">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSignUp ? (
              <SignUpForm onToggle={toggleMode} />
            ) : (
              <SignInForm onToggle={toggleMode} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const SignUpForm = ({ onToggle }: { onToggle: () => void }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    mobile: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate phone number length
      if (formData.mobile.length !== 10) {
        toast({
          title: "Invalid Phone Number",
          description: "Phone number must be exactly 10 digits",
          variant: "destructive",
          duration: 3000
        });
        setLoading(false);
        return;
      }

      // Check for duplicate phone number
      const { data: existingUser, error: checkError } = await supabase
        .from('user_data')
        .select('mobile_number')
        .eq('mobile_number', formData.mobile)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        toast({
          title: "Error",
          description: "Unable to validate phone number. Please try again.",
          variant: "destructive",
          duration: 3000
        });
        setLoading(false);
        return;
      }

      if (existingUser) {
        toast({
          title: "Phone Number Already Exists",
          description: "This phone number is already registered. Please use a different number.",
          variant: "destructive",
          duration: 3000
        });
        setLoading(false);
        return;
      }

      // First create the account
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            mobile_number: formData.mobile
          }
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
          duration: 1000
        });
        return;
      }

      // If signup successful, automatically sign in the user
      if (data.user) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (signInError) {
          toast({
            title: "Account created but sign in failed",
            description: "Please try signing in manually.",
            variant: "destructive",
            duration: 1000
          });
        } else {
          toast({
            title: "Success",
            description: "Account created successfully! Welcome to NRX PAY!",
            duration: 1000
          });
          // The useAuth hook will handle the redirect to /home
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
        duration: 1000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input 
          id="username" 
          value={formData.username}
          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          placeholder="Enter your username" 
          className="h-12"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="Enter your email" 
          className="h-12"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="mobile">Mobile Number</Label>
        <div className="flex">
          <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-muted-foreground">
            +91
          </div>
          <Input 
            id="mobile" 
            type="tel"
            value={formData.mobile}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
              if (value.length <= 10) {
                setFormData(prev => ({ ...prev, mobile: value }));
              }
            }}
            placeholder="Enter 10-digit mobile number" 
            className="h-12 rounded-l-none"
            maxLength={10}
            minLength={10}
            pattern="[0-9]{10}"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input 
          id="password" 
          type="password" 
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          placeholder="Enter your password" 
          className="h-12"
          required
        />
      </div>
      
      <Button variant="neon" type="submit" disabled={loading} className="w-full h-12 mt-6">
        {loading ? "Creating Account..." : "Sign Up"}
      </Button>
      
      <p className="text-center text-sm text-muted-foreground mt-4">
        Already a user?{" "}
        <button
          type="button"
          onClick={onToggle}
          className="text-accent hover:underline font-medium"
        >
          Sign In
        </button>
      </p>
    </form>
  );
};

const SignInForm = ({ onToggle }: { onToggle: () => void }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
          duration: 1000
        });
      } else {
        toast({
          title: "Success",
          description: "Signed in successfully!",
          duration: 1000
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
        duration: 1000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signin-email">Email</Label>
        <Input 
          id="signin-email" 
          type="email" 
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="Enter your email" 
          className="h-12"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signin-password">Password</Label>
        <Input 
          id="signin-password" 
          type="password" 
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          placeholder="Enter your password" 
          className="h-12"
          required
        />
      </div>
      
      <Button variant="neon" type="submit" disabled={loading} className="w-full h-12 mt-6">
        {loading ? "Signing In..." : "Sign In"}
      </Button>
      
      <p className="text-center text-sm text-muted-foreground mt-4">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onToggle}
          className="text-accent hover:underline font-medium"
        >
          Sign Up
        </button>
      </p>
    </form>
  );
};