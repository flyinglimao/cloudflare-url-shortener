addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

class FormElementHandler {
  constructor(short) {
    this.short = short
  }

  async element(element) {
    element.setAttribute('value', this.short)
  }
}

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const url = new URL(request.url)
  if (url.pathname === '/') {
    if (request.method === 'GET') return fetch('https://flyinglimao.github.io/cloudflare-shortener.html')
    else if (request.method === 'POST') {
      try {
        const data = await request.json()
        if (!data['target']) {
          return new Response(JSON.stringify({
            error: 'Missing target'
          }), {
            headers: {
              'content-type': 'application/json'
            },
            status: 401,
          })
        }
        let short = data['short']
        let salt = ''
        if (!short) {
          do {
            const origin = new TextEncoder().encode(data['target'] + salt)
            const digest = await crypto.subtle.digest({
              name: 'MD5',
            }, origin)
            const hashArray = Array.from(new Uint8Array(digest))
            const hash = hashArray.map(e => String.fromCharCode(e)).join('')
            short = btoa(hash).substr(0, 6)
            salt += 'x'
          } while(await SHORTENER.get(short))
        }
        await SHORTENER.put(short, data['target'])

        return new Response(JSON.stringify({
          shorten: short,
          target: data['target'],
        }), {
          headers: {
            'content-type': 'application/json'
          },
          status: 200,
        })
      } catch (err) {
        return new Response(JSON.stringify({
          error: 'Wrong content-type'
        }), {
          headers: {
            'content-type': 'application/json'
          },
          status: 401,
        })
      }
    } else {
      return new Response('Method not Allowed', {
        status: 405,
      })
    }
  } else {
    const short = (url.pathname.match(/^\/[0-9a-zA-Z]+/) || ['/'])[0].substr(1)
    const target = short && await SHORTENER.get(short)

    if (!target) {
      const form = await fetch('https://flyinglimao.github.io/cloudflare-shortener.html')
      const transformed = new HTMLRewriter().on('input[name="short"]', new FormElementHandler(short)).transform(form)
      return new Response(transformed.body, {
        status: 404,
      })
    }

    return new Response('Redirect', {
      status: 301,
      headers: {
        'Location': target
      }
    })
  }
}
