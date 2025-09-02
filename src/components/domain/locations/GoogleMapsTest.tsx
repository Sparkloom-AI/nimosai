import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getGoogleMapsApiKey } from '@/lib/googleMapsApi';
import { loadGoogleMapsAPI } from '@/lib/googleMaps';
import { CheckCircle, XCircle, Loader2, TestTube } from 'lucide-react';
import { toast } from 'sonner';

interface TestResult {
  step: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  details?: any;
}

export const GoogleMapsTest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const updateResult = (step: string, status: 'pending' | 'success' | 'error', message?: string, details?: any) => {
    setResults(prev => {
      const newResults = [...prev];
      const existingIndex = newResults.findIndex(r => r.step === step);
      
      if (existingIndex >= 0) {
        newResults[existingIndex] = { step, status, message, details };
      } else {
        newResults.push({ step, status, message, details });
      }
      
      return newResults;
    });
  };

  const runTests = async () => {
    setTesting(true);
    setResults([]);
    
    try {
      // Test 1: Get API Key
      updateResult('Get API Key', 'pending');
      try {
        const apiKey = await getGoogleMapsApiKey();
        updateResult('Get API Key', 'success', `API key retrieved (${apiKey.length} characters)`);
      } catch (error) {
        updateResult('Get API Key', 'error', error.message);
        return;
      }

      // Test 2: Load Google Maps API
      updateResult('Load Google Maps', 'pending');
      try {
        const apiKey = await getGoogleMapsApiKey();
        await loadGoogleMapsAPI({
          apiKey,
          libraries: ['places']
        });
        updateResult('Load Google Maps', 'success', 'Google Maps API loaded successfully');
      } catch (error) {
        updateResult('Load Google Maps', 'error', error.message);
        return;
      }

      // Test 3: Check Google Maps Objects
      updateResult('Check APIs', 'pending');
      try {
        const hasGoogle = !!window.google;
        const hasMaps = !!window.google?.maps;
        const hasPlaces = !!window.google?.maps?.places;
        const hasAutocomplete = !!window.google?.maps?.places?.AutocompleteService;
        const hasPlacesService = !!window.google?.maps?.places?.PlacesService;

        if (hasGoogle && hasMaps && hasPlaces && hasAutocomplete && hasPlacesService) {
          updateResult('Check APIs', 'success', 'All Google Maps APIs available', {
            hasGoogle,
            hasMaps,
            hasPlaces,
            hasAutocomplete,
            hasPlacesService
          });
        } else {
          updateResult('Check APIs', 'error', 'Some Google Maps APIs missing', {
            hasGoogle,
            hasMaps,
            hasPlaces,
            hasAutocomplete,
            hasPlacesService
          });
          return;
        }
      } catch (error) {
        updateResult('Check APIs', 'error', error.message);
        return;
      }

      // Test 4: Test AutocompleteService
      updateResult('Test Autocomplete', 'pending');
      try {
        const autocompleteService = new window.google.maps.places.AutocompleteService();
        
        await new Promise((resolve, reject) => {
          autocompleteService.getPlacePredictions(
            {
              input: 'New York',
              types: ['establishment', 'geocode'],
              componentRestrictions: { country: 'us' }
            },
            (predictions, status) => {
              if (status === 'OK' && predictions && predictions.length > 0) {
                updateResult('Test Autocomplete', 'success', `Found ${predictions.length} predictions`);
                resolve(predictions);
              } else {
                updateResult('Test Autocomplete', 'error', `Autocomplete failed with status: ${status}`);
                reject(new Error(`Autocomplete failed: ${status}`));
              }
            }
          );
        });
      } catch (error) {
        updateResult('Test Autocomplete', 'error', error.message);
        return;
      }

      toast.success('All Google Maps tests passed!');

    } catch (error) {
      console.error('Test suite failed:', error);
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusColor = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending':
        return 'bg-muted text-muted-foreground';
      case 'success':
        return 'bg-success/10 text-success border border-success/20';
      case 'error':
        return 'bg-destructive/10 text-destructive border border-destructive/20';
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Google Maps Integration Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTests} 
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Running Tests...
            </>
          ) : (
            <>
              <TestTube className="h-4 w-4 mr-2" />
              Run Google Maps Tests
            </>
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Test Results:</h3>
            {results.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <div className="font-medium">{result.step}</div>
                    {result.message && (
                      <div className="text-sm text-muted-foreground">{result.message}</div>
                    )}
                  </div>
                </div>
                <Badge className={getStatusColor(result.status)}>
                  {result.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};