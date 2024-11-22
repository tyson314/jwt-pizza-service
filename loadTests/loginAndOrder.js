import { sleep, check, group, fail } from 'k6'
import http from 'k6/http'
import jsonpath from 'https://jslib.k6.io/jsonpath/1.0.2/index.js'

export const options = {
  cloud: {
    distribution: { 'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 100 } },
    apm: [],
  },
  thresholds: {},
  scenarios: {
    Scenario_1: {
      executor: 'ramping-vus',
      gracefulStop: '30s',
      stages: [
        { target: 20, duration: '1m' },
        { target: 20, duration: '3m30s' },
        { target: 0, duration: '1m' },
      ],
      gracefulRampDown: '30s',
      exec: 'scenario_1',
    },
  },
}

export function scenario_1() {
  let response

  const vars = {}

  group('page_1 - https://pizza.sandsational.click/', function () {
    response = http.get('https://pizza.sandsational.click/', {
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'max-age=0',
        'if-modified-since': 'Wed, 30 Oct 2024 21:59:36 GMT',
        'if-none-match': '"77a8dde13cc1fbb20418e3249507b145"',
        priority: 'u=0, i',
        'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
      },
    })
    sleep(16.1)

    response = http.put(
      'https://pizza-service.sandsational.click/api/auth',
      '{"email":"bedo@bedo.com","password":"bedo"}',
      {
        headers: {
          accept: '*/*',
          'accept-encoding': 'gzip, deflate, br, zstd',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/json',
          origin: 'https://pizza.sandsational.click',
          priority: 'u=1, i',
          'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
        },
      }
    )
    check(response, { 'status equals 200': response => response.status.toString() === '200' })

      if (!check(response, { 'status equals 200': response => response.status.toString() === '200' })) {
        console.log(response.body);
        fail('Login was *not* 200');
      }

    vars['token'] = jsonpath.query(response.json(), '$.token')[0]

    sleep(4.3)

    response = http.get('https://pizza-service.sandsational.click/api/order/menu', {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/json',
        'if-none-match': 'W/"71-IwJV4iWSSt63Nw3GT8mFvwCNwGg"',
        origin: 'https://pizza.sandsational.click',
        priority: 'u=1, i',
        'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    })
    sleep(0.5)

    response = http.get('https://pizza-service.sandsational.click/api/franchise', {
      headers: {
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/json',
        'if-none-match': 'W/"96-JebtRXnsdhDvZZDnQJx3lP7GdPs"',
        origin: 'https://pizza.sandsational.click',
        priority: 'u=1, i',
        'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    })
    sleep(6.4)

    response = http.post(
      'https://pizza-service.sandsational.click/api/order',
      '{"items":[{"menuId":1,"description":"Student","price":0.0001},{"menuId":1,"description":"Student","price":0.0001}],"storeId":"2","franchiseId":2}',
      {
        headers: {
          accept: '*/*',
          'accept-encoding': 'gzip, deflate, br, zstd',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/json',
          origin: 'https://pizza.sandsational.click',
          priority: 'u=1, i',
          'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
          Authorization: `Bearer ${vars['token']}`,
        },
      }
    )

    vars['jwt'] = jsonpath.query(response.json(), '$.jwt')[0]

    sleep(2.9)

    response = http.post(
      'https://pizza-factory.cs329.click/api/order/verify',
      '{"jwt":"eyJpYXQiOjE3MzIyNTEzOTksImV4cCI6MTczMjMzNzc5OSwiaXNzIjoiY3MzMjkuY2xpY2siLCJhbGciOiJSUzI1NiIsImtpZCI6IjE0bk5YT21jaWt6emlWZWNIcWE1UmMzOENPM1BVSmJuT2MzazJJdEtDZlEifQ.eyJ2ZW5kb3IiOnsiaWQiOiJ0eXNvbjMxNCIsIm5hbWUiOiJUeXNvbiBQZXRlcnNvbiJ9LCJkaW5lciI6eyJpZCI6NSwibmFtZSI6ImJlZG8iLCJlbWFpbCI6ImJlZG9AYmVkby5jb20ifSwib3JkZXIiOnsiaXRlbXMiOlt7Im1lbnVJZCI6MSwiZGVzY3JpcHRpb24iOiJTdHVkZW50IiwicHJpY2UiOjAuMDAwMX0seyJtZW51SWQiOjEsImRlc2NyaXB0aW9uIjoiU3R1ZGVudCIsInByaWNlIjowLjAwMDF9XSwic3RvcmVJZCI6IjIiLCJmcmFuY2hpc2VJZCI6MiwiaWQiOjN9fQ.g5ty6Siq4sU_dOW4hiMi8_HuuZQd1lo2ySVSGZgOyirwSFHDmhnpfFapdw4MUGZbW7_5p6FEsa5EgCM-5LnFdmLszRvYAaznIFG15ySZt9G7G-ID4aNfdKoLk5FciCQjJCR4nA2R67LiumliOwuYjc1RCix-PS4wTUvTaK5glW-dsHe_SDmJmtG1iSAIpLAh-iqRDxmg88ebZdqrvgLOcNLVoiQJOu5bpaYwsOeKpHzrrd0I3k-m3C0Dy_5SWqK0lT3Dsc8LHRywvRBt1tncrem52OXXKT8UrD97mWYOYQp_DIWLeIaaFSSu9kPe7IimOobjyKDpIGxbQqUsUApArHuWniXcGOXLOVJytbRw9JU0MQ7-lyAzZ7smot6lt16Ti_icHQfjF1bpy3ceQRs9RBYuWft0i0JO4RdLS4WNBFpS1nPFExoWsK9GYAGGOE2bZp9_ZEkiF528ERuVRFKxGd8N_08Fr5pow1JoLrxGt17cJET5GejbZa93qg0ChHEnSb1bdXp0kzF-Ly_OQ3K31jwdZTMceDx4sUDCogT8RC8RM4aT4W3voS92Qk7IE08wpuU8yOgTMwkH6eMw1fXYnFv3o8ZPgyaWYH_ybF-Nftz-peHhe5Y2yQVC_XUKFRRCP3hLtsgOCAGXWIOI4PYX-MrBIRX47sRaPIBl_sySHcY"}',
      {
        headers: {
          accept: '*/*',
          'accept-encoding': 'gzip, deflate, br, zstd',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/json',
          origin: 'https://pizza.sandsational.click',
          priority: 'u=1, i',
          'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site',
        },
      }
    )
  })
}