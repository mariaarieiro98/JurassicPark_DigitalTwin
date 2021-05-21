# usage:
# python3 trigger_df.py events_file.json

import json
import struct
import socket
import sys


class DiacSimulator:

    def __init__(self, ip_address, bind_port):
        # Create a TCP/IP socket
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        # Connect the socket to the port where the server is listening
        server_url = (ip_address, bind_port)
        # connects tho the socket
        self.sock.connect(server_url)

    def send_event(self, fb_name, event_name, device_name):
        message = '<Request ID="2" Action="WRITE">' \
                  '<Connection Source="$e" Destination="{0}.{1}" />' \
                  '</Request>'.format(fb_name, event_name)
        print(message)
        message2sent = self.__build_message(message.encode('utf-8'), device_name.encode('utf-8'))
        try:
            # Send data
            self.sock.sendall(message2sent)
            # Look for the response
            data = self.sock.recv(2048)
        except socket.error as msg:
            print(msg)

    def upload_dinasore(self, file_path):
        # creates the first message
        first_message = self.__build_message(b'<Request ID="0" Action="QUERY"><FB Name="*" Type="*"/></Request>', b'')
        # creates the messages list
        messages_list = [first_message]

        # reads the file
        with open(file_path) as f:
            content = f.readlines()
        # iterates over the xml of messages
        for row in content:
            message = row.split(';')
            message_text = self.__build_message(message[1].encode('utf-8'), message[0].encode('utf-8'))
            messages_list.append(message_text)

        # sends the configuration
        for msg in messages_list:
            try:
                # Send data
                self.sock.sendall(msg)
                # Look for the response
                data = self.sock.recv(2048)
            except socket.error as msg:
                print(msg)

    def disconnect(self):
        self.sock.close()

    @staticmethod
    def __build_message(message_payload, configuration_name):
        # build the first part of the header
        hex_input = '{:04x}'.format(len(configuration_name))
        second_byte = int(hex_input[0:2], 16)
        third_byte = int(hex_input[2:4], 16)
        response_len = struct.pack('BB', second_byte, third_byte)
        response_header_1 = b''.join([b'\x50', response_len])

        # build the second part of the header
        hex_input = '{:04x}'.format(len(message_payload))
        second_byte = int(hex_input[0:2], 16)
        third_byte = int(hex_input[2:4], 16)
        response_len = struct.pack('BB', second_byte, third_byte)
        response_header_2 = b''.join([b'\x50', response_len])

        # join the 3 parts
        response = b''.join([response_header_1, configuration_name, response_header_2, message_payload])
        return response


if __name__ == '__main__':
    # reads the json
    with open(sys.argv[1]) as f:
        events_data = json.loads(f.read())
    # iterate over the event data
    for din_instance, events in events_data.items():
        # creates a connection
        din_param = din_instance.split('@')
        print(din_param)
        conn = din_param[1].split(':')
        sim = DiacSimulator(conn[0], int(conn[1]))
        print('name:', din_param[0], 'ip:', conn[0], ' port:', int(conn[1]))
        # iterates over each event
        for e in events:
            # sends the event
            print('sending event...')
            e_param = e.split('.')
            sim.send_event(e_param[0], e_param[1], din_param[0])
        # disconnects the client