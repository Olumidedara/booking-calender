import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useAuthStore } from "../stores/auth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { CalendarDays, Sparkles } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError("");
    try {
      await login(data.email, data.password);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary/80 to-indigo-900 text-white p-12 flex-col justify-between"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white" />
          <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white" />
          <div className="absolute top-1/3 left-1/2 w-64 h-64 rounded-full bg-white/50" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-sm">
              <CalendarDays className="h-7 w-7" />
            </div>
            <span className="text-xl font-semibold tracking-tight">Calendar</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Smart scheduling made simple</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Organize your time.
            <br />
            Own your day.
          </h1>
          <p className="text-lg text-white/70 max-w-sm leading-relaxed">
            A beautiful, intuitive calendar that helps you plan, track, and manage your events effortlessly.
          </p>

          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-2">
              {["#3B82F6", "#10B981", "#F59E0B", "#EF4444"].map((c, i) => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-white/20" style={{ backgroundColor: c }} />
              ))}
            </div>
            <span className="text-sm text-white/60">Color-coded events</span>
          </div>
        </div>

        <div className="relative z-10 text-sm text-white/40">
          &copy; {new Date().getFullYear()} Calendar. All rights reserved.
        </div>
      </motion.div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-sm space-y-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-6">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <CalendarDays className="h-6 w-6" />
            </div>
            <span className="text-xl font-semibold">Calendar</span>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="your@mail.com"
                className="h-11"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="********"
                className="h-11"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Demo account</span>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/30 p-3 text-center text-sm text-muted-foreground">
              <span className="font-medium text-foreground">demo@example.com</span>
              <span className="mx-2">/</span>
              <span className="font-medium text-foreground">password123</span>
            </div>
          </form>

          <motion.p
            {...fadeUp}
            transition={{ delay: 0.4 }}
            className="text-center text-sm text-muted-foreground"
          >
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline underline-offset-4">
              Create one
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
