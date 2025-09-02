
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import RecentSales from '@/components/domain/dashboard/RecentSales';
import UpcomingAppointments from '@/components/domain/dashboard/UpcomingAppointments';
import AppointmentsActivity from '@/components/domain/dashboard/AppointmentsActivity';
import TodayAppointments from '@/components/domain/dashboard/TodayAppointments';
import TopServices from '@/components/domain/dashboard/TopServices';
import TopTeamMembers from '@/components/domain/dashboard/TopTeamMembers';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-8 animate-fade-in bg-background">
        {/* Header - Calm & Empowering */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground">Your Studio Dashboard</h1>
          <p className="text-muted-foreground font-body mt-2 leading-relaxed">
            Everything you need to manage your wellness studio with confidence and clarity.
          </p>
        </div>

        {/* Top Stats Row - Clean & Organized */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <RecentSales />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <UpcomingAppointments />
          </div>
          <div className="md:col-span-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            {/* Future expansion space for additional wellness metrics */}
            <div className="h-full flex items-center justify-center p-8 rounded-lg bg-wellness/5 border border-wellness/20">
              <p className="text-wellness/60 font-body text-sm text-center">
                More wellness insights coming soon
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid - Calm Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Activity Overview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <AppointmentsActivity />
            </div>
          </div>

          {/* Right Column - Today's Focus */}
          <div className="space-y-6">
            <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <TodayAppointments />
            </div>
          </div>
        </div>

        {/* Bottom Row - Team & Services Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <TopServices />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.7s' }}>
            <TopTeamMembers />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
