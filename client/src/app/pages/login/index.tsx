import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/providers/auth-provider";
import { useState } from "react";
import axios from "@/api/axios";
import { useTheme } from "@/providers/theme-provider";
import Layout from "@/app/layout";

function Login() {
  const { setTheme } = useTheme();
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleUserName = (e) => {
    setUsername(e.target.value);
  };

  const handlePassword = (e) => {
    setPassword(e.target.value);
  };
  const handleLogin = async () => {
    try {
      const response = await axios.post("/auth", {
        username,
        password,
      });
      const { data } = response;
      setUser(data.data.user);
      toast({
        title: `Welcome Back, ${data.data.user.fullName}`,
      });
      setError(null);
    } catch (error) {
      if (error.code === "ERR_NETWORK" || !error?.response) {
        setError({
          title: "Server is down",
          description: "Network Error, Please try again later",
        });
      }
      setError({
        description: error.response.data.message,
      });
    } finally {
      // set theme and language
      // i18n.changeLanguage(user.language);
      // setTheme(user.theme);
    }
  };

  return (
    <Layout>
      <div className="flex justify-center items-center align-center my-auto">
        <div className="mx-auto max-w-sm space-y-6 my-a">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Enter your credentials below to login to your account
            </p>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              {error?.title && <AlertTitle>{error.title}</AlertTitle>}
              <AlertDescription>{error.description}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                required
                type="text"
                onChange={handleUserName}
              />
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                placeholder=""
                required
                type="password"
                onChange={handlePassword}
              />
            </div>
            <Button className="w-full" type="submit" onClick={handleLogin}>
              Login
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Login;
