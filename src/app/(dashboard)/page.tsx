'use client';

import React, { useEffect, useState } from 'react';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import CoordinatorDashboard from '@/components/dashboards/CoordinatorDashboard';

export default function DashboardPage() {
  const [roleId, setRoleId] = useState<number | null>(null);
  const [roleName, setRoleName] = useState('Coordinator');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setRoleId(user.roleId);
        switch (user.roleId) {
          case 1: setRoleName('Superadmin'); break;
          case 2: setRoleName('Admin'); break;
          case 3: setRoleName('Coordinator'); break;
          case 4: setRoleName('Teacher'); break;
          case 5: setRoleName('Student'); break;
        }
      } catch (e) {}
    }
  }, []);

  if (roleId === 2 || roleId === 1) {
    return <AdminDashboard roleName={roleName} />;
  }

  // Default to Coordinator view for others (teachers/coordinators) for now
  return <CoordinatorDashboard roleName={roleName} />;
}
