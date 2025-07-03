export interface Product {
  id: number
  title: string
  description: string
  price: number
  imageUrl: string
}

export interface CartItem extends Product {
  quantity?: number
}
