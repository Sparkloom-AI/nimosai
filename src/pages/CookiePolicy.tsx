
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-4xl font-bold mb-2">Cookie Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card className="p-8">
          <div className="prose prose-slate max-w-none dark:prose-invert">
            <h2 className="text-2xl font-semibold mb-4">What are cookies?</h2>
            <p className="mb-6">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
              They are widely used to make websites work more efficiently and to provide information to website owners.
            </p>

            <h2 className="text-2xl font-semibold mb-4">How we use cookies</h2>
            <p className="mb-4">We use cookies for the following purposes:</p>
            
            <h3 className="text-xl font-medium mb-3">Essential Cookies</h3>
            <p className="mb-4">
              These cookies are necessary for the website to function and cannot be switched off in our systems. 
              They are usually only set in response to actions made by you which amount to a request for services, 
              such as setting your privacy preferences, logging in or filling in forms.
            </p>

            <h3 className="text-xl font-medium mb-3">Analytics Cookies</h3>
            <p className="mb-4">
              These cookies allow us to count visits and traffic sources so we can measure and improve the performance 
              of our site. They help us to know which pages are the most and least popular and see how visitors move 
              around the site.
            </p>

            <h3 className="text-xl font-medium mb-3">Functional Cookies</h3>
            <p className="mb-6">
              These cookies enable the website to provide enhanced functionality and personalization. They may be set 
              by us or by third party providers whose services we have added to our pages.
            </p>

            <h2 className="text-2xl font-semibold mb-4">Managing cookies</h2>
            <p className="mb-4">
              You can control and/or delete cookies as you wish. You can delete all cookies that are already on your 
              computer and you can set most browsers to prevent them from being placed.
            </p>

            <h2 className="text-2xl font-semibold mb-4">Third-party cookies</h2>
            <p className="mb-4">
              We may use third-party services that place cookies on your device. These services help us analyze 
              website traffic, provide customer support, and improve our services.
            </p>

            <h2 className="text-2xl font-semibold mb-4">Contact us</h2>
            <p className="mb-4">
              If you have any questions about our use of cookies, please contact us at{' '}
              <a href="mailto:privacy@nimos.com" className="text-primary hover:underline">
                privacy@nimos.com
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CookiePolicy;
