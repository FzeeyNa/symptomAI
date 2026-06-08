import urllib.request
import urllib.error
import json

req = urllib.request.Request(
    'http://symptomai-api-fazry12345.azurewebsites.net/predict', 
    data=json.dumps({'symptoms': {}}).encode('utf-8'), 
    headers={'Content-Type': 'application/json'}
)

try:
    urllib.request.urlopen(req)
except urllib.error.HTTPError as e:
    print(e.read().decode('utf-8'))
