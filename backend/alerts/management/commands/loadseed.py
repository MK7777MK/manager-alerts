import json
from django.core.management.base import BaseCommand
from django.utils.dateparse import parse_datetime
from alerts.models import Employee, Alert
from pathlib import Path


class Command(BaseCommand):
    help = 'Load seed data from seed_data.json'

    def handle(self, *args, **options):
        base = Path(__file__).resolve().parents[3]
        fp = base / 'seed_data.json'
        if not fp.exists():
            self.stdout.write(self.style.ERROR(f'seed_data.json not found at {fp}'))
            return

        data = json.loads(fp.read_text())
        Employee.objects.all().delete()
        Alert.objects.all().delete()

        employees = data.get('employees', [])
        for e in employees:
            Employee.objects.create(id=e['id'], name=e['name'])

        # second pass to set reports_to
        for e in employees:
            if e.get('reports_to'):
                try:
                    emp = Employee.objects.get(id=e['id'])
                    mgr = Employee.objects.filter(id=e['reports_to']).first()
                    emp.reports_to = mgr
                    emp.save()
                except Employee.DoesNotExist:
                    continue

        alerts = data.get('alerts', [])
        for a in alerts:
            created = parse_datetime(a['created_at'])
            Alert.objects.create(
                id=a['id'],
                employee=Employee.objects.get(id=a['employee_id']),
                severity=a['severity'],
                category=a['category'],
                created_at=created,
                status=a['status'],
            )

        self.stdout.write(self.style.SUCCESS('Seed data loaded'))
