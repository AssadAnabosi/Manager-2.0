import { z } from "zod";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import useAxios from "@/hooks/use-axios";

import { useToast } from "@/components/ui/use-toast";

import { dateToString } from "@/lib/utils";

const BASE_URL = "/cheques";

export const useGetChequesQuery = () => {
  const axios = useAxios();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get("filter");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const serial = searchParams.get("serial");

  return useQuery({
    queryKey: ["cheques", { filter, from, to, serial }],
    queryFn: async () => {
      const { data: response } = await axios.get(`${BASE_URL}`, {
        params: {
          filter,
          from,
          to,
          serial,
        },
      });
      return response.data;
    },
  });
};

export const useDeleteChequeMutation = () => {
  const axios = useAxios();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => axios.delete(`${BASE_URL}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cheques"],
      });
      toast({
        variant: "success",
        title: t("Success"),
        description: t("Cheque was deleted successfully"),
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
export const chequeFormSchema = z.object({
  dueDate: z.any({
    required_error: "Due Date is required",
  }),
  payee: z
    .string({
      required_error: "Please select a payee.",
    })
    .optional(),
  serial: z.string().refine(
    (value) => {
      const number = Number(value);
      return !isNaN(number) && value?.length > 0 && number > 0;
    },
    { message: "Invalid number" }
  ),
  value: z.string().refine(
    (value) => {
      const number = Number(value);
      return !isNaN(number) && value?.length > 0;
    },
    { message: "Invalid number" }
  ),
  isCancelled: z.boolean(),
  remarks: z.string().optional(),
});
// .refine(
//   (data) => {
//     return !(!data.isCancelled && !data.payee);
//   },
//   {
//     path: ["payee"],
//     message: "Please select a payee.",
//   }
// );

export type chequeFormSchemaType = z.infer<typeof chequeFormSchema>;

export const useChequeFormMutation = () => {
  const axios = useAxios();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      data,
      chequeId,
    }: {
      data: chequeFormSchemaType;
      chequeId?: string;
    }) => {
      if (!chequeId) {
        return axios.post(`${BASE_URL}`, {
          ...data,
          dueDate: dateToString(data.dueDate),
        });
      } else {
        return axios.put(`${BASE_URL}/${chequeId}`, {
          ...data,
          dueDate: dateToString(data.dueDate),
        });
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["cheques"],
      });
      if (data.status === 201)
        toast({
          variant: "success",
          title: t("Success"),
          description: t("Cheque was added successfully"),
        });
      else
        toast({
          variant: "success",
          title: t("Success"),
          description: t("Cheque was updated successfully"),
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
