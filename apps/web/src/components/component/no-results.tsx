import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Inbox, SearchX } from "lucide-react";

import { useFilterState } from "@/hooks/use-url-state";
import { Button } from "@/components/ui/button";

type Props = {
  /** The URL parameters that narrow the list; when any is set the list is "filtered". */
  filterKeys?: string[];
  /** Shown when nothing matches because there are no records yet, e.g. the "Add New" button. */
  action?: ReactNode;
  /** Offered next to "Clear filters" when the filters match nothing. */
  filteredAction?: ReactNode;
};

/**
 * An empty list. With filters applied it says nothing matches and offers to clear them;
 * otherwise it says there is nothing yet and offers the page's primary action.
 */
const NoResults = ({ filterKeys = [], action, filteredAction }: Props) => {
  const { t } = useTranslation();
  const { active, clear } = useFilterState(filterKeys);
  const Icon = active ? SearchX : Inbox;
  return (
    <div className="flex min-h-[335px] flex-col items-center justify-center gap-3 py-8 text-center">
      <Icon size={36} absoluteStrokeWidth className="text-muted-foreground" />
      <div className="space-y-1">
        <p className="text-xl font-semibold">
          {active ? t("No Matching Results Found") : t("Nothing here yet")}
        </p>
        <p className="text-muted-foreground text-sm">
          {active
            ? t("Try changing or clearing the filters.")
            : t("Records you add will show up here.")}
        </p>
      </div>
      {active ? (
        <div className="flex flex-wrap justify-center gap-2 print:hidden">
          {filteredAction}
          <Button variant="outline" onClick={clear}>
            {t("Clear filters")}
          </Button>
        </div>
      ) : (
        action
      )}
    </div>
  );
};

export default NoResults;
