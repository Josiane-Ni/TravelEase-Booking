"""Live HTTP integration test; requires seeded, local TravelEase servers.

Uses fictional demo data. Creates and cancels one simulated reservation.
Never run against a production deployment.
"""
import http.cookiejar
import json
import os
from pathlib import Path
import unittest
import urllib.error
import urllib.parse
import urllib.request
import uuid

BASE = os.environ.get('TRAVELEASE_HTTP_URL', 'http://127.0.0.1:5175')
ROOT = Path(__file__).resolve().parents[2]

class Session:
    def __init__(self):
        self.cookies = http.cookiejar.CookieJar()
        self.client = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.cookies))

    def request(self, method, path, payload=None, csrf=True):
        headers = {'Accept': 'application/json', 'Origin': BASE, 'Referer': BASE + '/'}
        if csrf:
            for cookie in self.cookies:
                if cookie.name == 'XSRF-TOKEN':
                    headers['X-XSRF-TOKEN'] = urllib.parse.unquote(cookie.value)
        body = json.dumps(payload).encode() if payload is not None else None
        if body is not None:
            headers['Content-Type'] = 'application/json'
        request = urllib.request.Request(BASE + path, data=body, headers=headers, method=method)
        try:
            response = self.client.open(request, timeout=20)
        except urllib.error.HTTPError as error:
            response = error
        data = response.read()
        if 'application/json' in response.headers.get('Content-Type', ''):
            data = json.loads(data)
        return response.status, data, response.headers

class LiveWorkflowTest(unittest.TestCase):
    def test_real_cookie_csrf_checkout_pdf_refund_and_logout(self):
        self.assertTrue(BASE.startswith('http://127.0.0.1:'), 'Local demo test only')
        values = dict(line.split('=', 1) for line in (ROOT / 'laravel source/.env').read_text().splitlines() if '=' in line and not line.startswith('#'))
        password = values['TRAVELEASE_DEMO_PASSWORD']
        browser = Session()
        self.assertEqual(browser.request('GET', '/sanctum/csrf-cookie')[0], 204)
        credentials = {'email': 'customer@travelease.test', 'password': password}
        self.assertEqual(browser.request('POST', '/api/v1/login', credentials, csrf=False)[0], 419)
        self.assertEqual(browser.request('POST', '/api/v1/login', credentials)[0], 200)
        self.assertEqual(browser.request('GET', '/api/v1/me')[1]['data']['role'], 'customer')
        self.assertEqual(browser.request('GET', '/api/v1/admin/dashboard')[0], 403)
        initial_wallet = browser.request('GET', '/api/v1/wallet')[1]['data']['balance_minor']
        flight = browser.request('GET', '/api/v1/flights')[1]['data'][1]
        cls = next(c for c in browser.request('GET', f"/api/v1/flights/{flight['id']}/availability")[1]['data'] if c['name'] == 'Economy')
        seat = next(seat for seat in cls['seats'] if seat['available'])
        status, response, _ = browser.request('POST', '/api/v1/checkout/holds', {'flight_class_id': cls['id'], 'seat_ids': [seat['id']]})
        self.assertEqual(status, 201)
        hold = response['data']
        payload = {'hold_id': hold['id'], 'passengers': [{'name': 'Integration Test Traveler', 'type': 'adult'}], 'payment_method': 'wallet', 'idempotency_key': str(uuid.uuid4())}
        status, response, _ = browser.request('POST', '/api/v1/checkout/confirm', payload)
        self.assertIn(status, (200, 201), response)
        booking = response['data']
        replay = browser.request('POST', '/api/v1/checkout/confirm', payload)
        self.assertEqual(replay[1]['data']['id'], booking['id'])
        doc = booking['documents'][0]
        self.assertEqual(browser.request('PATCH', f"/api/v1/bookings/{booking['id']}/documents/{doc['id']}", {'available': True})[0], 200)
        status, pdf, headers = browser.request('GET', f"/api/v1/bookings/{booking['id']}/itinerary/pdf")
        self.assertEqual(status, 200)
        self.assertTrue(pdf.startswith(b'%PDF-'))
        fee = booking['cancellation_quote']['fee_minor']
        self.assertEqual(browser.request('POST', f"/api/v1/bookings/{booking['id']}/cancel", {})[0], 200)
        self.assertEqual(browser.request('POST', f"/api/v1/bookings/{booking['id']}/cancel", {})[0], 200)
        final_wallet = browser.request('GET', '/api/v1/wallet')[1]['data']['balance_minor']
        self.assertEqual(final_wallet, initial_wallet - fee)
        self.assertEqual(browser.request('POST', '/api/v1/logout', {})[0], 200)
        self.assertEqual(browser.request('GET', '/api/v1/me')[0], 401)

if __name__ == '__main__':
    unittest.main(verbosity=2)
