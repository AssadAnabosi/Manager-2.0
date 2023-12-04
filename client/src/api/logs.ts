import { z } from "zod";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import useAxios from "@/hooks/use-axios";

import { useToast } from "@/components/ui/use-toast";

import { dateToString } from "@/lib/utils";

const BASE_URL = "/logs";

export const useGetLogsQuery = () => {
  const axios = useAxios();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get("filter");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  return useQuery({
    queryKey: ["logs", { filter, from, to }],
    queryFn: async () => {
      const { data: response } = await axios.get(`${BASE_URL}`, {
        params: {
          filter,
          from,
          to,
        },
      });
      return response.data;
    },
  });
};

export const useDeleteLogMutation = () => {
  const axios = useAxios();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => axios.delete(`${BASE_URL}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["logs"],
      });
      toast({
        variant: "success",
        title: t("Success"),
        description: t("Log was deleted successfully"),
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
export const logFormSchema = z
  .object({
    date: z.any({
      required_error: "Date is required",
    }),
    worker: z.string({
      required_error: "Please select a worker.",
    }),
    startingTime: z.string({
      required_error: "Starting time is required.",
    }),
    finishingTime: z.string({
      required_error: "Ending time is required.",
    }),
    isAbsent: z.boolean(),
    payment: z.string().refine(
      (payment) => {
        const number = Number(payment);
        return !isNaN(number) && payment?.length > 0;
      },
      { message: "Invalid number" }
    ),
    remarks: z.string().optional(),
  })
  .refine(
    (data) => {
      return !(!data.isAbsent && data.startingTime === "00:00");
    },
    {
      path: ["startingTime"],
      message: "Please Provide a valid time",
    }
  )
  .refine(
    (data) => {
      return !(!data.isAbsent && data.finishingTime === "00:00");
    },
    {
      path: ["finishingTime"],
      message: "Please Provide a valid time",
    }
  );

export type logFormSchemaType = z.infer<typeof logFormSchema>;

export const useLogFormMutation = () => {
  const axios = useAxios();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      data,
      logId,
    }: {
      data: logFormSchemaType;
      logId?: string;
    }) => {
      if (!logId) {
        return axios.post(`${BASE_URL}`, {
          ...data,
          date: dateToString(data.date),
        });
      } else {
        return axios.put(`${BASE_URL}/${logId}`, {
          ...data,
          worker: undefined,
          date: undefined,
        });
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["logs"],
      });
      if (data.status === 201)
        toast({
          variant: "success",
          title: t("Success"),
          description: t("Log was added successfully"),
        });
      else
        toast({
          variant: "success",
          title: t("Success"),
          description: t("Log was updated successfully"),
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
