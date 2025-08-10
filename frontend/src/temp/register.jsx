// src/pages/Register.jsx (or wherever this lives)
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import api from "@/lib/api"; // <-- uses your Replit base URL + JSON headers

import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
} from "@/components/ui/card";

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Register() {
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { username: "", email: "", password: "" },
  });

  const { mutate, isLoading } = useMutation({
    mutationFn: async (payload) => {
      // Adjust if your backend expects { name } instead of { username }
      const res = await api.post("/api/auth/register", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Account created successfully");
      navigate("/login", { replace: true });
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed";
      toast.error(msg);
      // show field-level errors if backend returns them
      if (err?.response?.data?.errors) {
        Object.entries(err.response.data.errors).forEach(([field, message]) => {
          form.setError(field, { message: String(message) });
        });
      }
    },
  });

  const onSubmit = (data) => mutate(data);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-5xl font-extrabold mb-8 text-indigo-600">Evently</h1>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Sign up with your details below.</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create account"}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="text-sm text-muted-foreground justify-center">
          Already have an account?
          <Link to="/login" className="text-primary hover:underline ml-1">
            Log in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
