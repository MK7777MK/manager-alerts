from django.test import TestCase
from .models import Employee, Alert
from django.utils.dateparse import parse_datetime


class TraversalTests(TestCase):
    def setUp(self):
        # create cycle E6->E7->E8->E6
        e6 = Employee.objects.create(id='E6', name='Sam')
        e7 = Employee.objects.create(id='E7', name='Jamie', reports_to=None)
        e8 = Employee.objects.create(id='E8', name='Morgan', reports_to=None)
        e6.reports_to = e7
        e6.save()
        e7.reports_to = e8
        e7.save()
        e8.reports_to = e6
        e8.save()
        Alert.objects.create(id='A8', employee=e6, severity='medium', category='engagement', created_at=parse_datetime('2025-09-08T09:00:00Z'), status='open')
        Alert.objects.create(id='A10', employee=e8, severity='low', category='workload', created_at=parse_datetime('2025-09-10T09:00:00Z'), status='open')

    def test_subtree_cycle_prevention(self):
        # Manager E7 subtree should include E6 and E8 but not loop forever
        from django.test import Client
        c = Client()
        resp = c.get('/api/alerts', {'manager_id': 'E7', 'scope': 'subtree'})
        self.assertEqual(resp.status_code, 200)
        ids = {a['id'] for a in resp.json()}
        self.assertEqual(ids, {'A8', 'A10'})


class DismissTests(TestCase):
    def setUp(self):
        e3 = Employee.objects.create(id='E3', name='Jordan')
        Alert.objects.create(id='A1', employee=e3, severity='high', category='retention', created_at=parse_datetime('2025-09-01T09:00:00Z'), status='open')

    def test_dismiss_idempotent(self):
        from django.test import Client
        c = Client()
        resp1 = c.post('/api/alerts/A1/dismiss')
        self.assertEqual(resp1.status_code, 200)
        self.assertEqual(resp1.json()['status'], 'dismissed')
        # second call should still return 200 and unchanged resource
        resp2 = c.post('/api/alerts/A1/dismiss')
        self.assertEqual(resp2.status_code, 200)
        self.assertEqual(resp2.json()['status'], 'dismissed')
