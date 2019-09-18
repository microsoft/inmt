from django.urls import path

from . import views

urlpatterns = [
    path('', views.corpus, name='corpusindex'),
    path('corpus', views.corpus, name='corpus'),
    path('translate', views.translate, name='translate'),
    path('end', views.end, name='end'),
    path('corpusinput', views.corpusinput, name='corpusinput'),
    path('getinput', views.getinput, name='getinput'),
    path('pushoutput', views.pushoutput, name='pushoutput'),
    path('getoutput', views.getoutput, name='getoutput'),
    path('indic', views.indic, name='indic'),
    # path('dashboard', views.dashboard, name='dashboard'),

    # path('translate', views.new, name='translate'),
    # path('corpusinput', views.corpusinput, name='corpusinput'),
    # path('getinput', views.getinput, name='getinput'),
    path('translate_new', views.translate_new, name='translate_new'),
    # 
    # path('getoutput', views.getoutput, name='getoutput'),
    path('preview', views.end, name='preview'),
    # path('transdelete', views.transdelete, name='transdelete'),
]