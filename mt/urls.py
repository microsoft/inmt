from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('dashboard', views.dashboard, name='dashboard'),
    path('corpus', views.tstart, name='corpus'),
    path('translate', views.new, name='translate'),
    path('corpusinput', views.corpusinput, name='corpusinput'),
    path('getinput', views.getinput, name='getinput'),
    path('translate_new', views.translate_new, name='translate_new'),
    path('pushoutput', views.pushoutput, name='pushoutput'),
    path('getoutput', views.getoutput, name='getoutput'),
    path('preview', views.end, name='preview'),
    path('transdelete', views.transdelete, name='transdelete'),
    path('exportcsv', views.export_keystroke_csv, name='export_keystroke_csv'),
    path('set_keyboard_controls', views.set_keyboard_controls, name = 'set_keyboard_controls'),
    path('iscontrolschemedefined', views.isControlSchemeDefined, name = 'iscontrolschemedefined' )
]