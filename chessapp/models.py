from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now
import chess

class GameRequest(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_requests')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_requests')
    timestamp = models.DateTimeField(default=now)
    marked = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.sender.username} challenged {self.receiver.username}"

class ChessGame(models.Model):
    player1 = models.ForeignKey(
        User, on_delete=models.SET_NULL, related_name='games_as_player1', null=True, blank=True
    )
    player2 = models.ForeignKey(
        User, on_delete=models.SET_NULL, related_name='games_as_player2', null=True, blank=True
    )
    fen = models.TextField(default=chess.STARTING_BOARD_FEN)
    marked = models.BooleanField(default=False)
    last_move = models.CharField(max_length=5, blank=True, null=True)
    outcome = models.CharField(max_length=10, choices=[('win', 'Win'), ('loss', 'Loss'), ('tie', 'Tie')], default='tie')
    num_moves_player1 = models.PositiveIntegerField(default=0)  # Track player1 moves
    num_moves_player2 = models.PositiveIntegerField(default=0)  # Track player2 moves
    journal_entry = models.TextField(blank=True, null=True)
    winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='won_games')
    loser = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='lost_games')
    p1_visible = models.BooleanField(default=True)  # Visibility for player1
    p2_visible = models.BooleanField(default=True)  # Visibility for player2
    p1_journal_entry = models.JSONField(default=dict)  # Journal for player1
    p2_journal_entry = models.JSONField(default=dict)  # Journal for player2

    def get_user_moves(self, user):
        """Return the number of moves made by the specified user."""
        if self.player1 == user:
            return self.num_moves_player1
        elif self.player2 == user:
            return self.num_moves_player2
        return 0

    def __str__(self):
        return f"Game: {self.player1} vs {self.player2} | Outcome: {self.outcome}"

class Room(models.Model):
    game = models.OneToOneField(ChessGame, on_delete=models.CASCADE, related_name='room')
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return f"Room for Game ID: {self.game.id}"

class ChatMessage(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    timestamp = models.DateTimeField(default=now)

    def __str__(self):
        return f"Message from {self.sender.username} at {self.timestamp}"