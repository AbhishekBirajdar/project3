from django.contrib import admin
from django.contrib.auth import views as auth_views
from chessapp import views
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('chessapp.urls')),
]
