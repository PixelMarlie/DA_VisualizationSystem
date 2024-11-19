# DataVisualizationApp/urls.py
from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

urlpatterns = [
    path('upload/', views.upload_csv, name='upload_csv'),
    path('list_tables/', views.list_uploaded_tables, name='list_uploaded_tables'),
    path('view_table/<str:table_name>/', views.view_table, name='view_table'),
    path('fetch_columns/<str:table_name>/', views.fetch_columns, name='fetch_columns'),
    path('generate_chart/', views.generate_chart, name='generate_chart'),
    path('fetch_axis_data/', views.fetch_axis_data, name='fetch_axis_data'),
    #path('save_interpretation/', views.save_interpretation, name='save_interpretation'),
    path('send_email/', views.send_email, name='send_email'),
]

urlpatterns += staticfiles_urlpatterns()