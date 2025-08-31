import React from 'react';
import { Location } from '@/types/studio';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MapPin, Phone, MoreVertical, Edit, Trash2, Star, StarOff } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface LocationCardProps {
  location: Location;
  onEdit: (location: Location) => void;
  onDelete: (locationId: string) => void;
  onSetPrimary: (locationId: string) => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  onEdit,
  onDelete,
  onSetPrimary
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const formatAddress = () => {
    const parts = [
      location.address,
      location.city,
      location.state,
      location.postal_code
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  const handleDelete = () => {
    onDelete(location.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-semibold text-lg">{location.name}</h3>
              {location.is_primary && (
                <Badge variant="secondary" className="gap-1">
                  <Star className="h-3 w-3" />
                  Primary
                </Badge>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(location)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                {!location.is_primary && (
                  <DropdownMenuItem onClick={() => onSetPrimary(location.id)}>
                    <Star className="h-4 w-4 mr-2" />
                    Set as Primary
                  </DropdownMenuItem>
                )}
                {location.is_primary && (
                  <DropdownMenuItem disabled>
                    <StarOff className="h-4 w-4 mr-2" />
                    Remove Primary
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              {formatAddress()}
              {location.country !== 'US' && (
                <div className="mt-1">{location.country}</div>
              )}
            </div>
          </div>
          
          {location.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{location.phone}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Location</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{location.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};