import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import axios from "@/api/axios";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Layout from "./layout";
import { useAuth } from "@/providers/auth-provider";
import { useError } from "@/providers/error-provider";
import Spinner from "@/components/component/spinner";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginSchemaType = z.infer<typeof loginSchema>;

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.state?.from?.pathname;
  const search = location.state?.from?.search;
  const from =
    pathname && !["/logout", "/unauthorized"].includes(pathname)
      ? `${pathname}${search}`
      : "/worksheets";
  const { toast } = useToast();
  const { user, setUser, setAccessToken } = useAuth();
  const { error, setError } = useError();

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  async function onSubmit(values: LoginSchemaType) {
    setError(undefined);
    try {
      const { data: response } = await axios.post("/auth", values);
      const { data } = response;

      setUser(data.user);
      setAccessToken(data.accessToken);
      toast({
        variant: "inverse",
        title: t("Welcome back, {{name}}", { name: data.user.fullName }),
        duration: 2500,
      });
      navigate(from, { replace: true });
    } catch (error: any) {
      if (error.code === "ERR_NETWORK" || !error?.response) {
        setError({
          title: "Server unreachable",
          description: "Sorry, server unreachable at the moment.",
        });
      } else {
        setError({
          description: error.response.data.message,
        });
      }
    }
  }
  useEffect(() => {
    if (user) {
      navigate("/worksheets", { replace: true });
    }
  }, []);

  return (
    <Layout>
      <div className="flex justify-center items-center align-center my-auto">
        <div className="mx-auto max-w-sm space-y-6 my-a">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">{t("Login")}</h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              {t("Enter your credentials below to login to your account")}
            </p>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              {error?.title && <AlertTitle>{t(error.title)}</AlertTitle>}
              {error?.description && (
                <AlertDescription>{t(error.description)}</AlertDescription>
              )}
            </Alert>
          )}
          <div className="space-y-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <div>
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Username")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>{t("Password")}</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  disabled={form.formState.isSubmitting}
                  className="w-full"
                  type="submit"
                >
                  {form.formState.isSubmitting ? <Spinner /> : t("Login")}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
