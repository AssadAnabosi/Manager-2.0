import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ListFilter } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Shown on a list page when its filters were put back from the last visit, so a forgotten
 * search never looks like "everything". Editing a filter or pressing Reset removes it.
 */
export function FiltersRestoredBanner() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname, state } = useLocation();
  if (!state?.filtersRestored) return null;
  return (
    <div className="bg-muted/50 mx-4 mt-2 flex items-center gap-3 rounded-lg border px-3 py-2 text-sm print:hidden">
      <ListFilter className="text-muted-foreground size-4 shrink-0" />
      <span className="flex-1">
        {t("Showing the filters from your last visit")}
      </span>
      <Button
        variant="outline"
        size="sm"
        className="h-7"
        onClick={() => navigate({ pathname }, { replace: true })}
      >
        {t("Reset")}
      </Button>
    </div>
  );
}
