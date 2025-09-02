import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, MapPin, MessageCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Studio } from '@/types/studio';
import { 
  getQuickLinkSettings, 
  updateQuickLinkSettings, 
  getLocationsWithShortlinks,
  refreshExpiredShortlinks,
  generateWhatsAppLink,
  generateMapsShortlink,
  QuickLinkSettings as QuickLinkSettingsType
} from '@/api/quickLinks';
import * as studioApi from '@/api/studios';

interface QuickLinksSettingsProps {
  currentStudio: Studio;
  onStudioUpdate: (studio: Studio) => void;
}

export default function QuickLinksSettings({ currentStudio, onStudioUpdate }: QuickLinksSettingsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [settings, setSettings] = useState<QuickLinkSettingsType | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [studioData, setStudioData] = useState({
    studio_manager_whatsapp: currentStudio.studio_manager_whatsapp || '',
    studio_owner_whatsapp: currentStudio.studio_owner_whatsapp || ''
  });

  // Load settings and locations
  useEffect(() => {
    loadData();
  }, [currentStudio.id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [settingsData, locationsData] = await Promise.all([
        getQuickLinkSettings(currentStudio.id),
        getLocationsWithShortlinks(currentStudio.id)
      ]);

      setSettings(settingsData || {
        auto_generate_maps_links: true,
        maps_link_refresh_days: 90,
        whatsapp_link_template: 'Hello! I found your studio location and would like to get in touch.'
      } as any);
      setLocations(locationsData || []);
    } catch (error) {
      console.error('Error loading quick links data:', error);
      toast({
        title: "Error",
        description: "Failed to load quick links settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      await Promise.all([
        updateQuickLinkSettings(currentStudio.id, settings),
        studioApi.studiosApi.updateStudio(currentStudio.id, studioData)
      ]);

      onStudioUpdate({ ...currentStudio, ...studioData } as Studio);
      
      toast({
        title: "Success",
        description: "Quick links settings saved successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefreshShortlinks = async () => {
    setIsRefreshing(true);
    try {
      await refreshExpiredShortlinks(currentStudio.id);
      await loadData(); // Reload to show updated links
      
      toast({
        title: "Success",
        description: "Shortlinks refreshed successfully.",
      });
    } catch (error) {
      console.error('Error refreshing shortlinks:', error);
      toast({
        title: "Error",
        description: "Failed to refresh shortlinks.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const generateLocationShortlink = async (location: any) => {
    try {
      await generateMapsShortlink(location.id, location.address, location.name);
      await loadData(); // Reload to show new link
      
      toast({
        title: "Success",
        description: "Maps shortlink generated successfully.",
      });
    } catch (error) {
      console.error('Error generating shortlink:', error);
      toast({
        title: "Error",
        description: "Failed to generate shortlink.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading quick links settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Settings Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links Settings</CardTitle>
          <CardDescription>
            Configure automatic link generation and templates for your studio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-generate Maps Links</Label>
              <p className="text-sm text-muted-foreground">
                Automatically generate Google Maps shortlinks for new locations
              </p>
            </div>
            <Switch
              checked={settings?.auto_generate_maps_links}
              onCheckedChange={(checked) => 
                setSettings(prev => prev ? { ...prev, auto_generate_maps_links: checked } : null)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="refresh-days">Link Refresh Period (days)</Label>
            <Input
              id="refresh-days"
              type="number"
              min="1"
              max="365"
              value={settings?.maps_link_refresh_days || 90}
              onChange={(e) => 
                setSettings(prev => prev ? { 
                  ...prev, 
                  maps_link_refresh_days: parseInt(e.target.value) || 90 
                } : null)
              }
            />
            <p className="text-sm text-muted-foreground">
              How often to refresh Google Maps shortlinks
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp-template">WhatsApp Message Template</Label>
            <Textarea
              id="whatsapp-template"
              value={settings?.whatsapp_link_template || ''}
              onChange={(e) => 
                setSettings(prev => prev ? { 
                  ...prev, 
                  whatsapp_link_template: e.target.value 
                } : null)
              }
              placeholder="Default message for WhatsApp links"
            />
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Numbers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            WhatsApp Business Numbers
          </CardTitle>
          <CardDescription>
            Configure WhatsApp numbers for quick contact
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="manager-whatsapp">Studio Manager WhatsApp</Label>
            <div className="flex gap-2">
              <Input
                id="manager-whatsapp"
                value={studioData.studio_manager_whatsapp}
                onChange={(e) => setStudioData(prev => ({ 
                  ...prev, 
                  studio_manager_whatsapp: e.target.value 
                }))}
                placeholder="+1234567890"
              />
              {studioData.studio_manager_whatsapp && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(
                    generateWhatsAppLink(studioData.studio_manager_whatsapp, settings?.whatsapp_link_template),
                    'Manager WhatsApp link'
                  )}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner-whatsapp">Studio Owner WhatsApp</Label>
            <div className="flex gap-2">
              <Input
                id="owner-whatsapp"
                value={studioData.studio_owner_whatsapp}
                onChange={(e) => setStudioData(prev => ({ 
                  ...prev, 
                  studio_owner_whatsapp: e.target.value 
                }))}
                placeholder="+1234567890"
              />
              {studioData.studio_owner_whatsapp && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(
                    generateWhatsAppLink(studioData.studio_owner_whatsapp, settings?.whatsapp_link_template),
                    'Owner WhatsApp link'
                  )}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Shortlinks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Shortlinks
            </CardTitle>
            <CardDescription>
              Google Maps shortlinks for your studio locations
            </CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={handleRefreshShortlinks}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh All
          </Button>
        </CardHeader>
        <CardContent>
          {locations.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No locations found. Add locations to generate shortlinks.
            </p>
          ) : (
            <div className="space-y-3">
              {locations.map((location) => (
                <div key={location.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{location.name}</h4>
                    <p className="text-sm text-muted-foreground">{location.address}</p>
                    {location.google_maps_shortlink && (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">Link Generated</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(location.shortlink_generated_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {location.google_maps_shortlink ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(location.google_maps_shortlink, 'Maps shortlink')}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={location.google_maps_shortlink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateLocationShortlink(location)}
                      >
                        Generate Link
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}