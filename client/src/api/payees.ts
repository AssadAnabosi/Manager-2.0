// import { z } from "zod";
// import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
// useQueryClient, useMutation
// import { useTranslation } from "react-i18next";

import useAxios from "@/hooks/use-axios";

// import { useToast } from "@/components/ui/use-toast";

const BASE_URL = "/payees";

export const useGetPayeesListQuery = () => {
  const axios = useAxios();
  return useQuery({
    queryKey: ["payees"],
    queryFn: async () => {
      const { data: response } = await axios.get(`${BASE_URL}`);
      return response.data;
    },
  });
};
