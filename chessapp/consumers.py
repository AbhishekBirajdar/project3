# from channels.generic.websocket import AsyncWebsocketConsumer
# import json

# class ChessConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.group_name = "active_users"
#         self.game_id = self.scope['url_route']['kwargs'].get('game_id')

#         # Join the active users group
#         await self.channel_layer.group_add(
#             self.group_name,
#             self.channel_name
#         )
#         await self.accept()
#         print(f"WebSocket connected for group: {self.group_name}")

#         # Notify all users of a new active user
#         await self.channel_layer.group_send(
#             self.group_name,
#             {
#                 "type": "update_active_users",
#                 "user": self.scope["user"].username,
#                 "action": "connect",
#             }
#         )

#     async def disconnect(self, close_code):
#         # Leave the active users group
#         await self.channel_layer.group_discard(
#             self.group_name,
#             self.channel_name
#         )
#         print(f"WebSocket disconnected for group: {self.group_name}")

#         # Notify all users of a disconnected user
#         await self.channel_layer.group_send(
#             self.group_name,
#             {
#                 "type": "update_active_users",
#                 "user": self.scope["user"].username,
#                 "action": "disconnect",
#             }
#         )

#     async def update_active_users(self, event):
#         # Send active users update to all clients
#         await self.send(text_data=json.dumps({
#             "type": "active_users",
#             "user": event["user"],
#             "action": event["action"],
#         }))

#     async def receive(self, text_data):
#         data = json.loads(text_data)
#         message_type = data.get('type')

#         if message_type == 'make_move':
#             await self.handle_make_move(data)
#         elif message_type == 'resign':
#             await self.handle_resign(data)
#         elif message_type == 'send_challenge':
#             await self.handle_challenge(data)
#         elif message_type == 'accept_challenge':
#             await self.handle_accept_challenge(data)
#         elif message_type == 'decline_challenge':
#             await self.handle_decline_challenge(data)

#     async def handle_make_move(self, data):
#         move = data.get('move')
#         if not move:
#             return

#         # Broadcast the move to the game group
#         await self.channel_layer.group_send(
#             self.group_name,
#             {
#                 'type': 'broadcast_move',
#                 'move': move,
#             }
#         )

#     async def handle_resign(self, data):
#         # Broadcast resignation to the group
#         await self.channel_layer.group_send(
#             self.group_name,
#             {
#                 'type': 'broadcast_resign',
#                 'player': self.scope['user'].username,
#             }
#         )

#     async def handle_challenge(self, data):
#         opponent_id = data.get('opponent_id')
#         if not opponent_id:
#             return

#         # Notify the challenged player
#         await self.channel_layer.group_send(
#             self.group_name,
#             {
#                 'type': 'broadcast_challenge',
#                 'challenger': self.scope['user'].username,
#                 'opponent_id': opponent_id,
#             }
#         )

#     async def handle_accept_challenge(self, data):
#         challenge_id = data.get('challenge_id')
#         if not challenge_id:
#             return

#         # Notify the group that the challenge was accepted
#         await self.channel_layer.group_send(
#             self.group_name,
#             {
#                 'type': 'broadcast_accept_challenge',
#                 'challenger': self.scope['user'].username,
#             }
#         )

#     async def handle_decline_challenge(self, data):
#         challenge_id = data.get('challenge_id')
#         if not challenge_id:
#             return

#         # Notify the group that the challenge was declined
#         await self.channel_layer.group_send(
#             self.group_name,
#             {
#                 'type': 'broadcast_decline_challenge',
#                 'challenger': self.scope['user'].username,
#             }
#         )

#     async def broadcast_move(self, event):
#         # Send the move to the WebSocket client
#         await self.send(text_data=json.dumps({
#             'type': 'update_board',
#             'move': event['move']
#         }))

#     async def broadcast_resign(self, event):
#         # Notify all clients about resignation
#         await self.send(text_data=json.dumps({
#             'type': 'resign',
#             'player': event['player']
#         }))

