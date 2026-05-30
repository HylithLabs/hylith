"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "motion/react";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { isAdminEmail } from "@/lib/admin";

export enum AuthView {
  SIGN_IN = "sign-in",
  SIGN_UP = "sign-up",
  FORGOT_PASSWORD = "forgot-password",
}

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
});

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  terms: z.literal(true, { error: "You must agree to the terms" }),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type SignInFormValues = z.infer<typeof signInSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

interface AuthProps extends React.ComponentProps<"div"> {
  defaultView?: AuthView;
}

const BRAND_BG = "#0F0B0A";
const PAGE_BG = "#EEEEE8";

function BrandPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-12"
      style={{ backgroundColor: BRAND_BG }}
    >
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="mb-2 text-4xl font-bold text-white">Hylith</h1>
          <p className="text-sm text-zinc-400">Creative Agency Portal</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 space-y-6"
        >
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-white">
              Discovery Calls & Systems
            </h2>
            <p className="leading-relaxed text-zinc-400">
              Transform your creative workflow with our integrated platform.
              Schedule discovery calls, manage projects, and streamline your
              creative systems all in one place.
            </p>
          </div>
          <ul className="space-y-4 pt-8">
            {[
              {
                title: "Seamless Scheduling",
                body: "Book and manage discovery calls with ease",
              },
              {
                title: "Unified Systems",
                body: "All your creative tools in one dashboard",
              },
              {
                title: "Real-time Collaboration",
                body: "Work together seamlessly with your team",
              },
            ].map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-white" />
                <div>
                  <h3 className="mb-1 font-medium text-white">{item.title}</h3>
                  <p className="text-sm text-zinc-500">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xs text-zinc-600"
      >
        © {new Date().getFullYear()} Hylith. All rights reserved.
      </motion.p>
    </motion.div>
  );
}

function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-full max-w-md rounded-2xl border p-8 shadow-lg backdrop-blur-sm"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        borderColor: "rgba(15, 11, 10, 0.1)",
      }}
    >
      {children}
    </div>
  );
}

function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"
    >
      {message}
    </div>
  );
}

function OrDivider() {
  return (
    <div className="relative">
      <Separator className="bg-zinc-300" />
      <span
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-xs text-zinc-500"
        style={{ backgroundColor: PAGE_BG }}
      >
        or
      </span>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
      <path d="M1 1h22v22H1z" fill="none" />
    </svg>
  );
}

function GoogleButton({
  callbackUrl,
  disabled,
}: {
  callbackUrl: string;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className="h-12 w-full border-zinc-300 hover:bg-zinc-50"
      disabled={disabled}
      onClick={() => signIn("google", { callbackUrl })}
    >
      <GoogleIcon className="mr-2 size-5" />
      Continue with Google
    </Button>
  );
}

interface SignInFormProps {
  callbackUrl: string;
  onSwitchToSignUp: () => void;
  onSwitchToForgotPassword: () => void;
}

function SignInForm({
  callbackUrl,
  onSwitchToSignUp,
  onSwitchToForgotPassword,
}: SignInFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const rememberMe = watch("rememberMe");

  const onSubmit = async (data: SignInFormValues) => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        return;
      }

      router.push(isAdminEmail(data.email) ? "/admin" : callbackUrl);
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      key="sign-in"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-3xl font-bold" style={{ color: BRAND_BG }}>
          Welcome back
        </h2>
        <p className="text-zinc-600">Sign in to your account to continue</p>
      </div>

      <GoogleButton callbackUrl={callbackUrl} disabled={isLoading} />
      <OrDivider />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sign-in-email" className="text-sm font-medium">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500" />
            <Input
              id="sign-in-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              disabled={isLoading}
              className={cn(
                "h-12 border-zinc-300 pl-10 focus:border-[#0F0B0A]",
                errors.email && "border-destructive",
              )}
              {...register("email")}
            />
          </div>
          {errors.email ? (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sign-in-password" className="text-sm font-medium">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500" />
            <Input
              id="sign-in-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              disabled={isLoading}
              className={cn(
                "h-12 border-zinc-300 pr-10 pl-10 focus:border-[#0F0B0A]",
                errors.password && "border-destructive",
              )}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {errors.password ? (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          ) : null}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe === true}
              onCheckedChange={(checked) =>
                setValue("rememberMe", checked === true)
              }
              disabled={isLoading}
            />
            <Label
              htmlFor="remember"
              className="cursor-pointer text-sm font-normal"
            >
              Remember me
            </Label>
          </div>
          <button
            type="button"
            onClick={onSwitchToForgotPassword}
            className="text-sm hover:underline"
            style={{ color: BRAND_BG }}
          >
            Forgot password?
          </button>
        </div>

        <AuthError message={error} />

        <Button
          type="submit"
          className="h-12 w-full text-base font-medium"
          style={{ backgroundColor: BRAND_BG }}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-600">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="font-medium hover:underline"
          style={{ color: BRAND_BG }}
        >
          Sign up
        </button>
      </p>
    </motion.div>
  );
}

interface SignUpFormProps {
  callbackUrl: string;
  onSwitchToSignIn: () => void;
}

