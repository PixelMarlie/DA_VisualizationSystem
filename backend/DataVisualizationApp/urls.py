# DataVisualizationApp/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.upload_csv, name='upload_csv'),
    path('list_tables/', views.list_uploaded_tables, name='list_uploaded_tables'),
    path('view_table/<str:table_name>/', views.view_table, name='view_table'),
]
