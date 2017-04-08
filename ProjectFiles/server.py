from SimpleHTTPServer import SimpleHTTPRequestHandler
import BaseHTTPServer


PROTOCOL = 'HTTP/1.0'
HOST = '127.0.0.1'
PORT = 8000

server_address = (HOST, PORT)

SimpleHTTPRequestHandler.protocol_version = PROTOCOL
http = BaseHTTPServer.HTTPServer(server_address, SimpleHTTPRequestHandler)

print 'Serving HTTP on 127.0.0.1:8000...'
http.serve_forever()
