import subprocess
import threading
import os
import sys
import signal
import time

dist_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dist")

def start_http():
    os.chdir(dist_dir)
    subprocess.run([sys.executable, "-m", "http.server", "8888", "--bind", "127.0.0.1"])

def start_ssh():
    subprocess.run([
        "ssh", "-o", "StrictHostKeyChecking=no",
        "-R", "80:localhost:8888",
        "serveo.net"
    ])

print("Starting HTTP server on port 8888...")
http_thread = threading.Thread(target=start_http, daemon=True)
http_thread.start()
time.sleep(1)

print("Creating public tunnel via serveo.net...")
print("This may take a moment...")
print("Once connected, you'll see a line like:")
print("  Forwarding HTTP traffic from https://xxx.serveo.net")
print()
print("Open that URL on your phone -> Add to Home Screen")
print("Then you can close this window.")
print()

try:
    start_ssh()
except KeyboardInterrupt:
    print("\nShutting down...")
