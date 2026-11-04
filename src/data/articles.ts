export interface Topic {
  slug: string;
  title: string;
  icon: "lock" | "printer" | "wifi" | "app" | "key" | "cog";
  color: string;
  soft: string;
  articleCount: number; // total in the real knowledge base, only a few are written out below
}

export interface Article {
  slug: string;
  title: string;
  topic: string; // topic slug
  readMinutes: number;
  views: number;
  intro: string;
  steps: string[];
}

export const topics: Topic[] = [
  { slug: "accounts", title: "Accounts & passwords", icon: "lock", color: "#4f46e5", soft: "#eef0ff", articleCount: 12 },
  { slug: "printers", title: "Printers & scanners", icon: "printer", color: "#0ea5e9", soft: "#e6f5fd", articleCount: 8 },
  { slug: "network", title: "Network & VPN", icon: "wifi", color: "#d97706", soft: "#fff4de", articleCount: 15 },
  { slug: "software", title: "Software & apps", icon: "app", color: "#16a34a", soft: "#e4f6ea", articleCount: 21 },
  { slug: "access", title: "Access & permissions", icon: "key", color: "#db2777", soft: "#fde8f2", articleCount: 6 },
  { slug: "hardware", title: "Hardware & devices", icon: "cog", color: "#64748b", soft: "#eef1f6", articleCount: 10 },
];

export const articles: Article[] = [
  {
    slug: "reset-your-password",
    title: "How to reset your password",
    topic: "accounts",
    readMinutes: 2,
    views: 4200,
    intro: "Forgot your password or got locked out after too many attempts? You can fix it yourself in a couple of minutes.",
    steps: [
      "Go to the company sign-in page and click \"Forgot password?\".",
      "Enter your work email. A 6-digit code is sent to the phone number registered with HR.",
      "Type the code and choose a new password (at least 12 characters, with a number and a symbol).",
      "Sign in again on every device. Old devices that still use the previous password can lock your account again, so update or remove them.",
    ],
  },
  {
    slug: "connect-to-the-office-printer",
    title: "Connect to the office printer",
    topic: "printers",
    readMinutes: 3,
    views: 2900,
    intro: "New laptop or the printer disappeared from your list? Add it again using its network name.",
    steps: [
      "Open Settings > Printers & scanners and click \"Add device\".",
      "If the printer is not listed, choose \"The printer that I want isn't listed\" and add it by address.",
      "Use the address printed on the sticker on the printer, for example \\\\print-01\\floor2.",
      "Print a test page. If it stays \"Offline\", restart the printer and check that its screen shows an IP address.",
    ],
  },
  {
    slug: "set-up-vpn-at-home",
    title: "Set up VPN on your home laptop",
    topic: "network",
    readMinutes: 5,
    views: 2100,
    intro: "The VPN lets you reach internal systems such as the ERP and shared folders when you work from home.",
    steps: [
      "Install the company VPN client from the Software Center.",
      "Open the client and enter the server address vpn.company.com.",
      "Sign in with your work email and approve the prompt on your phone.",
      "If the connection drops every few minutes, switch from Wi-Fi 2.4GHz to 5GHz or use a cable, then open a ticket if it continues.",
    ],
  },
  {
    slug: "request-access-to-a-shared-folder",
    title: "Request access to a shared folder",
    topic: "access",
    readMinutes: 2,
    views: 1400,
    intro: "Access to team folders is approved by the folder owner. Opening a ticket gives them a clear record.",
    steps: [
      "Copy the full path of the folder you need.",
      "Open a new ticket in the \"Access request\" category and paste the path.",
      "Write why you need it and for how long. Your manager is asked to approve.",
      "You get a notification as soon as access is granted, usually within one working day.",
    ],
  },
  {
    slug: "outlook-keeps-asking-for-password",
    title: "Outlook keeps asking for my password",
    topic: "software",
    readMinutes: 3,
    views: 1250,
    intro: "This usually happens after a password change, when Outlook still stores the old one.",
    steps: [
      "Close Outlook completely.",
      "Open Credential Manager from the Start menu and remove every entry that mentions Office or Outlook.",
      "Start Outlook again and sign in with your new password.",
      "Check your phone and tablet too. A device with the old password can keep locking your account.",
    ],
  },
  {
    slug: "laptop-battery-tips",
    title: "My laptop battery drains too fast",
    topic: "hardware",
    readMinutes: 4,
    views: 980,
    intro: "Before asking for a replacement, these checks fix most battery complaints.",
    steps: [
      "Open Settings > System > Battery and look at which apps use the most power.",
      "Turn on Battery saver and lower the screen brightness.",
      "Restart the laptop at least once a week, since updates often wait for a restart.",
      "If the battery report shows less than 60% health, open a ticket and we will replace it.",
    ],
  },
  {
    slug: "fix-slow-wifi",
    title: "Fix slow Wi-Fi in meeting rooms",
    topic: "network",
    readMinutes: 3,
    views: 870,
    intro: "Many people in one room can saturate a single access point. A few quick checks help us find the cause.",
    steps: [
      "Run a speed test and write down the download number and the room.",
      "Move closer to the ceiling access point if you can see it.",
      "Forget the network and reconnect to the 5GHz one (name ends with -5G).",
      "Send us the speed test result in a ticket so we can check the access point.",
    ],
  },
  {
    slug: "teams-camera-not-working",
    title: "Camera not working in Teams",
    topic: "software",
    readMinutes: 2,
    views: 760,
    intro: "If your camera works in other apps but not in Teams, it is almost always a permission.",
    steps: [
      "Open Settings > Privacy > Camera and make sure \"Let desktop apps access your camera\" is on.",
      "In Teams go to Settings > Devices and pick your camera from the list.",
      "Close other apps that may be using the camera (browser tabs, Zoom).",
      "Restart Teams. If it still fails, tell us your laptop model in a ticket.",
    ],
  },
];
