
export class Notify {
  page: string
  operation: string
  user_id: number
  completed: boolean
  success: boolean
  title: string
  message: string
  result?: any
  body?: any

  constructor() {
    this.completed = false
    this.success = false
  }
}
