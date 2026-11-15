import { useEffect, useState } from "react";
import { apiErrorText } from "@/lib/api-error";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  useGetUserQuery,
  updatePasswordSchema,
  updatePasswordSchemaType,
  useUpdatePasswordMutation,
  useUpdateUserLoggableMutation,
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
import UserForm from "./user-form";

import { ROLES } from "@/lib/constants";

import { Trash2Icon } from "lucide-react";
import { UserType } from "@/lib/types";
import { useAuth, useLogout } from "@/providers/auth-context";
import { useError } from "@/providers/error-provider";
import ConfirmDialog from "@/components/component/confirm-dialog";

export default function Edit() {
  // const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [isLoading, setIsLoading] = useState(true);
  const [active, setActive] = useState(false);
  const [loggable, setLoggable] = useState(true);
  const [role, setRole] = useState("user");
  const { t } = useTranslation();
  const { user: authUser } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();
  const { setError } = useError();
  const [pendingPassword, setPendingPassword] =
    useState<updatePasswordSchemaType | null>(null);
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
      setLoggable(user.loggable);
      setRole(user.role);
      setIsLoading(false);
    }
  }, [user]);

  const { mutateAsync } = useUpdatePasswordMutation();
  const updatePassword = async (data: updatePasswordSchemaType) => {
    try {
      await mutateAsync({ data, userId: user?.id });
      passwordForm.reset();
      if (user?.id === authUser?.id) {
        // resetting your own password revokes your own sessions too
        setError({
          title: "Password changed successfully",
          description: "Please login again.",
        });
        await logout(false);
        navigate("/", { replace: true });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("Error"),
        description: apiErrorText(error, t),
      });
    }
  };

  const { mutateAsync: updateStatusMut } = useUpdateUserStatusMutation();
  const { mutateAsync: updateLoggableMut } = useUpdateUserLoggableMutation();
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
        description: apiErrorText(error, t),
      });
    }
  };

  const updateLoggable = async (value: boolean) => {
    const prev = loggable;
    try {
      // optimistic update
      setLoggable(value);
      await updateLoggableMut({ userId: user.id, loggable: value });
    } catch (error: any) {
      setLoggable(prev);
      toast({
        variant: "destructive",
        title: t("Error"),
        description: apiErrorText(error, t),
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
        description: apiErrorText(error, t),
      });
    }
  };

  return isLoading ? (
    <Loading />
  ) : (
    <div className="align-center my-auto flex items-center justify-center">
      <Tabs
        value={tab}
        onValueChange={setTab}
        defaultValue="password"
        className="w-full max-w-[400px]"
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
              <CardTitle>{t("Password")}</CardTitle>
              <CardDescription>
                {t(
                  "Resetting user password will log them out from all devices."
                )}
              </CardDescription>
            </CardHeader>
            <Form {...passwordForm}>
              <form
                className="flex flex-col gap-6"
                onSubmit={passwordForm.handleSubmit((data) =>
                  setPendingPassword(data)
                )}
              >
                <CardContent className="space-y-4">
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
                            disabled={passwordForm.formState.isSubmitting}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>{t("New password")}</FormLabel>
                        <FormControl>
                          <Input
                            autoComplete="new-password"
                            type="password"
                            {...field}
                            disabled={passwordForm.formState.isSubmitting}
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
                      <FormItem className="space-y-2">
                        <FormLabel>{t("Confirm password")}</FormLabel>
                        <FormControl>
                          <Input
                            autoComplete="new-password"
                            type="password"
                            {...field}
                            disabled={passwordForm.formState.isSubmitting}
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
            <ConfirmDialog
              open={pendingPassword !== null}
              onOpenChange={(open) => !open && setPendingPassword(null)}
              title={t("Reset password?")}
              description={
                user?.id === authUser?.id
                  ? t(
                      "You will be logged out from all your devices, including this one, and will need to log in again with your new password."
                    )
                  : t(
                      "{{name}} will be logged out from all devices where they are signed in.",
                      { name: user?.fullName }
                    )
              }
              confirmLabel={t("Reset Password")}
              onConfirm={async () => {
                if (pendingPassword) await updatePassword(pendingPassword);
              }}
            />
          </Card>
        </TabsContent>
        <TabsContent value="profile" className="h-[500px]">
          <Card>
            <CardHeader>
              <CardTitle>{t("Profile")}</CardTitle>
              <CardDescription>{t("Update user details.")}</CardDescription>
            </CardHeader>
            <UserForm user={user} />
          </Card>
        </TabsContent>
        <TabsContent value="settings" className="h-[500px]">
          <Card>
            <CardHeader>
              <CardTitle>{t("Settings")}</CardTitle>
              <CardDescription>
                {t(
                  "Update Role, Active status, Loggable, or delete user from the system."
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 items-center">
                <Label htmlFor="active-status">{t("Active Status")}</Label>
                <div className="ms-auto">
                  <Switch
                    id="active-status"
                    checked={active}
                    onCheckedChange={updateStatus}
                  />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 items-center gap-x-4">
                <div className="space-y-1">
                  <Label htmlFor="loggable">{t("Loggable")}</Label>
                  <p className="text-muted-foreground text-xs">
                    {t(
                      "Offered as the worker of a new worksheet and in the worker lists. Still found when searched, except when adding a worksheet."
                    )}
                  </p>
                </div>
                <div className="ms-auto">
                  <Switch
                    id="loggable"
                    checked={loggable}
                    onCheckedChange={updateLoggable}
                  />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 items-center">
                <Label>{t("User Role")}</Label>
                <Select value={role} onValueChange={updateRole}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t("Theme")} />
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
                  className="border-border w-[50%] border hover:border-none"
                >
                  <Trash2Icon className="me-3 h-4 w-4" />
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
