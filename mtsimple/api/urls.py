from django.urls import path

from . import views

urlpatterns = [
    path('translate_new', views.translate_new, name='translate_new'),
]