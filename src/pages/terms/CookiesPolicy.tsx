export default function CookiesPolicy() {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Cookies Policy</h1>
        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. What are Cookies?</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit our website. 
            They are widely used to make websites work more efficiently and provide information to the site owners.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Cookies help us understand how you use our website, remember your preferences, and improve your experience. 
            Most web browsers automatically accept cookies, but you can modify your browser settings to decline cookies if you prefer.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Types of Cookies We Use</h2>
          
          <h3 className="text-lg font-medium mb-3">Essential Cookies</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            These cookies are necessary for our website to function properly and cannot be disabled. They include:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-6">
            <li>Authentication cookies to keep you logged in</li>
            <li>Security cookies to protect against fraud</li>
            <li>Load balancing cookies for optimal performance</li>
            <li>Session cookies to maintain your preferences during your visit</li>
          </ul>

          <h3 className="text-lg font-medium mb-3">Analytics Cookies</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            These cookies help us understand how visitors interact with our website by collecting anonymous information:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-6">
            <li>Page views and visitor numbers</li>
            <li>Popular content and features</li>
            <li>User journey and navigation patterns</li>
            <li>Device and browser information</li>
            <li>Time spent on different pages</li>
          </ul>

          <h3 className="text-lg font-medium mb-3">Functional Cookies</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            These cookies enhance your experience by remembering your choices and providing personalized features:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-6">
            <li>Language and region preferences</li>
            <li>Display settings (theme, layout preferences)</li>
            <li>Previously entered information in forms</li>
            <li>Customized dashboard configurations</li>
            <li>Notification preferences</li>
          </ul>

          <h3 className="text-lg font-medium mb-3">Marketing Cookies</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            These cookies track your online activity to help us deliver more relevant advertising:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Advertising performance measurement</li>
            <li>Interest-based advertising</li>
            <li>Social media integration</li>
            <li>Third-party advertising networks</li>
            <li>Conversion tracking for marketing campaigns</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Third-Party Cookies</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We work with trusted third-party services that may place cookies on your device:
          </p>
          
          <h3 className="text-lg font-medium mb-3">Google Analytics</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We use Google Analytics to understand how users interact with our website. Google Analytics uses cookies to collect 
            anonymous information about your usage patterns.
          </p>
          
          <h3 className="text-lg font-medium mb-3">Stripe</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Our payment processor, Stripe, uses cookies to help detect and prevent fraud, ensuring secure transactions.
          </p>
          
          <h3 className="text-lg font-medium mb-3">WhatsApp Business API</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            When you interact with our WhatsApp integration, WhatsApp may place cookies to enhance the messaging experience.
          </p>
          
          <h3 className="text-lg font-medium mb-3">Social Media Platforms</h3>
          <p className="text-muted-foreground leading-relaxed">
            If you share content or interact with social media features on our site, those platforms may place cookies on your device.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Cookie Duration</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Cookies are stored for different lengths of time depending on their purpose:
          </p>
          
          <h3 className="text-lg font-medium mb-3">Session Cookies</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            These are temporary cookies that are deleted when you close your browser. They help maintain your session while navigating our website.
          </p>
          
          <h3 className="text-lg font-medium mb-3">Persistent Cookies</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            These cookies remain on your device for a set period or until you delete them. They help us remember your preferences for future visits.
          </p>
          
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Typical Cookie Lifespans:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>Authentication cookies: End of browser session</li>
              <li>Preference cookies: 1 year</li>
              <li>Analytics cookies: 2 years</li>
              <li>Marketing cookies: 30-90 days</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Managing Your Cookie Preferences</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You have control over which cookies you accept:
          </p>
          
          <h3 className="text-lg font-medium mb-3">Cookie Consent Banner</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            When you first visit our website, you'll see a cookie consent banner where you can choose which types of cookies to accept. 
            You can update your preferences at any time by clicking the cookie preferences link in our footer.
          </p>
          
          <h3 className="text-lg font-medium mb-3">Browser Settings</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Most browsers allow you to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
            <li>View and delete cookies stored on your device</li>
            <li>Block cookies from specific websites</li>
            <li>Block third-party cookies</li>
            <li>Delete all cookies when you close your browser</li>
            <li>Set up notifications when cookies are being set</li>
          </ul>
          
          <h3 className="text-lg font-medium mb-3">Opt-Out Links</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            For marketing and analytics cookies, you can opt out directly:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li><a href="https://tools.google.com/dlpage/gaoptout" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out</a></li>
            <li><a href="https://www.youronlinechoices.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Your Online Choices</a></li>
            <li><a href="https://optout.networkadvertising.org" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Network Advertising Initiative</a></li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Impact of Disabling Cookies</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            While you can disable cookies, doing so may affect your experience on our website:
          </p>
          
          <h3 className="text-lg font-medium mb-3">Essential Cookies</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Disabling essential cookies will prevent you from using key features of our website, including logging in and making bookings.
          </p>
          
          <h3 className="text-lg font-medium mb-3">Functional Cookies</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Without functional cookies, you'll need to re-enter your preferences each time you visit, and some personalized features won't work.
          </p>
          
          <h3 className="text-lg font-medium mb-3">Analytics and Marketing Cookies</h3>
          <p className="text-muted-foreground leading-relaxed">
            Disabling these cookies won't affect the website's functionality, but we won't be able to improve our services based on usage data 
            or provide personalized content and advertising.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Updates to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this Cookies Policy from time to time to reflect changes in our practices or applicable laws. 
            We'll notify you of any significant changes by posting the updated policy on our website and updating the "Last updated" date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have questions about our use of cookies or this policy, please contact us at:
            <br />
            <br />
            Email: privacy@nimos.app
            <br />
            Phone: +1 (555) 123-4567
            <br />
            <br />
            You can also manage your cookie preferences at any time by visiting our cookie preferences center.
          </p>
        </section>
      </div>
    </div>
  );
}