#     async def broadcast_challenge(self, event):
#         # Notify the opponent about the challenge
#         if str(self.scope["user"].id) == str(event["opponent_id"]):
#             await self.send(text_data=json.dumps({
#                 "type": "challenge",
#                 "challenger": event["challenger"],
#             }))

#     async def broadcast_accept_challenge(self, event):
#         # Notify all clients about the accepted challenge
#         await self.send(text_data=json.dumps({
#             'type': 'accept_challenge',
#             'challenger': event['challenger']
#         }))

#     async def broadcast_decline_challenge(self, event):
#         # Notify all clients about the declined challenge
#         await self.send(text_data=json.dumps({
#             'type': 'decline_challenge',
#             'challenger': event['challenger']
#         }))
from channels.generic.websocket import AsyncWebsocketConsumer
from .utils import add_active_user, remove_active_user, get_active_users
# from django.contrib.auth.models import User
import json


REDIS_ACTIVE_USERS_KEY = "active_users"
class ChessConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.challenge_group_name = f"user_{self.scope['user'].username}"
        self.group_name = "active_users"
        self.username = self.scope["user"].username

        if not self.username:
            await self.close()
            return

        # Add the current user to Redis
        add_active_user(self.username)

        # Join the WebSocket group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.channel_layer.group_add(
            self.challenge_group_name,
            self.channel_name
        )
        await self.accept()

        # Broadcast the updated active users list
        await self.broadcast_active_users()

    async def disconnect(self, close_code):
        if self.username:
            remove_active_user(self.username)

        # Leave the WebSocket group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

        await self.channel_layer.group_discard(
            self.challenge_group_name,
            self.channel_name
        )
        # Broadcast the updated active users list
        await self.broadcast_active_users()

    async def broadcast_active_users(self):
        # Get the active users from Redis
        active_users = list(get_active_users())
        
        # Prevent sending empty or invalid usernames
        active_users = [user for user in active_users if user]

        # Broadcast the active users list to all clients
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "update_active_users_list",
                "active_users": active_users,
            }
        )

    async def update_active_users_list(self, event):
        await self.send(text_data=json.dumps({
            "type": "active_users",
            "active_users": event["active_users"],
        }))

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get("type")

        if message_type == "send_challenge":
            await self.handle_challenge(data)
        if message_type == "accept_challenge":
            await self.handle_accept_challenge(data)
        if message_type == "make_move":
            await self.handle_make_move(data)
        if message_type == "resign":
            await self.handle_resign(data)
    
    async def handle_resign(self, data):
        opponent_username = data.get("opponent_username")
        if not opponent_username:
            return

        # Notify the specific opponent via their WebSocket group
        await self.channel_layer.group_send(
            f"user_{opponent_username}",  # Opponent's group
            {
                "type": "resign",
                "challenger": self.username,  # Include challenger's username
            }
        )

    async def handle_make_move(self, data):
        opponent_username = data.get("opponent_username")
        if not opponent_username:
            return

        # Notify the specific opponent via their WebSocket group
        await self.channel_layer.group_send(
            f"user_{opponent_username}",  # Opponent's group
            {
                "type": "make_move",
                "challenger": self.username,  # Include challenger's username
            }
        )

    async def handle_challenge(self, data):
        opponent_username = data.get("opponent_username")
        if not opponent_username:
            return

        # Notify the specific opponent via their WebSocket group
        await self.channel_layer.group_send(
            f"user_{opponent_username}",  # Opponent's group
            {
                "type": "challenge_notification",
                "challenger": self.username,  # Include challenger's username
            }
        )

    async def challenge_notification(self, event):
        await self.send(text_data=json.dumps({
            "type": "challenge_notification",
            "challenger": event["challenger"],  # Send challenger username to the opponent
        }))

    async def game_start(self, event):
        await self.send(text_data=json.dumps({
            "type": "game_start",
            "game_id": event["game_id"],
            "opponent": event["opponent"],
        }))

    async def make_move(self, event):
        await self.send(text_data=json.dumps({
            "type": "make_move",
            "game_id": event.get("game_id"),  # Add game_id if needed
            "move": event.get("move")  # Add move details
        }))

    async def resign(self, event):
        await self.send(text_data=json.dumps({
            "type": "resign",
        }))