from django.contrib import admin
from django.urls import path
from django.contrib.auth import views as auth_views
from chessapp import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home, name='home'),
    path('login/', auth_views.LoginView.as_view(template_name='login.html'), name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('signup/', views.signup, name='signup'),
    path('history/', views.history, name='history'),
    path('chesshistory/', views.chesshistory, name='chesshistory'),
    path('rules/', views.rules, name='rules'),
    path('about/', views.about, name='about'),
    path('active-users/', views.active_users_view, name='active_users'),
    path('challenge/', views.challenge, name='challenge'),
    path('pending-challenges/', views.pending_challenges, name='pending_challenges'),
    path('decline-challenge/<int:challenge_id>/', views.decline_challenge, name='decline_challenge'),
    path('accept-challenge/<str:challenger_username>/', views.accept_challenge, name='accept_challenge'),
    path('game-state/<int:game_id>/', views.game_state, name='game_state'),
    path('ongoing-game/', views.ongoing_game, name='ongoing_game'),
    path('make-move/<int:game_id>/', views.make_move, name='make_move'),
    path('resign-game/<int:game_id>/', views.resign_game, name='resign_game'),
    path('edit-game/<int:game_id>/', views.edit_game, name='edit_game'),
    path('delete-game/<int:game_id>/', views.delete_game, name='delete_game'),
    path('game/<int:game_id>/', views.game_page, name='game_page'), 
    path('api/get_opponent_username/<int:game_id>/', views.get_opponent_username, name='get_opponent_username'),
    path('api/check-valid-move/<int:game_id>/', views.make_move_check, name='check_valid_move'),

]
