import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectGroup,
  SelectContent,
  Select,
} from "@/components/ui/select";
import { useTheme, ThemeType } from "@/providers/theme-provider";
import { useTranslation } from "react-i18next";

function Settings() {
  const { t, i18n } = useTranslation();
  const { setTheme, theme } = useTheme();
  const lang = document.documentElement.lang.substring(0, 2);
  const [searchParams, setSearchParams] = useSearchParams({
    tab: "password",
  });
  const tabs = ["password", "preferences"];
  const tab = searchParams.get("tab") || "password";
  const setTab = (value: string) => {
    setSearchParams(
      (prev) => {
        prev.delete("tab");
        if (value && tabs.includes(value)) {
          prev.set("tab", value);
        } else prev.set("tab", "password");
        return prev;
      },
      { replace: true }
    );
  };
  const [input, setInput] = useState({
    theme: theme,
    lang: lang,
  });
  const handleThemeChange = (value: ThemeType) => {
    setInput({ ...input, theme: value });
  };
  const handleLanguageChange = (lang: string) => {
    setInput({ ...input, lang: lang.substring(0, 2) });
  };

  const handlePresencesChange = () => {
    // send to server
    // apply themes
    setTheme(input.theme);
    i18n.changeLanguage(input.lang);
    // if server fail return to previous state
  };

  return (
    <div className="flex justify-center items-center align-center my-auto">
      <Tabs
        value={tab}
        onValueChange={setTab}
        defaultValue="password"
        className="w-[400px]"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="password">{t("Password")}</TabsTrigger>
          <TabsTrigger value="preferences">{t("Preferences")}</TabsTrigger>
        </TabsList>
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle className="rtl:text-right">{t("Password")}</CardTitle>
              <CardDescription className="rtl:text-right">
                {t("Changing your password will log you out from all devices.")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1 rtl:text-right">
                <Label htmlFor="current">{t("Current password")}</Label>
                <Input id="current" type="password" />
              </div>
              <div className="space-y-1 rtl:text-right">
                <Label htmlFor="new">{t("New password")}</Label>
                <Input id="new" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>{t("Change Password")}</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="rtl:text-right">
                {t("Preferences")}
              </CardTitle>
              <CardDescription className="rtl:text-right">
                {t("Change your preferences.")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1 rtl:text-right">
                <Label htmlFor="theme">{t("ThemeType")}</Label>
                <Select onValueChange={handleThemeChange} defaultValue={theme}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup className="">
                      <SelectItem value="light">{t("Light")}</SelectItem>
                      <SelectItem value="dark">{t("Dark")}</SelectItem>
                      <SelectItem value="system">{t("System")}</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 rtl:text-right">
                <Label htmlFor="language">{t("Language")}</Label>
                <Select
                  onValueChange={handleLanguageChange}
                  defaultValue={input.lang}
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
            </CardContent>
            <CardFooter>
              <Button onClick={handlePresencesChange}>{t("Save")}</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Settings;
