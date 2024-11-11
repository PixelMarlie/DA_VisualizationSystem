# DataVisualizationApp/models.py
from django.db import models

class UploadedCSV(models.Model):
    file_name = models.CharField(max_length=100)
    upload_date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.file_name
