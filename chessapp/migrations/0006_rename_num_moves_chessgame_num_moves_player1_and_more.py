# Generated by Django 5.1.2 on 2024-10-21 19:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chessapp', '0005_chessgame_loser_chessgame_winner'),
    ]

    operations = [
        migrations.RenameField(
            model_name='chessgame',
            old_name='num_moves',
            new_name='num_moves_player1',
        ),
        migrations.RemoveField(
            model_name='chessgame',
            name='loser',
        ),
        migrations.RemoveField(
            model_name='chessgame',
            name='winner',
        ),
        migrations.AddField(
            model_name='chessgame',
            name='num_moves_player2',
            field=models.PositiveIntegerField(default=0),
        ),
    ]
