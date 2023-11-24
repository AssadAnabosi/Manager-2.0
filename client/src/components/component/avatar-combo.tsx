import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const AvatarCombo = ({
  fallback,
  title,
  description,
}: {
  fallback: React.ReactNode | string;
  title: string;
  description?: string | JSX.Element;
}) => {
  return (
    <div className="flex items-center">
      <Avatar className="h-9 w-9">
        <AvatarImage alt="Avatar" />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      <div className="ml-4 space-y-1">
        <p className="text-sm font-medium leading-none">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default AvatarCombo;
