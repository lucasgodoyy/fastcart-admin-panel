"use client";

import Link from "next/link";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type FieldHelperProps = {
  content: string;
  learnMoreHref?: string;
};

export function FieldHelper({ content, learnMoreHref }: FieldHelperProps) {
  return (
    <span className="ml-1.5 inline-flex items-center align-middle">
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex cursor-help text-muted-foreground hover:text-foreground" aria-label="Ajuda do campo">
              <Info className="h-3.5 w-3.5" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-64 text-xs leading-relaxed">
            <p>{content}</p>
            {learnMoreHref && (
              <Link href={learnMoreHref} className="mt-1 inline-block text-primary underline underline-offset-2">
                Saiba mais
              </Link>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </span>
  );
}