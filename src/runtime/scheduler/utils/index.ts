// export function isArray<T>(obj: unknown): obj is Array<T> {
//     return Array.isArray(obj)
// }

// export function isNumber(obj: unknown): obj is number {
//     return Object.prototype.toString.call(obj) === '[object Number]'
// }

// export function isObject<T extends Record<any, any>>(obj: unknown): obj is T {
//     return Object.prototype.toString.call(obj) === '[object Object]'
// }

// export function isFunc(obj: unknown): obj is (...args: any[]) => any {
//     return Object.prototype.toString.call(obj) === '[object Function]'
// }

// export function isString(obj: unknown): obj is string {
//     return Object.prototype.toString.call(obj) === '[object String]'
// }

export function getCurrentTime() {
    return performance.now();
}