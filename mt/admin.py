from django.contrib import admin
from .models import *
from django.apps import apps
from django.http import HttpResponse
import csv

class ExportCsvMixin:
    def export_as_csv(self, request, queryset):
        meta = self.model._meta
        field_names = [field.name for field in meta.fields]

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename={}.csv'.format(meta)
        writer = csv.writer(response)

        writer.writerow(field_names)
        for obj in queryset:
            row = writer.writerow([getattr(obj, field) for field in field_names])
        
        return response

    export_as_csv.short_description = "Export Selected"

# @admin.register(dockeystroke)
class CSVAdmin(admin.ModelAdmin, ExportCsvMixin):
    list_per_page = 2000
    actions = ["export_as_csv"]

# @admin.register(translatedSentence)
# class TranslAdmin(admin.ModelAdmin, ExportCsvMixin):
#     actions = ["export_as_csv"]

for model in apps.get_app_config('mt').models.values():
    admin.site.register(model, CSVAdmin)