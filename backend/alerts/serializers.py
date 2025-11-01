from rest_framework import serializers
from .models import Alert


class EmployeeBriefSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()


class AlertSerializer(serializers.ModelSerializer):
    employee = serializers.SerializerMethodField()

    class Meta:
        model = Alert
        fields = ['id', 'employee', 'severity', 'category', 'created_at', 'status']

    def get_employee(self, obj):
        return {'id': obj.employee.id, 'name': obj.employee.name}


class ManagerSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()

