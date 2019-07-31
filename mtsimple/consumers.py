from channels.generic.websocket import WebsocketConsumer
import json

class TranslationConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
    
    def disconnect(self, close_code):
        pass

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        print("THE SOCKET LIVES ONE WAY!!!!!")
        self.send(text_data=json.dumps({
            'message':message + " I have recieved the socket stuff!!!"
        }))
