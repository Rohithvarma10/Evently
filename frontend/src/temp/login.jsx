// src/temp/login.jsx
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock } from "lucide-react";

// use shared axios instance from lib/api

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password is required"),
});

export default function Login() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const { mutate, isLoading } = useMutation({
    mutationFn: async (values) => {
      const payload = {
        email: values.email.trim().toLowerCase(),
        password: values.password,
      };
      const res = await api.post(`/api/auth/login`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      const token = data?.token || data?.accessToken;
      // role may be at data.user.role or data.role; normalize it
      const roleRaw = data?.user?.role ?? data?.role ?? "";
      const role = String(roleRaw).toLowerCase();

      if (!token) {
        toast.error("Missing token in response");
        return;
      }

      localStorage.setItem("token", token);
      if (role) localStorage.setItem("role", role);

      toast.success("Logged in successfully");

      // Redirect based on role
      if (role === "admin") {
        navigate("/admin/events", { replace: true });
      } else {
        navigate("/events", { replace: true });
      }
    },
    onError: (error) => {
      const msg =
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        error?.message ||
        "Login failed";
      toast.error(msg);
    },
  });

  const onSubmit = (values) => mutate(values);

  return (
    // MATCH register page layout exactly:
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      {/* Evently heading */}
      <h1 className="text-5xl font-extrabold mb-8 text-indigo-600">Evently</h1>

      <Card className="w-full max-w-md border border-indigo-100 shadow-sm">
        <CardHeader className="pb-4 text-center">
          <CardTitle className="text-3xl font-bold text-gray-900">Login</CardTitle>
          <CardDescription className="text-gray-500 mt-1">
            Enter your credentials to access your account.
          </CardDescription>
          <div className="mt-2">
            <Button asChild variant="link" className="px-0 text-indigo-600 hover:text-indigo-700">
              <Link to="/register">Don’t have an account? Sign up</Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  className="pl-9"
                  autoComplete="email"
                  {...register("email")}
                />
              </div>
              {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  className="pl-9"
                  autoComplete="current-password"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <span className="text-xs text-red-500">{errors.password.message}</span>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-3" />
      </Card>
    </div>
  );
}
