import { z } from "zod";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import useAxios from "@/hooks/use-axios";

import { useToast } from "@/components/ui/use-toast";

import { dateToString } from "@/lib/utils";

const BASE_URL = "/bills";

export const useGetBillsQuery = () => {
  const axios = useAxios();
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  return useQuery({
    queryKey: ["bills", { search, from: from, to: to }],
    queryFn: async () => {
      const { data: response } = await axios.get(`${BASE_URL}`, {
        params: {
          search,
          from: from,
          to: to,
        },
      });
      return response.data;
    },
  });
};

export const useDeleteBillMutation = () => {
  const axios = useAxios();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => axios.delete(`${BASE_URL}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bills"],
      });
      toast({
        variant: "success",
        title: t("Success"),
        description: t("Bill was deleted successfully"),
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Something went wrong",
      });
    },
  });
};

export const billFormSchema = z.object({
  date: z.any({
    required_error: "Date is required",
  }),
  value: z.string().refine(
    (value) => {
      const number = Number(value);
      return !isNaN(number) && value?.length > 0;
    },
    { message: "Invalid number" }
  ),
  description: z.string().min(1, "Description is required"),
  remarks: z.string().optional(),
});

export type billFormSchemaType = z.infer<typeof billFormSchema>;

export const useBillFormMutation = () => {
  const axios = useAxios();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      data,
      billId,
    }: {
      data: billFormSchemaType;
      billId?: string;
    }) => {
      if (!billId) {
        return axios.post(`${BASE_URL}`, {
          ...data,
          date: dateToString(data.date),
        });
      } else {
        return axios.put(`${BASE_URL}/${billId}`, {
          ...data,
          date: dateToString(data.date),
        });
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["bills"],
      });
      if (data.status === 201)
        toast({
          variant: "success",
          title: t("Success"),
          description: t("Bill was added successfully"),
        });
      else
        toast({
          variant: "success",
          title: t("Success"),
          description: t("Bill was updated successfully"),
        });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Something went wrong",
      });
    },
  });
};
