from flask import Flask, request
import subprocess
app = Flask(__name__ )

@app.route('/', methods=['GET', 'POST'])
def add_message():
    content = request.json
    device = content['result']['parameters']['source-device']
    if device == 'computer':
        subprocess.call(["irsend", "SEND_ONCE", "hdmi_switch", 'KEY_PROG1'])
    elif device == 'playstation':
        subprocess.call(["irsend", "SEND_ONCE", "hdmi_switch", 'KEY_PROG2'])
    return device