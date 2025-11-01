from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Employee, Alert
from .serializers import AlertSerializer
from typing import Set, List

from .serializers import ManagerSerializer


def parse_list_param(val: str) -> List[str]:
    return [x.strip() for x in val.split(',') if x.strip()]


class AlertListView(APIView):
    def get(self, request):
        manager_id = request.query_params.get('manager_id')
        if not manager_id:
            return Response({'detail': 'manager_id required'}, status=status.HTTP_400_BAD_REQUEST)

        scope = request.query_params.get('scope', 'direct')
        if scope not in ('direct', 'subtree'):
            return Response({'detail': 'invalid scope'}, status=status.HTTP_400_BAD_REQUEST)

        severity_param = request.query_params.get('severity')
        status_param = request.query_params.get('status')
        q = request.query_params.get('q')

        allowed_sev = {'low', 'medium', 'high'}
        if severity_param:
            severities = parse_list_param(severity_param)
            if any(s not in allowed_sev for s in severities):
                return Response({'detail': 'invalid severity'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            severities = None

        allowed_status = {'open', 'dismissed'}
        if status_param:
            statuses = parse_list_param(status_param)
            if any(s not in allowed_status for s in statuses):
                return Response({'detail': 'invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            statuses = None

        manager = Employee.objects.filter(id=manager_id).first()
        if not manager:
            return Response({'detail': 'manager not found'}, status=status.HTTP_404_NOT_FOUND)

        # Find employees
        employees = []
        direct_reports = list(manager.direct_reports.all())
        if scope == 'direct':
            employees = direct_reports
        else:
            # subtree: DFS/BFS with visited set to avoid cycles
            visited: Set[str] = set()
            stack = [e for e in direct_reports]
            while stack:
                emp = stack.pop()
                if emp.id in visited:
                    continue
                visited.add(emp.id)
                employees.append(emp)
                # extend with emp.direct_reports
                for dr in emp.direct_reports.all():
                    if dr.id not in visited:
                        stack.append(dr)

        # exclude manager's own alerts explicitly
        employee_ids = [e.id for e in employees if e.id != manager.id]

        alerts_qs = Alert.objects.filter(employee_id__in=employee_ids)
        if severities is not None:
            alerts_qs = alerts_qs.filter(severity__in=severities)
        if statuses is not None:
            alerts_qs = alerts_qs.filter(status__in=statuses)
        if q:
            alerts_qs = alerts_qs.filter(employee__name__icontains=q)

        # ordering: created_at desc, id asc (id asc is default second ordering)
        alerts = alerts_qs.order_by('-created_at', 'id')

        serializer = AlertSerializer(alerts, many=True)
        return Response(serializer.data)


@api_view(['POST'])
def dismiss_alert(request, pk):
    alert = Alert.objects.filter(id=pk).first()
    if not alert:
        return Response({'detail': 'alert not found'}, status=status.HTTP_404_NOT_FOUND)
    if alert.status != 'dismissed':
        alert.status = 'dismissed'
        alert.save()
    serializer = AlertSerializer(alert)
    return Response(serializer.data, status=status.HTTP_200_OK)


class ManagersListView(APIView):
    def get(self, request):
        # return all employees as potential managers (id, name)
        # order by id so employees are returned in ascending E1, E2, ... order
        employees = Employee.objects.all().order_by('id')
        data = [{'id': e.id, 'name': e.name} for e in employees]
        serializer = ManagerSerializer(data, many=True)
        return Response(serializer.data)
