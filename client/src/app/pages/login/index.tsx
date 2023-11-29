import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import axios from "@/api/axios";
import { AlertType } from "@/lib/types";

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
import { useTheme } from "@/providers/theme-provider";
import { useAuth } from "@/providers/auth-provider";
import Spinner from "@/components/component/spinner";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginSchemaType = z.infer<typeof loginSchema>;

export default function Login() {
  const { t, i18n } = useTranslation();
  const Navigate = useNavigate();
  const { toast } = useToast();
  const { setTheme } = useTheme();
  const { user, setUser } = useAuth();
  const [error, setError] = useState<AlertType | undefined>(undefined);

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
      const { data, message } = response;

      setUser(data.user);
      setTheme(data.user.theme);
      i18n.changeLanguage(data.user.lang);

      toast({
        variant: "inverse",
        title: t(message),
      });
      Navigate("/worksheets");
    } catch (error: any) {
      if (error.code === "ERR_NETWORK" || !error?.response) {
        setError({
          title: "Server is down",
          description: "Network Error, Please try again later",
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
      console.log("user", user);
      Navigate("/worksheets", { replace: true });
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
              <AlertDescription>{t(error.description)}</AlertDescription>
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
