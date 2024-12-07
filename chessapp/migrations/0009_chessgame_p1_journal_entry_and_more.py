# Generated by Django 5.1.2 on 2024-10-23 05:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chessapp', '0008_chessgame_p1_visible_chessgame_p2_visible_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='chessgame',
            name='p1_journal_entry',
            field=models.JSONField(default=dict),
        ),
        migrations.AddField(
            model_name='chessgame',
            name='p2_journal_entry',
            field=models.JSONField(default=dict),
        ),
    ]
