// NOTE: See stock icons at: https://lucide.dev/icons/

// Data definitions: node_modules/lucide-react/dist/lucide-react.d.ts

import React from 'react';
import * as icons from 'lucide-react';

import { IconProps, IconType } from './IconTypes';

// Stock lucide icons...
export const {
  Activity,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BookOpenCheck,
  Bot,
  Braces,
  ListFilter,
  Filter,
  // Funnel,
  Bug,
  CalendarDays,
  ChartNoAxesGantt,
  Check,
  CheckIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleCheck,
  CircleUserRound,
  Clock,
  Columns3,
  Copy,
  Dot,
  ExternalLink,
  Eye,
  EyeOff,
  FileQuestion,
  Flag,
  FlaskConical,
  FolderKanban,
  Hand,
  Hash,
  Home,
  Info,
  Languages,
  Laptop,
  LayoutDashboard,
  Library,
  LineChart,
  ListChecks,
  LogOut,
  Menu,
  MessageCircleQuestion,
  Minus,
  MonitorPlay,
  Moon,
  Package,
  PanelLeft,
  PanelLeftClose,
  PanelRightClose,
  Pencil,
  Play,
  Plus,
  Rows3,
  Save,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  SquareChartGantt,
  SquareDashedKanban,
  SquareLibrary,
  Tags,
  Trash,
  User,
  WandSparkles,
  XIcon,
} = icons;

// Renamed icons...
export const Add = icons.Plus;
export const AllTopics = icons.SquareLibrary;
export const Answers = icons.ListChecks;
export const Billing = icons.CreditCard;
export const Close = icons.X;
export const Dashboard = icons.LayoutPanelLeft;
export const Edit = icons.Pencil;
export const Ellipsis = icons.MoreVertical;
export const Help = icons.HelpCircle;
export const Logo = icons.Puzzle;
export const Logout = icons.LogOut;
export const Media = icons.Image;
export const MenuVertical = icons.EllipsisVertical;
export const Messages = icons.MessagesSquare;
export const Page = icons.File;
export const Post = icons.FileText;
export const Questions = icons.ListTodo;
export const Refresh = icons.RefreshCw;
export const Remove = icons.Minus;
export const Spinner = icons.Loader2;
export const Sun = icons.SunMedium;
export const Topics = icons.Library;
export const Warning = icons.AlertTriangle;

// Custom icons...
export const Github: IconType = ({ ...props }: IconProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    data-prefix="fab"
    data-icon="github"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 496 512"
    {...props}
  >
    <path
      fill="currentColor"
      d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
    />
  </svg>
);
export const Yandex: IconType = ({ ...props }: IconProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    data-prefix="fab"
    data-icon="yandex"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 512"
    {...props}
  >
    {/*!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.*/}
    <path
      d="M153.1 315.8L65.7 512H2l96-209.8c-45.1-22.9-75.2-64.4-75.2-141.1C22.7 53.7 90.8 0 171.7 0H254v512h-55.1V315.8h-45.8zm45.8-269.3h-29.4c-44.4 0-87.4 29.4-87.4 114.6 0 82.3 39.4 108.8 87.4 108.8h29.4V46.5z"
      fill="currentColor"
    />
  </svg>
);
export const Google: IconType = ({ ...props }: IconProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    data-prefix="fab"
    data-icon="google"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 488 512"
    {...props}
  >
    <path
      d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
      fill="currentColor"
    />
  </svg>
);
export const NextJs: IconType = ({ ...props }: IconProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    data-prefix="fab"
    data-icon="nextjs"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 15 15"
    {...props}
  >
    <path
      fill="currentColor"
      d="m4.5 4.5l.405-.293A.5.5 0 0 0 4 4.5zm3 9.5A6.5 6.5 0 0 1 1 7.5H0A7.5 7.5 0 0 0 7.5 15zM14 7.5A6.5 6.5 0 0 1 7.5 14v1A7.5 7.5 0 0 0 15 7.5zM7.5 1A6.5 6.5 0 0 1 14 7.5h1A7.5 7.5 0 0 0 7.5 0zm0-1A7.5 7.5 0 0 0 0 7.5h1A6.5 6.5 0 0 1 7.5 1zM5 12V4.5H4V12zm-.905-7.207l6.5 9l.81-.586l-6.5-9zM10 4v6h1V4z"
    />
  </svg>
);
export const Twitter: IconType = ({ ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
    data-prefix="fab"
    data-icon="twitter"
    role="img"
    {...props}
  >
    <path
      d="M14.258 10.152L23.176 0h-2.113l-7.747 8.813L7.133 0H0l9.352 13.328L0 23.973h2.113l8.176-9.309 6.531 9.309h7.133zm-2.895 3.293l-.949-1.328L2.875 1.56h3.246l6.086 8.523.945 1.328 7.91 11.078h-3.246zm0 0"
      fill="currentColor"
    />
  </svg>
);
export const Telegram: IconType = ({ ...props }: IconProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    data-prefix="fab"
    data-icon="telegram"
    viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M477,43.86,13.32,223.29a5.86,5.86,0,0,0-.8.38c-3.76,2.13-30,18.18,7,32.57l.38.14,110.41,35.67a6.08,6.08,0,0,0,5.09-.62L409.25,120.57a6,6,0,0,1,2.2-.83c3.81-.63,14.78-1.81,7.84,7-7.85,10-194.9,177.62-215.66,196.21a6.3,6.3,0,0,0-2.07,4.17l-9.06,108a7.08,7.08,0,0,0,2.83,5.67,6.88,6.88,0,0,0,8.17-.62l65.6-58.63a6.09,6.09,0,0,1,7.63-.39l114.45,83.1.37.25c2.77,1.71,32.69,19.12,41.33-19.76l79-375.65c.11-1.19,1.18-14.27-8.17-22-9.82-8.08-23.72-4-25.81-3.56A6,6,0,0,0,477,43.86Z"
      fill="currentColor"
    />
  </svg>
);
