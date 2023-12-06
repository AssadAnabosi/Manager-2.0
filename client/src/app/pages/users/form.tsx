import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import useAxios from "@/hooks/use-axios";
import { useUserFormMutation } from "@/api/users";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { CardContent, CardFooter } from "@/components/ui/card";
import { DialogFooter } from "@/components/ui/dialog";

import Spinner from "@/components/component/spinner";
import { useToast } from "@/components/ui/use-toast";
import { UserType } from "@/lib/types";

const BASE_URL = "/users";

const UserForm = ({
  user,
  onClose,
  setOpen,
}: {
  user?: UserType;
  onClose?: (status: boolean) => void;
  setOpen?: (status: boolean) => void;
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const axios = useAxios();

  const userFormSchema = z
    .object({
      username: z.string().min(2, "Username is required."),
      firstName: z.string().min(1, "First name is required."),
      lastName: z.string().min(1, "Last name is required."),
      email: z.string(),
      phoneNumber: z.string(),
      password: z.any(),
      confirmPassword: z.any(),
    })
    .refine(
      async (data) => {
        if (user && data.username === user.username) return true;
        const { data: response } = await axios.post(
          `${BASE_URL}/check-username`,
          {
            username: data.username,
          }
        );
        return response.data.isAvailable;
      },
      {
        message: "Username is already taken.",
        path: ["username"],
      }
    )
    .refine(
      (data) => {
        if (!user && data.password && data.confirmPassword) {
          return data.password === data.confirmPassword;
        }
        return true;
      },
      {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      }
    );

  type userFormSchemaType = z.infer<typeof userFormSchema>;

  const userForm = useForm<userFormSchemaType>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: user?.username || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      password: "",
      confirmPassword: "",
    },
  });
  const isLoading = userForm.formState.isSubmitting;

  const { mutateAsync } = useUserFormMutation();

  const onSubmit = async (data: userFormSchemaType) => {
    try {
      if (!user) {
        await mutateAsync({ data });
        userForm.reset();
        setOpen?.(false);
        onClose?.(false);
      } else {
        await mutateAsync({ data, userId: user.id });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Something went wrong",
      });
    }
  };

  return (
    <Form {...userForm}>
      <form
        onSubmit={userForm.handleSubmit(onSubmit)}
        className={user ? "space-y-2" : "space-y-4"}
      >
        <CardWrapper user={user}>
          <FormField
            control={userForm.control}
            name="username"
            render={({ field }) => (
              <FormItem className="flex flex-col rtl:text-right">
                <FormLabel>{t("Username")}</FormLabel>
                <FormControl>
                  <Input {...field} type="string" className="input" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={userForm.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="flex flex-col rtl:text-right">
                <FormLabel>{t("First Name")}</FormLabel>
                <FormControl>
                  <Input {...field} type="string" className="input" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={userForm.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="flex flex-col rtl:text-right">
                <FormLabel>{t("Last Name")}</FormLabel>
                <FormControl>
                  <Input {...field} type="string" className="input" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={userForm.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex flex-col rtl:text-right">
                <FormLabel>{t("Email")}</FormLabel>
                <FormControl>
                  <Input {...field} type="string" className="input" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={userForm.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem className="flex flex-col rtl:text-right">
                <FormLabel>{t("Phone Number")}</FormLabel>
                <FormControl>
                  <Input {...field} type="string" className="input" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {user ? null : (
            <>
              <FormField
                control={userForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="flex flex-col rtl:text-right">
                    <FormLabel>{t("Password")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoComplete="new-password"
                        type="password"
                        className="input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={userForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="flex flex-col rtl:text-right">
                    <FormLabel>{t("Confirm Password")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoComplete="new-password"
                        type="password"
                        className="input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </CardWrapper>
        <ButtonWrapper user={user}>
          <Button type="submit" disabled={isLoading} className="w-[50%]">
            {isLoading ? (
              <Spinner className="h-4 w-4" />
            ) : !user ? (
              t("Create")
            ) : (
              t("Update")
            )}
          </Button>
        </ButtonWrapper>
      </form>
    </Form>
  );
};

const CardWrapper = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: UserType;
}) => {
  return user ? (
    <CardContent className="space-y-2">{children}</CardContent>
  ) : (
    <>{children}</>
  );
};

const ButtonWrapper = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: UserType;
}) => {
  return user ? (
    <CardFooter className="">{children}</CardFooter>
  ) : (
    <DialogFooter>{children}</DialogFooter>
  );
};

export default UserForm;
