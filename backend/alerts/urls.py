from django.urls import path
from . import views

urlpatterns = [
    path('alerts', views.AlertListView.as_view(), name='alerts-list'),
    path('alerts/<str:pk>/dismiss', views.dismiss_alert, name='alerts-dismiss'),
    path('managers', views.ManagersListView.as_view(), name='managers-list'),
]
