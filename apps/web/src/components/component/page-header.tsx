import { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  /** Page actions: filters, the Add button, Print. */
  children?: ReactNode;
};

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-5 space-y-2 md:flex-row">
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      {children && (
        <div className="flex flex-col items-center gap-2 md:flex-row">
          {children}
        </div>
      )}
    </div>
  );
}
