import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  useGetUserQuery,
  updatePasswordSchema,
  updatePasswordSchemaType,
  useUpdatePasswordMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useUpdateUserRoleMutation,
} from "@/api/users";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import Spinner from "@/components/component/spinner";
import Loading from "@/components/component/loading";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import DeleteDialog from "@/components/component/delete-dialog";
import UserForm from "./form";

import { ROLES } from "@/lib/constants";

import { Trash2Icon } from "lucide-react";
import { UserType } from "@/lib/types";
import { useAuth } from "@/providers/auth-provider";

export default function Edit() {
  const [isLoading, setIsLoading] = useState(true);
  const [active, setActive] = useState(false);
  const [role, setRole] = useState("user");
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams({
    tab: "password",
  });
  const tabs = ["password", "profile", "settings"];
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
  const { data } = useGetUserQuery();
  const user = data?.user as UserType;
  const passwordForm = useForm<updatePasswordSchemaType>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      username: user?.username,
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      passwordForm.setValue("username", user.username);
      setActive(user.active);
      setRole(user.role);
      setIsLoading(false);
    }
  }, [user]);

  const { mutateAsync } = useUpdatePasswordMutation();
  const updatePassword = async (data: updatePasswordSchemaType) => {
    try {
      await mutateAsync({ data, userId: user?.id });
      passwordForm.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("Error"),
        description: error?.response?.data?.message
          ? t(error?.response?.data?.message)
          : t("Something went wrong"),
      });
    }
  };

  const { mutateAsync: updateStatusMut } = useUpdateUserStatusMutation();
  const { mutateAsync: updateRoleMut } = useUpdateUserRoleMutation();

  const { mutateAsync: deleteUser } = useDeleteUserMutation();

  const updateStatus = async (value: boolean) => {
    const prev = active;
    try {
      // optimistic update
      setActive(value);
      await updateStatusMut({
        userId: user.id,
        active: value,
      });
    } catch (error: any) {
      setActive(prev);
      toast({
        variant: "destructive",
        title: t("Error"),
        description: error?.response?.data?.message
          ? t(error?.response?.data?.message)
          : t("Something went wrong"),
      });
    }
  };

  const updateRole = async (value: string) => {
    const prev = role;
    try {
      // optimistic update
      setRole(value);
      await updateRoleMut({
        userId: user.id,
        role: value,
      });
    } catch (error: any) {
      setRole(prev);
      toast({
        variant: "destructive",
        title: t("Error"),
        description: error?.response?.data?.message
          ? t(error?.response?.data?.message)
          : t("Something went wrong"),
      });
    }
  };

  const { user: authUser } = useAuth();

  return isLoading ? (
    <Loading />
  ) : (
    <div className="align-center my-auto flex items-center justify-center">
      <Tabs
        value={tab}
        onValueChange={setTab}
        defaultValue="password"
        className="w-[400px]"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="password">{t("Password")}</TabsTrigger>
          <TabsTrigger value="profile">{t("Profile")}</TabsTrigger>
          <TabsTrigger value="settings" disabled={user.id === authUser?.id}>
            {t("Settings")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="password" className="h-[500px]">
          <Card>
            <CardHeader>
              <CardTitle className="rtl:text-right">{t("Password")}</CardTitle>
              <CardDescription className="rtl:text-right">
                {t(
                  "Resetting user password will log them out from all devices."
                )}
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
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-1 rtl:text-right">
                        <FormLabel>{t("New password")}</FormLabel>
                        <FormControl>
                          <Input
                            autoComplete="new-password"
                            type="password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  ></FormField>
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="space-y-1 rtl:text-right">
                        <FormLabel>{t("Confirm password")}</FormLabel>
                        <FormControl>
                          <Input
                            autoComplete="new-password"
                            type="password"
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
                      t("Reset Password")
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
        <TabsContent value="profile" className="h-[500px]">
          <Card>
            <CardHeader>
              <CardTitle className="rtl:text-right">{t("Profile")}</CardTitle>
              <CardDescription className="rtl:text-right">
                {t("Update user details.")}
              </CardDescription>
            </CardHeader>
            <UserForm user={user} />
          </Card>
        </TabsContent>
        <TabsContent value="settings" className="h-[500px]">
          <Card>
            <CardHeader>
              <CardTitle className="rtl:text-right">{t("Settings")}</CardTitle>
              <CardDescription className="rtl:text-right">
                {t(
                  "Update Role, Active status, or delete user from the system."
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 items-center">
                <Label htmlFor="active-status">{t("Active Status")}</Label>
                <div className="ml-auto">
                  <Switch
                    id="active-status"
                    checked={active}
                    onCheckedChange={updateStatus}
                  />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 items-center">
                <Label>{t("User Role")}</Label>
                <Select value={role} onValueChange={updateRole}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {t(role)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Separator />
            </CardContent>
            <CardFooter>
              <DeleteDialog onAction={async () => await deleteUser(user.id)}>
                <Button
                  variant={"delete"}
                  className="w-[50%] border border-border hover:border-none"
                >
                  <Trash2Icon className="mr-3 h-4 w-4 rtl:ml-3" />
                  {t("Delete User")}
                </Button>
              </DeleteDialog>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
