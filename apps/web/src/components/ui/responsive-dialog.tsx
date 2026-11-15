import * as React from "react";

import { cn } from "@/lib/utils";
import { useIsDesktop } from "@/hooks/use-breakpoint";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";

const DesktopContext = React.createContext(true);

type RootProps = React.ComponentProps<typeof Dialog>;

const ResponsiveDialog = (props: RootProps) => {
  const isDesktop = useIsDesktop();
  const Root = isDesktop ? Dialog : Drawer;
  return (
    <DesktopContext.Provider value={isDesktop}>
      <Root {...props} />
    </DesktopContext.Provider>
  );
};

const useDesktop = () => React.useContext(DesktopContext);

const ResponsiveDialogTrigger = (
  props: React.ComponentProps<typeof DialogTrigger>
) => {
  const Trigger = useDesktop() ? DialogTrigger : DrawerTrigger;
  return <Trigger {...props} />;
};

const ResponsiveDialogClose = (
  props: React.ComponentProps<typeof DialogClose>
) => {
  const Close = useDesktop() ? DialogClose : DrawerClose;
  return <Close {...props} />;
};

const ResponsiveDialogContent = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogContent>) => {
  if (useDesktop()) {
    return (
      <DialogContent className={cn("sm:max-w-[425px]", className)} {...props}>
        {children}
      </DialogContent>
    );
  }
  return (
    <DrawerContent className={className} {...props}>
      {children}
    </DrawerContent>
  );
};

const ResponsiveDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const Header = useDesktop() ? DialogHeader : DrawerHeader;
  return <Header className={cn("pt-6 text-start", className)} {...props} />;
};

const ResponsiveDialogTitle = (
  props: React.ComponentProps<typeof DialogTitle>
) => {
  const Title = useDesktop() ? DialogTitle : DrawerTitle;
  return <Title {...props} />;
};

const ResponsiveDialogDescription = (
  props: React.ComponentProps<typeof DialogDescription>
) => {
  const Description = useDesktop() ? DialogDescription : DrawerDescription;
  return <Description {...props} />;
};

/** px-4 + scroll on mobile, plain wrapper on desktop. */
const ResponsiveDialogBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  if (useDesktop()) return <div className={className} {...props} />;
  return (
    <ScrollArea className="overflow-y-auto">
      <div className={cn("px-4 pb-4", className)} {...props} />
    </ScrollArea>
  );
};

const ResponsiveDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  if (useDesktop()) {
    return <DialogFooter className={className} {...props} />;
  }
  return <DrawerFooter className={cn("px-4 pt-2 pb-6", className)} {...props} />;
};

export {
  ResponsiveDialog,
  ResponsiveDialogTrigger,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogBody,
  ResponsiveDialogFooter,
};
