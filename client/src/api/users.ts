import { useSearchParams } from "react-router-dom";
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
    queryKey: ["users"],
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