function SignUpForm({ callbackUrl, onSwitchToSignIn }: SignUpFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", terms: false as unknown as true },
  });

  const terms = watch("terms");

  const onSubmit = async (data: SignUpFormValues) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      let body: { error?: string } = {};
      try {
        body = await res.json();
      } catch {
        // ignore parse errors
      }

      if (!res.ok) {
        setError(body.error ?? "Registration failed");
        return;
      }

      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Account created but sign-in failed. Try logging in.");
        return;
      }

      router.push(isAdminEmail(data.email) ? "/admin" : callbackUrl);
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      key="sign-up"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-3xl font-bold" style={{ color: BRAND_BG }}>
          Create account
        </h2>
        <p className="text-zinc-600">Get started with Hylith today</p>
      </div>

      <GoogleButton callbackUrl={callbackUrl} disabled={isLoading} />
      <OrDivider />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sign-up-name" className="text-sm font-medium">
            Full name
          </Label>
          <Input
            id="sign-up-name"
            type="text"
            autoComplete="name"
            placeholder="John Doe"
            disabled={isLoading}
            className={cn(
              "h-12 border-zinc-300 focus:border-[#0F0B0A]",
              errors.name && "border-destructive",
            )}
            {...register("name")}
          />
          {errors.name ? (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sign-up-email" className="text-sm font-medium">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500" />
            <Input
              id="sign-up-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              disabled={isLoading}
              className={cn(
                "h-12 border-zinc-300 pl-10 focus:border-[#0F0B0A]",
                errors.email && "border-destructive",
              )}
              {...register("email")}
            />
          </div>
          {errors.email ? (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sign-up-password" className="text-sm font-medium">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500" />
            <Input
              id="sign-up-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              disabled={isLoading}
              className={cn(
                "h-12 border-zinc-300 pr-10 pl-10 focus:border-[#0F0B0A]",
                errors.password && "border-destructive",
              )}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {errors.password ? (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          ) : null}
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={terms === true}
            onCheckedChange={(checked) =>
              setValue("terms", checked === true ? true : (false as unknown as true), {
                shouldValidate: true,
              })
            }
            disabled={isLoading}
          />
          <div className="space-y-1">
            <Label htmlFor="terms" className="cursor-pointer text-sm font-normal">
              I agree to the terms
            </Label>
            <p className="text-xs text-zinc-500">
              By signing up, you agree to our Terms and Privacy Policy.
            </p>
          </div>
        </div>
        {errors.terms ? (
          <p className="text-xs text-destructive">{errors.terms.message}</p>
        ) : null}

        <AuthError message={error} />

        <Button
          type="submit"
          className="h-12 w-full text-base font-medium"
          style={{ backgroundColor: BRAND_BG }}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Sign up"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-600">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="font-medium hover:underline"
          style={{ color: BRAND_BG }}
        >
          Sign in
        </button>
      </p>
    </motion.div>
  );
}

interface ForgotPasswordFormProps {
  onSwitchToSignIn: () => void;
}

function ForgotPasswordForm({ onSwitchToSignIn }: ForgotPasswordFormProps) {
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async () => {
    setError(null);
    setIsLoading(true);
    try {
      // Password reset API not yet implemented.
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSuccess(true);
    } catch {
      setError("Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      key="forgot-password"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-3xl font-bold" style={{ color: BRAND_BG }}>
          Reset password
        </h2>
        <p className="text-zinc-600">
          Enter your email to receive a reset link
        </p>
      </div>

      {success ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            Check your email for a password reset link.
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full"
            onClick={onSwitchToSignIn}
          >
            Back to sign in
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="forgot-email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500" />
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                disabled={isLoading}
                className={cn(
                  "h-12 border-zinc-300 pl-10 focus:border-[#0F0B0A]",
                  errors.email && "border-destructive",
                )}
                {...register("email")}
              />
            </div>
            {errors.email ? (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <AuthError message={error} />

          <Button
            type="submit"
            className="h-12 w-full text-base font-medium"
            style={{ backgroundColor: BRAND_BG }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send reset link"
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="text-sm hover:underline"
              style={{ color: BRAND_BG }}
            >
              Back to sign in
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
}

function Auth({
  className,
  defaultView = AuthView.SIGN_IN,
  ...props
}: AuthProps) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") ?? "/dashboard";
  const [currentView, setCurrentView] = React.useState<AuthView>(defaultView);

  return (
    <div
      data-slot="auth"
      className={cn("flex min-h-screen", className)}
      style={{ backgroundColor: PAGE_BG }}
      {...props}
    >
      <BrandPanel />
      <div className="flex flex-1 items-center justify-center p-8">
        <AuthCard>
          <AnimatePresence mode="wait">
            {currentView === AuthView.SIGN_IN && (
              <SignInForm
                callbackUrl={callbackUrl}
                onSwitchToSignUp={() => setCurrentView(AuthView.SIGN_UP)}
                onSwitchToForgotPassword={() =>
                  setCurrentView(AuthView.FORGOT_PASSWORD)
                }
              />
            )}
            {currentView === AuthView.SIGN_UP && (
              <SignUpForm
                callbackUrl={callbackUrl}
                onSwitchToSignIn={() => setCurrentView(AuthView.SIGN_IN)}
              />
            )}
            {currentView === AuthView.FORGOT_PASSWORD && (
              <ForgotPasswordForm
                onSwitchToSignIn={() => setCurrentView(AuthView.SIGN_IN)}
              />
            )}
          </AnimatePresence>
        </AuthCard>
      </div>
    </div>
  );
}

export { Auth };
