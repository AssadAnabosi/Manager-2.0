import { Outlet } from "react-router-dom";
import Header from "@/components/navbar/header";
import HeaderMobile from "@/components/navbar/header-mobile";
import SideNav from "@/components/navbar/side-nav";
import PageWrapper from "@/components/navbar/page-wrapper";
import MarginWidthWrapper from "@/components/navbar/margin-width-wrapper";
import FooterHoverCard from "@/components/component/footer-hover-card";
import { useTranslation } from "react-i18next";
const Layout = () => {
  const { t } = useTranslation();
  return (
    <>
      <aside className="flex print:hidden">
        <SideNav />
      </aside>

      <div className="flex-1">
        <MarginWidthWrapper>
          <Header />
          <HeaderMobile />
          <PageWrapper>
            <Outlet />
          </PageWrapper>
          <footer className="footer text-sm mx-auto print:hidden">
            {t("Made with ❤️ by")} <FooterHoverCard />
          </footer>
        </MarginWidthWrapper>
      </div>
    </>
  );
};

export default Layout;
