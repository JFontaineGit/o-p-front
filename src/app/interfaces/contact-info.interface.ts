export interface ContactInfo {
  label: string
  value: string
  isStatus?: boolean
  statusType?: "online" | "offline" | "busy"
}

export interface ContactCardData {
  id: number;
  icon: string;
  title: string;
  description: string;
  infoItems: ContactInfo[];
  buttonLabel: string;
  methodType: string;
  variant: "phone" | "whatsapp" | "email" | "chat" | "default";
}