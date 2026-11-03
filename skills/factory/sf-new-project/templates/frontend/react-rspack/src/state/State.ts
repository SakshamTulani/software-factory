/** One value the user chose that more than one screen needs, such as the selected fleet. */
export class State<T> {
  private value: T
  private readonly listeners = new Set<() => void>()

  constructor(initial: T) {
    this.value = initial
  }

  get = (): T => this.value

  set(next: T) {
    if (Object.is(next, this.value)) return
    this.value = next
    for (const listener of this.listeners) listener()
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }
}
