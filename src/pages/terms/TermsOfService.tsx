export default function TermsOfService() {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Service Description</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Our platform provides comprehensive wellness studio management software as a service ("SaaS"), including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Appointment booking and scheduling system</li>
            <li>Staff management and scheduling tools</li>
            <li>Client relationship management</li>
            <li>Payment processing and financial reporting</li>
            <li>WhatsApp business integration</li>
            <li>Analytics and business insights</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Service Availability</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We strive to maintain high service availability, but we cannot guarantee uninterrupted access to our services.
          </p>
          
          <h3 className="text-lg font-medium mb-2">Service Level Agreement</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
            <li>Target uptime: 99.9% monthly availability</li>
            <li>Planned maintenance windows will be communicated in advance</li>
            <li>Emergency maintenance may occur with minimal notice</li>
            <li>Service credits may apply for extended outages</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Limitations</h3>
          <p className="text-muted-foreground leading-relaxed">
            Service availability may be affected by factors beyond our control, including internet connectivity, 
            third-party service providers, and force majeure events.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Payment Terms</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Our services are provided on a subscription basis with the following payment terms:
          </p>
          
          <h3 className="text-lg font-medium mb-2">Subscription Plans</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
            <li>Monthly and annual billing options available</li>
            <li>Payment is due in advance for each billing period</li>
            <li>Automatic renewal unless cancelled</li>
            <li>Pro-rated charges for plan upgrades during billing period</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Payment Processing</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
            <li>Payments processed securely through Stripe</li>
            <li>Major credit cards and bank transfers accepted</li>
            <li>Failed payments may result in service suspension</li>
            <li>Refunds processed according to our refund policy</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Transaction Fees</h3>
          <p className="text-muted-foreground leading-relaxed">
            Transaction fees may apply to payments processed through our platform. These fees will be clearly disclosed 
            before processing any transactions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. User Obligations</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            By using our services, you agree to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Provide accurate and complete account information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Use our services in compliance with applicable laws</li>
            <li>Respect the rights and privacy of your clients</li>
            <li>Not exceed reasonable usage limits</li>
            <li>Report security vulnerabilities responsibly</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Data and Content</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You retain ownership of all data and content you upload to our platform ("Your Content").
          </p>
          
          <h3 className="text-lg font-medium mb-2">Data Ownership</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
            <li>You own all client data and business information you input</li>
            <li>We provide tools for data export at any time</li>
            <li>Data deletion available upon account termination</li>
            <li>Backup and recovery services included</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Content Restrictions</h3>
          <p className="text-muted-foreground leading-relaxed">
            Your Content must not contain illegal, harmful, or offensive material. We reserve the right to remove 
            content that violates these terms or applicable laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. WhatsApp Integration</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Our WhatsApp integration is subject to WhatsApp's Business API terms and conditions:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Compliance with WhatsApp Business API policies required</li>
            <li>Message sending limits and restrictions apply</li>
            <li>Customer opt-in required for promotional messages</li>
            <li>Integration may be suspended for policy violations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Support and Maintenance</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We provide ongoing support and maintenance services:
          </p>
          
          <h3 className="text-lg font-medium mb-2">Customer Support</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
            <li>Email support during business hours</li>
            <li>Knowledge base and documentation</li>
            <li>Video tutorials and training materials</li>
            <li>Priority support for higher-tier plans</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Software Updates</h3>
          <p className="text-muted-foreground leading-relaxed">
            Regular updates and new features are deployed automatically. Major changes will be communicated in advance.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            Our liability is limited to the maximum extent permitted by law. In no event will our total liability exceed 
            the amount paid by you for the services in the 12 months preceding the claim.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Either party may terminate this agreement:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>With 30 days' written notice for convenience</li>
            <li>Immediately for material breach of terms</li>
            <li>Immediately for non-payment after grace period</li>
            <li>Data export available for 30 days after termination</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Governing Law</h2>
          <p className="text-muted-foreground leading-relaxed">
            These Terms of Service are governed by the laws of the jurisdiction where our company is incorporated. 
            Any disputes will be resolved through binding arbitration.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
          <p className="text-muted-foreground leading-relaxed">
            For questions about these Terms of Service, contact us at:
            <br />
            Email: legal@nimos.app
            <br />
            Support: support@nimos.app
            <br />
            Phone: +1 (555) 123-4567
          </p>
        </section>
      </div>
    </div>
  );
}