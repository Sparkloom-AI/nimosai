import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LocationsList } from '@/components/domain/locations/LocationsList';
import { AddLocationModal } from '@/components/domain/locations/AddLocationModal';
import { Button } from '@/components/ui/button';
import { Plus, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Locations = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-semibold text-foreground">
                Business Locations
              </h1>
              <p className="text-muted-foreground">
                Manage your studio locations and settings
              </p>
            </div>
          </div>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Location
          </Button>
        </div>

        {/* Getting Started Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg font-heading">Set up your business locations</CardTitle>
            <CardDescription>
              Add your physical studio addresses or mark as mobile/online service. 
              This helps clients find you and enables local business features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span className="px-2 py-1 bg-muted rounded">📍 Physical addresses</span>
              <span className="px-2 py-1 bg-muted rounded">🚗 Mobile services</span>
              <span className="px-2 py-1 bg-muted rounded">💻 Online consultations</span>
            </div>
          </CardContent>
        </Card>

        {/* Locations List */}
        <LocationsList onAddLocation={() => setIsAddModalOpen(true)} />

        {/* Add Location Modal */}
        <AddLocationModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      </div>
    </DashboardLayout>
  );
};

export default Locations;