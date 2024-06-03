import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { LanguageType } from "@/lib/types";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectGroup,
  SelectContent,
  Select,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import Spinner from "@/components/component/spinner";

import { useLogout } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";
import { useError } from "@/providers/error-provider";
import { useAuth } from "@/providers/auth-provider";

import useAxios from "@/hooks/use-axios";
import { PasswordInput } from "@/components/component/password-input";
const updatePasswordSchema = z
  .object({
    username: z.string(),
    current: z.string().min(8, "Password must be at least 8 characters"),
    new: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.current !== data.new, {
    message: "New password must be different from current password",
    path: ["new"],
  });
type UpdatePasswordSchema = z.infer<typeof updatePasswordSchema>;

const UpdatePreferencesSchema = z.object({
  theme: z.enum(["dark", "light", "system"]),
  language: z.enum(["en", "ar"]),
});

type UpdatePreferencesSchemaType = z.infer<typeof UpdatePreferencesSchema>;

export default function Settings() {
  const { t, i18n } = useTranslation();
  const Navigate = useNavigate();
  const logout = useLogout();
  const axios = useAxios();
  const { user } = useAuth();
  const { setError } = useError();
  const [searchParams, setSearchParams] = useSearchParams({
    tab: "password",
  });
  const tabs = ["password", "preferences"];
  const tab = searchParams.get("tab") || "password";
  const setTab = (value: string) => {
    setSearchParams(
      (prev) => {
        prev.delete("tab");
        if (value && tabs.includes(value)) {
          prev.set("tab", value);
        } else prev.set("tab", "password");
        return prev;
      },
      { replace: true }
    );
  };

  const lang = document.documentElement.lang.substring(0, 2) as LanguageType;
  const { setTheme, theme } = useTheme();

  const preferencesForm = useForm<UpdatePreferencesSchemaType>({
    resolver: zodResolver(UpdatePreferencesSchema),
    defaultValues: {
      theme: theme,
      language: lang,
    },
  });
  const updatePreferences = async (values: UpdatePreferencesSchemaType) => {
    try {
      await axios.patch("/users/preferences", values);
      setTheme(values.theme);
      i18n.changeLanguage(values.language);
    } catch (error: any) {
      toast({
        title: t("Something went wrong"),
        description: error.response.data.message,
        variant: "destructive",
      });
    }
  };

  const passwordForm = useForm<UpdatePasswordSchema>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      username: user?.username,
      current: "",
      new: "",
    },
  });
  const updatePassword = async (values: UpdatePasswordSchema) => {
    try {
      await axios.patch("/users/password", values);
      setError({
        title: "Password changed successfully",
        description: "Please login again.",
      });
      logout(false);
      Navigate("/", { replace: true });
    } catch (error: any) {
      const { response } = error;
      if (response.status === 400) {
        passwordForm.setError("current", {
          message: response.data.message,
        });
      }
      toast({
        title: t("Something went wrong"),
        description: error?.response?.data?.message
          ? t(error?.response?.data?.message)
          : t("Something went wrong"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="align-center my-auto flex items-center justify-center">
      <Tabs
        value={tab}
        onValueChange={setTab}
        defaultValue="password"
        className="w-[400px]"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="password">{t("Password")}</TabsTrigger>
          <TabsTrigger value="preferences">{t("Preferences")}</TabsTrigger>
        </TabsList>
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle className="rtl:text-right">{t("Password")}</CardTitle>
              <CardDescription className="rtl:text-right">
                {t("Changing your password will log you out from all devices.")}
              </CardDescription>
            </CardHeader>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(updatePassword)}>
                <CardContent className="space-y-2">
                  <FormField
                    control={passwordForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem className="hidden">
                        <FormControl>
                          <Input
                            autoComplete="username"
                            type="text"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="current"
                    render={({ field }) => (
                      <FormItem className="space-y-1 rtl:text-right">
                        <FormLabel>{t("Current password")}</FormLabel>
                        <FormControl>
                          <PasswordInput
                            autoComplete="current-password"
                            disabled={passwordForm.formState.isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  ></FormField>
                  <FormField
                    control={passwordForm.control}
                    name="new"
                    render={({ field }) => (
                      <FormItem className="space-y-1 rtl:text-right">
                        <FormLabel>{t("New password")}</FormLabel>
                        <FormControl>
                          <PasswordInput
                            autoComplete="new-password"
                            disabled={passwordForm.formState.isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button
                    disabled={passwordForm.formState.isSubmitting}
                    className="w-[50%]"
                  >
                    {passwordForm.formState.isSubmitting ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      t("Save Changes")
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="rtl:text-right">
                {t("Preferences")}
              </CardTitle>
              <CardDescription className="rtl:text-right">
                {t("Change your preferences.")}
              </CardDescription>
            </CardHeader>
            <Form {...preferencesForm}>
              <form onSubmit={preferencesForm.handleSubmit(updatePreferences)}>
                <CardContent className="space-y-2">
                  <FormField
                    control={preferencesForm.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem className="space-y-1 rtl:text-right">
                        <FormLabel>{t("Theme")}</FormLabel>
                        <Select
                          disabled={preferencesForm.formState.isSubmitting}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="light">
                                {t("Light")}
                              </SelectItem>
                              <SelectItem value="dark">{t("Dark")}</SelectItem>
                              <SelectItem value="system">
                                {t("System")}
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={preferencesForm.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem className="space-y-1 rtl:text-right">
                        <FormLabel>{t("Language")}</FormLabel>
                        <Select
                          disabled={preferencesForm.formState.isSubmitting}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="ar">العربية</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button
                    disabled={preferencesForm.formState.isSubmitting}
                    className="w-[50%]"
                  >
                    {preferencesForm.formState.isSubmitting ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      t("Save Changes")
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
