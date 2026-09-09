import { readFileSync } from 'fs'
const env = Object.fromEntries(readFileSync('.env.local','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()]}))
const url = env.SUPABASE_URL, key = env.SUPABASE_SERVICE_ROLE_KEY
const ids = ['2fd2066c-40e1-4644-adad-dd4a5e2087a9','9db0ab9e-e539-4815-aa77-a6f5cb5b13eb','50aa7b3e-424e-4623-acfe-2289524190b4','75814f75-7aa8-4d0c-99a8-e1f519e15e5a']
const res = await fetch(`${url}/rest/v1/bookings?id=in.(${ids.join(',')})&select=id,name,phone,service_name,duration_minutes,hair_method,requests,time_slot`, {headers:{apikey:key,Authorization:`Bearer ${key}`}})
const rows = await res.json()
console.log(JSON.stringify(rows, null, 2))
