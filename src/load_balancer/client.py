import requests
import time
import random

for i in range(10):
    time.sleep(5)
    print("calling halt")
    res = requests.post("http://localhost:3001/halt", {
        "seconds": random.randint(1, 3),
        "returnValue": i
    })
    print(res.json())
    