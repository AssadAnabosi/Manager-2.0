import {
  EnvelopeClosedIcon,
  GitHubLogoIcon,
  LinkedInLogoIcon,
  // SewingPinFilledIcon,
} from "@radix-ui/react-icons";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export default function FooterHoverCard() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild className="px-0">
        <Button variant="link" asChild>
          <a href="https://assad.anabosi.com" target="_blank">
            @assadanabosi
          </a>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent style={{ direction: "ltr" }}>
        <div className="flex space-x-4">
          <Avatar className="aspect-square">
            <AvatarImage src="/avatar.jpeg" />
            <AvatarFallback>AA</AvatarFallback>
          </Avatar>
          <div className="space-y">
            <h4 className="text-sm font-semibold">Assad Anabosi</h4>
            <p className="text-xs text-muted-foreground">
              CSE Student at Arab American University
            </p>
            <div className="flex items-center gap-3">
              <Button asChild variant="link" className="p-0">
                <a href="https://linkedin.com/in/assadanabosi" target="_blank">
                  <LinkedInLogoIcon className="mr-2 h-4 w-4 opacity-70" />
                </a>
              </Button>
              <Button asChild variant="link" className="p-0">
                <a href="https://github.com/assadanabosi" target="_blank">
                  <GitHubLogoIcon className="mr-2 h-4 w-4 opacity-70" />
                </a>
              </Button>
              <Button asChild variant="link" className="p-0">
                <a href="mailto:assad@anabosi.com">
                  <EnvelopeClosedIcon className="mr-2 h-4 w-4 opacity-70" />
                </a>
              </Button>
            </div>
            {/* <div className="flex items-center">
              <SewingPinFilledIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
              <span className="text-xs text-muted-foreground">
                Palestine, Jenin
              </span>
            </div> */}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
