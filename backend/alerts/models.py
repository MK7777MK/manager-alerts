from django.db import models


class Employee(models.Model):
    id = models.CharField(max_length=32, primary_key=True)
    name = models.CharField(max_length=200)
    reports_to = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='direct_reports')

    def __str__(self):
        return f"{self.id} - {self.name}"


class Alert(models.Model):
    SEVERITY_CHOICES = [('low', 'low'), ('medium', 'medium'), ('high', 'high')]
    STATUS_CHOICES = [('open', 'open'), ('dismissed', 'dismissed')]

    id = models.CharField(max_length=32, primary_key=True)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='alerts')
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES)
    category = models.CharField(max_length=100)
    created_at = models.DateTimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)

    class Meta:
        ordering = ['-created_at', 'id']

    def __str__(self):
        return f"{self.id} ({self.employee_id}) {self.severity}"
