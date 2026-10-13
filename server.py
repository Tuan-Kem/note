# Chạy: python server.py  ->  mở http://localhost:8000
import json
import os
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
HISTORY = os.path.join(ROOT, "history.json")  # file lưu toàn bộ thao tác
MIME = {
    ".html": "text/html", ".css": "text/css", ".js": "application/javascript",
    ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon",
}


class Handler(BaseHTTPRequestHandler):
    def _send(self, code, body, ctype="application/json"):
        self.send_response(code)
        self.send_header("Content-Type", ctype + "; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")  # luôn nhận bản mới khi cập nhật
        self.end_headers()
        self.wfile.write(body)

    def _static(self):
        path = urllib.parse.urlparse(self.path).path
        if path == "/":
            path = "/index.html"
        full = os.path.normpath(os.path.join(ROOT, path.lstrip("/")))
        rel = os.path.relpath(full, ROOT)
        allowed = rel == "index.html" or rel.startswith("static" + os.sep)
        if not allowed or not os.path.isfile(full):
            return self._send(404, b"Not found", "text/plain")
        ctype = MIME.get(os.path.splitext(full)[1], "application/octet-stream")
        with open(full, "rb") as f:
            self._send(200, f.read(), ctype)

    def do_GET(self):
        if self.path.startswith("/api/history"):
            data = b'{"days":{}}'
            if os.path.exists(HISTORY):
                with open(HISTORY, "rb") as f:
                    data = f.read()
            return self._send(200, data)
        self._static()

    def do_POST(self):
        if not self.path.startswith("/api/history"):
            return self._send(404, b"{}")
        raw = self.rfile.read(int(self.headers.get("Content-Length", 0)))
        try:
            json.loads(raw)
        except ValueError:
            return self._send(400, b'{"ok":false}')
        tmp = HISTORY + ".tmp"
        with open(tmp, "wb") as f:
            f.write(raw)
        os.replace(tmp, HISTORY)  # ghi an toàn, không mất dữ liệu khi lỗi giữa chừng
        self._send(200, b'{"ok":true}')

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    print("Mở trình duyệt: http://localhost:8000  (Ctrl+C để dừng)")
    ThreadingHTTPServer(("127.0.0.1", 8000), Handler).serve_forever()
