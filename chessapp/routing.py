from django.urls import path
from .consumers import ChessConsumer

websocket_urlpatterns = [
    path("ws/game/", ChessConsumer.as_asgi()),
]