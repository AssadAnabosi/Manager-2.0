import { ReactNode } from "react";

export default function MarginWidthWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen xl:ltr:ml-60 xl:rtl:mr-60 xl:ltr:print:m-0 xl:rtl:print:m-0">
      {children}
    </div>
  );
}
