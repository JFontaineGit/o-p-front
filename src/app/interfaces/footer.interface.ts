export interface Language {
  code: string
  name: string
  flag: string
}

export interface Currency {
  code: string
  name: string
  symbol: string
}

export interface FooterLink {
  label: string
  route: string
}

export interface ContactInfo {
  icon: string
  text: string
  href?: string
}