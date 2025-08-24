
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import RecentSales from '@/components/dashboard/RecentSales';
import UpcomingAppointments from '@/components/dashboard/UpcomingAppointments';
import AppointmentsActivity from '@/components/dashboard/AppointmentsActivity';
import TodayAppointments from '@/components/dashboard/TodayAppointments';
import TopServices from '@/components/dashboard/TopServices';
import TopTeamMembers from '@/components/dashboard/TopTeamMembers';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening at your salon today.
          </p>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <RecentSales />
          <UpcomingAppointments />
          <div className="md:col-span-2">
            {/* This space can be used for additional metrics or kept for future expansion */}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Activity Chart */}
          <div className="lg:col-span-2 space-y-6">
            <AppointmentsActivity />
          </div>

          {/* Right Column - Today's Appointments */}
          <div className="space-y-6">
            <TodayAppointments />
          </div>
        </div>

        {/* Bottom Row - Services and Team */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopServices />
          <TopTeamMembers />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
