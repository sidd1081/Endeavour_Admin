"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please fill in both fields.");
      return;
    }

    setIsLoading(true);
    

    try {
      const response = await api.post("/login", { email, password });

      // Destructure token and userPayload properly
      const { token: jwtToken, userPayload } = response.data.data.token;

      if (!userPayload.isAdmin && !userPayload.isSuperAdmin) {
        setErrorMessage("You are not allowed to log in.");
        setIsLoading(false);
        return;
      }

      // Optional: Verify token with a protected route
      const verifyRes = await api.get("/users", {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!verifyRes.data.success) {
        setErrorMessage("Token verification failed.");
        setIsLoading(false);
        return;
      }

      // Store token & user info
      localStorage.setItem("token", jwtToken);
      localStorage.setItem("user", JSON.stringify(userPayload));

      router.push("/dashboard");
    } catch (error: any) {
      setErrorMessage("Invalid credentials or token.");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const disableShortcuts = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
      }
    };
  
    const disableContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
  
    const detectDevTools = () => {
      const threshold = 160;
      const check = () => {
        const start = new Date().getTime();
        debugger;
        const end = new Date().getTime();
        if (end - start > threshold) {
          alert("DevTools are not allowed.");
          window.close(); // or redirect to a safe page
        }
      };
      setInterval(check, 1000);
    };
  
    document.addEventListener("keydown", disableShortcuts);
    document.addEventListener("contextmenu", disableContextMenu);
    detectDevTools();
  
    return () => {
      document.removeEventListener("keydown", disableShortcuts);
      document.removeEventListener("contextmenu", disableContextMenu);
    };
  }, []);
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Event Management System</CardTitle>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {errorMessage && <p className="text-red-500 text-sm text-center">{errorMessage}</p>}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
