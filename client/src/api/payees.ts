import { z } from "zod";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import useAxios from "@/hooks/use-axios";

import { useToast } from "@/components/ui/use-toast";

const BASE_URL = "/payees";

export const useGetPayeesQuery = () => {
  const axios = useAxios();
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  return useQuery({
    queryKey: [
      "payees",
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

export const useDeletePayeeMutation = () => {
  const axios = useAxios();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => axios.delete(`${BASE_URL}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["payees"],
      });
      toast({
        variant: "success",
        title: t("Success"),
        description: t("Payee was deleted successfully"),
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

export const payeeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().optional(),
  phoneNumber: z.string().optional(),
  remarks: z.string().optional(),
});

export type payeeFormSchemaType = z.infer<typeof payeeFormSchema>;

export const usePayeeFormMutation = () => {
  const axios = useAxios();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      data,
      payeeId,
    }: {
      data: payeeFormSchemaType;
      payeeId?: string;
    }) => {
      if (!payeeId) {
        return axios.post(`${BASE_URL}`, data);
      } else {
        return axios.put(`${BASE_URL}/${payeeId}`, data);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["payees"],
      });
      if (data.status === 201)
        toast({
          variant: "success",
          title: t("Success"),
          description: t("Payee was added successfully"),
        });
      else
        toast({
          variant: "success",
          title: t("Success"),
          description: t("Payee was updated successfully"),
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
