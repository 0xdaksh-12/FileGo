import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Shield, Clock, Link2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { GoogleLogin } from "@react-oauth/google";
import useAuth from "@/hooks/use-auth";
import { useLocation } from "wouter";
import toast from "react-hot-toast";

export default function AuthPage() {
  const [tab, setTab] = useState("signin");
  const { signin, signup, googleAuth } = useAuth();
  const [_, navigate] = useLocation();

  const signInForm = useForm({
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm({
    defaultValues: { name: "", email: "", password: "" },
  });

  const handleGoogleLogin = async (credentialResponse: any) => {
    const res = await googleAuth(credentialResponse.credential);
    if (res.success) {
      navigate("/dashboard");
    } else {
      toast.error(res.message || "Google login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        {/* Left Info Section */}
        <div className="hidden md:block">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Share Files Securely
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Upload, share, and manage your files with password protection and
              expiry controls.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="text-center p-4">
                <Upload className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">
                  Easy Upload
                </h3>
                <p className="text-sm text-gray-600">
                  Drag & drop files up to 2GB
                </p>
              </div>
              <div className="text-center p-4">
                <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Secure</h3>
                <p className="text-sm text-gray-600">
                  Password protection available
                </p>
              </div>
              <div className="text-center p-4">
                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Expires</h3>
                <p className="text-sm text-gray-600">
                  Set automatic expiry dates
                </p>
              </div>
              <div className="text-center p-4">
                <Link2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Shareable</h3>
                <p className="text-sm text-gray-600">
                  Generate secure download links
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Auth Section */}
        <div className="w-full max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {tab === "signup" ? "Create Account" : "Welcome Back"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={tab} onValueChange={setTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {/* Sign In */}
                <TabsContent value="signin" className="space-y-4">
                  <Form {...signInForm}>
                    <form
                      onSubmit={signInForm.handleSubmit(signin)}
                      className="space-y-4"
                    >
                      <FormField
                        control={signInForm.control}
                        name="email"
                        rules={{ required: "Email is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="you@example.com"
                                autoComplete="off"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signInForm.control}
                        name="password"
                        rules={{
                          required: "Password is required",
                          minLength: {
                            value: 6,
                            message: "At least 6 characters",
                          },
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" variant="default" className="w-full">
                        {signInForm.formState.isSubmitting
                          ? "Signing in..."
                          : "Sign In"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                {/* Sign Up */}
                <TabsContent value="signup" className="space-y-4">
                  <Form {...signUpForm}>
                    <form
                      onSubmit={signUpForm.handleSubmit(signup)}
                      className="space-y-4"
                    >
                      <FormField
                        control={signUpForm.control}
                        name="name"
                        rules={{
                          required: "Name is required",
                          minLength: { value: 2, message: "Too short" },
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="User Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signUpForm.control}
                        name="email"
                        rules={{ required: "Email is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="you@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signUpForm.control}
                        name="password"
                        rules={{
                          required: "Password is required",
                          minLength: {
                            value: 6,
                            message: "At least 6 characters",
                          },
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="At least 6 characters"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" variant="default" className="w-full">
                        {signUpForm.formState.isSubmitting
                          ? "Creating..."
                          : "Create Account"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google login */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => console.log("Google login failed")}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
