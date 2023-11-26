import { useState } from "react";
import {
  PopoverTrigger,
  PopoverContent,
  Popover,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectGroup,
  SelectContent,
  Select,
} from "@/components/ui/select";
import { GearIcon } from "@radix-ui/react-icons";
import { useTheme } from "@/providers/theme-provider";
import { ThemeType } from "@/types";
import { useTranslation } from "react-i18next";

function SettingsGear() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang.substring(0, 2));
    setOpen(false);
  };
  const { setTheme, theme } = useTheme();
  const lang = document.documentElement.lang.substring(0, 2);
  const handleThemeChange = (value: ThemeType) => {
    setTheme(value);
  };
  return (
    <div className="absolute top-[25%] ltr:right-8 rtl:left-8">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <GearIcon className="h-7 w-7" />
        </PopoverTrigger>
        <PopoverContent className="w-96">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">{t("Settings")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("Adjust your application settings.")}
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4 w-full">
                <Label htmlFor="theme">{t("ThemeType")}</Label>
                <Select onValueChange={handleThemeChange} defaultValue={theme}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="light">{t("Light")}</SelectItem>
                      <SelectItem value="dark">{t("Dark")}</SelectItem>
                      <SelectItem value="system">{t("System")}</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="language">{t("Language")}</Label>
                <Select
                  onValueChange={handleLanguageChange}
                  defaultValue={lang}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default SettingsGear;
