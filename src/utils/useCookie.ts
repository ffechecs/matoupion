// src/utils/useCookie.ts
import { parse, serialize } from 'cookie-es'
import { destr } from 'destr'
import { ref, watch } from 'vue'
import type { Ref } from 'vue'

interface CookieOptions {
  path?: string
  watch?: boolean
  secure?: boolean
  sameSite?: 'lax' | 'strict' | 'none'
  maxAge?: number
  decode?: (val: string) => any
  encode?: (val: any) => string
  default?: () => any
}

const CookieDefaults: CookieOptions = {
  path: '/',
  watch: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 365,
  decode: val => destr(decodeURIComponent(val)),
  encode: val => encodeURIComponent(typeof val === 'string' ? val : JSON.stringify(val)),
}

export const useCookie = (name: string, _opts?: CookieOptions): Ref<any> => {
  const opts = { ...CookieDefaults, ..._opts || {} }
  const cookies = parse(document.cookie, opts)
  const cookie = ref(cookies[name] ?? opts.default?.())

  if (opts.watch) {
    watch(cookie, () => {
      document.cookie = serializeCookie(name, cookie.value, opts)
    })
  }
  
  return cookie
}

function serializeCookie(name: string, value: any, opts: CookieOptions = {}) {
  if (value === null || value === undefined)
    return serialize(name, value, { ...opts, maxAge: -1 })
  
  return serialize(name, value, opts)
}