import * as z from "zod";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import useAxios from "@/hooks/use-axios";

import { useToast } from "@/components/ui/use-toast";

const BASE_URL = "/users";

export const useGetUsersQuery = () => {
  const axios = useAxios();
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  return useQuery({
    queryKey: [
      "users",
      {
        search,
      },
    ],
    queryFn: async () => {
      const { data: response } = await axios.get(`${BASE_URL}`, {
        params: { search },
      });
      return response.data;
    },
  });
};

export const useDeleteUserMutation = () => {
  const axios = useAxios();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { toast } = useToast();
  const Navigate = useNavigate();
  return useMutation({
    mutationFn: (id: string) => axios.delete(`${BASE_URL}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      toast({
        variant: "success",
        title: t("Success"),
        description: t("User was deleted successfully"),
      });
      Navigate("/users", { replace: true });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t("Error"),
        description: error?.response?.data?.message
          ? t(error?.response?.data?.message)
          : t("Something went wrong"),
      });
    },
  });
};

export const useGetUserQuery = () => {
  const axios = useAxios();
  const { userId } = useParams();
  const Navigate = useNavigate();
  return useQuery({
    queryKey: [{ userId }],
    queryFn: async () => {
      try {
        const { data: response } = await axios.get(`${BASE_URL}/${userId}`);
        return response.data;
      } catch (error: any) {
        Navigate("/users", { replace: true });
      }
    },
  });
};

export const updatePasswordSchema = z
  .object({
    username: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type updatePasswordSchemaType = z.infer<typeof updatePasswordSchema>;

export const useUpdatePasswordMutation = () => {
  const axios = useAxios();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      data,
      userId,
    }: {
      data: updatePasswordSchemaType;
      userId: string;
    }) => {
      {
        return axios.patch(`${BASE_URL}/${userId}/password`, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      toast({
        variant: "success",
        title: t("Success"),
        description: t("User's Password was reset successfully"),
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t("Error"),
        description: error?.response?.data?.message
          ? t(error?.response?.data?.message)
          : t("Something went wrong"),
      });
    },
  });
};

export const useUpdateUserStatusMutation = () => {
  const axios = useAxios();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ userId, active }: { userId: string; active: boolean }) => {
      return axios.patch(`${BASE_URL}/${userId}/status`, {
        active,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      toast({
        variant: "success",
        title: t("Success"),
        description: t("User's Status was updated successfully"),
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t("Error"),
        description: error?.response?.data?.message
          ? t(error?.response?.data?.message)
          : t("Something went wrong"),
      });
    },
  });
};

export const useUpdateUserRoleMutation = () => {
  const axios = useAxios();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => {
      return axios.patch(`${BASE_URL}/${userId}/role`, {
        role,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      toast({
        variant: "success",
        title: t("Success"),
        description: t("User's Role was updated successfully"),
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t("Error"),
        description: error?.response?.data?.message
          ? t(error?.response?.data?.message)
          : t("Something went wrong"),
      });
    },
  });
};

export const useUserFormMutation = () => {
  const axios = useAxios();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ data, userId }: { data: any; userId?: string }) => {
      if (!userId) {
        return axios.post(`${BASE_URL}`, {
          ...data,
          confirmPassword: undefined,
        });
      } else {
        return axios.put(`${BASE_URL}/${userId}`, {
          ...data,
          password: undefined,
          confirmPassword: undefined,
        });
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      if (data.status === 201) {
        toast({
          variant: "success",
          title: t("Success"),
          description: t("User was added successfully"),
        });
      } else {
        toast({
          variant: "success",
          title: t("Success"),
          description: t("User was updated successfully"),
        });
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t("Error"),
        description: error?.response?.data?.message
          ? t(error?.response?.data?.message)
          : t("Something went wrong"),
      });
    },
  });
};
