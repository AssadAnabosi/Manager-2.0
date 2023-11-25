import { ReactNode, useEffect, useRef, useState } from "react";

import { Link, useLocation } from "react-router-dom";

import { SIDENAV_ITEMS, SideNavItem } from "./nav-items";
import { motion, useCycle } from "framer-motion";

import { ChevronDownIcon } from "@radix-ui/react-icons";
import { t } from "i18next";

type MenuItemWithSubMenuProps = {
  item: SideNavItem;
  toggleOpen: () => void;
};

const sidebar = {
  open: (height = 1000) => ({
    clipPath:
      document.documentElement.dir === "ltr"
        ? `circle(${height * 2 + 200}px at 100% 0)`
        : `circle(${height * 2 + 200}px at 0% 0)`,
    transition: {
      type: "spring",
      stiffness: 20,
      restDelta: 2,
    },
  }),
  closed: {
    clipPath:
      document.documentElement.dir === "ltr"
        ? "circle(0px at 100% 0)"
        : "circle(0px at 0% 0)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 40,
    },
  },
};

const HeaderMobile = () => {
  const pathname = useLocation().pathname;
  const containerRef = useRef(null);
  const { height } = useDimensions(containerRef);
  const [isOpen, toggleOpen] = useCycle(false, true);

  return (
    <motion.nav
      initial={false}
      animate={isOpen ? "open" : "closed"}
      custom={height}
      className={`fixed inset-0 z-50 w-full xl:hidden ${
        isOpen ? "" : "pointer-events-none"
      }`}
      ref={containerRef}
    >
      <motion.div
        className="absolute inset-0 w-full bg-inverse ltr:right-0 rtl:left-0"
        variants={sidebar}
      />
      <motion.ul
        variants={variants}
        className="absolute grid w-full gap-3 px-10 py-16 max-h-screen overflow-y-auto"
      >
        {SIDENAV_ITEMS.map((item, idx) => {
          const isLastItem = idx === SIDENAV_ITEMS.length - 1; // Check if it's the last item

          return (
            <div key={idx}>
              {item.submenu ? (
                <MenuItemWithSubMenu item={item} toggleOpen={toggleOpen} />
              ) : (
                <MenuItem>
                  <Link
                    to={item.path}
                    onClick={() => toggleOpen()}
                    className={`flex w-full text-2xl text-inverse-foreground ${
                      item.path === pathname ? "font-bold" : ""
                    }`}
                  >
                    {t(item.title)}
                  </Link>
                </MenuItem>
              )}

              {!isLastItem && (
                <MenuItem className="my-3 h-px w-full bg-gray-300" />
              )}
            </div>
          );
        })}
      </motion.ul>
      <MenuToggle toggle={toggleOpen} />
    </motion.nav>
  );
};

export default HeaderMobile;

const MenuToggle = ({ toggle }: { toggle: any }) => (
  <button
    onClick={toggle}
    className="pointer-events-auto absolute top-[14px] z-30 ltr:right-4 rtl:left-4"
  >
    <svg width="23" height="23" viewBox="0 0 23 23">
      <Path
        stroke={"hsl(var(--inverse))"}
        variants={{
          closed: { d: "M 2 2.5 L 20 2.5" },
          open: {
            d: "M 3 16.5 L 17 2.5",
            stroke: "hsl(var(--inverse-foreground))",
          },
        }}
      />
      <Path
        stroke={"hsl(var(--inverse))"}
        d="M 2 9.423 L 20 9.423"
        variants={{
          closed: { opacity: 1 },
          open: { opacity: 0, stroke: "hsl(var(--inverse-foreground))" },
        }}
        transition={{ duration: 0.1 }}
      />
      <Path
        stroke={"hsl(var(--inverse))"}
        variants={{
          closed: { d: "M 2 16.346 L 20 16.346" },
          open: {
            d: "M 3 2.5 L 17 16.346",
            stroke: "hsl(var(--inverse-foreground))",
          },
        }}
      />
    </svg>
  </button>
);

const Path = (props: any) => (
  <motion.path
    fill="transparent"
    strokeWidth="2"
    strokeLinecap="round"
    {...props}
  />
);

const MenuItem = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => {
  return (
    <motion.li variants={MenuItemVariants} className={className}>
      {children}
    </motion.li>
  );
};

const MenuItemWithSubMenu: React.FC<MenuItemWithSubMenuProps> = ({
  item,
  toggleOpen,
}) => {
  const pathname = useLocation().pathname;
  const [subMenuOpen, setSubMenuOpen] = useState(false);

  return (
    <>
      <MenuItem>
        <button
          className="flex w-full text-2xl"
          onClick={() => setSubMenuOpen(!subMenuOpen)}
        >
          <div className="flex flex-row justify-between w-full items-center bg-inverse text-inverse-foreground">
            <span
              className={`${pathname.includes(item.path) ? "font-bold" : ""}`}
            >
              {t(item.title)}
            </span>
            <div className={`${subMenuOpen && "rotate-180"}`}>
              <ChevronDownIcon className="w-5 h-5" />
            </div>
          </div>
        </button>
      </MenuItem>
      <div className="mt-2 ml-2 flex flex-col space-y-2 text-inverse-foreground">
        {subMenuOpen && (
          <>
            {item.subMenuItems?.map((subItem, subIdx) => {
              return (
                <MenuItem key={subIdx}>
                  <Link
                    to={subItem.path}
                    onClick={() => toggleOpen()}
                    className={` ${
                      subItem.path === pathname ? "font-bold" : ""
                    }`}
                  >
                    {t(subItem.title)}
                  </Link>
                </MenuItem>
              );
            })}
          </>
        )}
      </div>
    </>
  );
};

const MenuItemVariants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 },
      duration: 0.02,
    },
  },
};

const variants = {
  open: {
    transition: { staggerChildren: 0.02, delayChildren: 0.15 },
  },
  closed: {
    transition: { staggerChildren: 0.01, staggerDirection: -1 },
  },
};

const useDimensions = (ref: any) => {
  const dimensions = useRef({ width: 0, height: 0 });

  useEffect(() => {
    if (ref.current) {
      dimensions.current.width = ref.current.offsetWidth;
      dimensions.current.height = ref.current.offsetHeight;
    }
  }, [ref]);

  return dimensions.current;
};
