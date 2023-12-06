import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

const RoleBadge = ({ role }: { role: string }) => {
  const { t } = useTranslation();
  return (
    <Badge className="inline-block h-[25px] w-full max-w-[130px] text-center">
      {t(role)}
    </Badge>
  );
};

export default RoleBadge;
