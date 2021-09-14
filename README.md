# Cloudflare URL Shortener

A URL shortener implemented with Cloudflare Worker, Cloudflare KV.

## To Use
1. First, you can clone it, replace `https://c.limaois.me/` with your route
2. Publish it with wrangler, set up route in Cloudflare Worker
3. Set a token with `wrangler secret put TOKEN`, this will be used in generator page
4. Visit your route and you should see a generator form and use it

## Demo 
Form: https://c.limaois.me/
Test (will redirect to this repo): https://c.limaois.me/Repo