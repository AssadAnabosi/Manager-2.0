import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import FooterHoverCard from "@/components/component/footer-hover-card";
import SettingsGear from "@/components/component/settings-gear";
import { Brand } from "./brand";

/** Chrome for pages outside the app shell: login, logout, not-found, offline. */
const BareLayout = ({
  children,
  withSettings = false,
}: {
  children: ReactNode;
  /** Show the theme and language gear (login only). */
  withSettings?: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <div className="sticky inset-x-0 top-0 z-30 w-full border-b border-border">
        <div className="flex h-[47px] items-center justify-between px-4">
          <Brand label={t("Dashboard")} />
          {withSettings && <SettingsGear />}
        </div>
      </div>
      <div className="flex flex-grow flex-col space-y-2 px-4 pb-4 pt-2 print:px-2">
        {children}
      </div>
      <footer className="mx-auto text-sm">
        {t("Made with ❤️ by")} <FooterHoverCard />
      </footer>
    </div>
  );
};

export default BareLayout;
