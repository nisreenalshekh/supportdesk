import { AppWindow, KeyRound, Lock, Printer, Settings, Wifi } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Category } from "../types";

export const CATEGORY_ICON: Record<Category, LucideIcon> = {
  accounts: Lock,
  hardware: Printer,
  network: Wifi,
  software: AppWindow,
  access: KeyRound,
  other: Settings,
};
