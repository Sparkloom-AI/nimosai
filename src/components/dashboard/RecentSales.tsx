
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

const RecentSales = () => {
  // Mock data - in real app this would come from API
  const salesData = {
    today: 1250,
    change: 12.5,
    isPositive: true
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Recent Sales</CardTitle>
        <div className="text-xs text-muted-foreground">Today</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">${salesData.today}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          {salesData.isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className={salesData.isPositive ? "text-green-500" : "text-red-500"}>
            {salesData.change}%
          </span>
          <span className="ml-1">from yesterday</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentSales;
