import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getGooglePlacesApiKey, searchPlacesText } from '@/lib/googleMapsApi';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface TestResult {
  step: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'warning';
  message?: string;
  details?: string;
}

export const GoogleMapsTest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const updateResult = (step: string, status: TestResult['status'], message?: string, details?: string) => {
    setResults(prev => {
      const existingIndex = prev.findIndex(r => r.step === step);
      const newResult: TestResult = { step, status, message, details };
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newResult;
        return updated;
      } else {
        return [...prev, newResult];
      }
    });
  };

  const runTests = async () => {
    setTesting(true);
    setResults([]);

    try {
      // Test 1: Get Google Places API Key
      updateResult('api_key', 'running', 'Retrieving Places API key...');
      const apiKey = await getGooglePlacesApiKey();
      updateResult('api_key', 'success', `Places API key retrieved: ${apiKey.substring(0, 10)}...`);

      // Test 2: Test Places Text Search API
      updateResult('places_search', 'running', 'Testing Places Text Search API...');
      const searchResults = await searchPlacesText({
        textQuery: 'New York City Hall'
      });
      updateResult('places_search', 'success', `Found ${searchResults.length} places`);

      // Test 3: Validate search results structure
      updateResult('results_validation', 'running', 'Validating search results...');
      if (searchResults.length > 0) {
        const firstResult = searchResults[0];
        const hasRequiredFields = firstResult.place_id && 
                                firstResult.description && 
                                firstResult.structured_formatting;
        
        if (hasRequiredFields) {
          updateResult('results_validation', 'success', 'Search results have correct structure');
        } else {
          updateResult('results_validation', 'error', 'Search results missing required fields');
        }
      } else {
        updateResult('results_validation', 'warning', 'No results returned to validate');
      }
      
      toast.success('All Google Places tests passed!');
    } catch (error) {
      console.error('Test failed:', error);
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Google Places Integration Test</CardTitle>
        <CardDescription>
          Test the Google Places Text Search API integration to ensure everything is working correctly.
        </CardDescription>
        <Button 
          onClick={runTests} 
          disabled={testing}
          className="w-fit"
        >
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            'Run Integration Tests'
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {results.map((result) => (
            <div key={result.step} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
              {getStatusIcon(result.status)}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{result.step.replace('_', ' ').toUpperCase()}</span>
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(result.status)}
                  >
                    {result.status}
                  </Badge>
                </div>
                {result.message && (
                  <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                )}
                {result.details && (
                  <p className="text-xs text-muted-foreground mt-1 font-mono">{result.details}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};