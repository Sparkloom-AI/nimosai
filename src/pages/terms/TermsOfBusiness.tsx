export default function TermsOfBusiness() {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Terms of Business</h1>
        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Business Partnership Overview</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            These Terms of Business govern the relationship between our platform and business partners who use our services 
            to manage their wellness studios, including but not limited to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Spa and wellness centers</li>
            <li>Massage therapy clinics</li>
            <li>Beauty salons and barbershops</li>
            <li>Fitness studios and gyms</li>
            <li>Health and wellness practitioners</li>
            <li>Multi-location business chains</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Business Account Requirements</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            To establish a business partnership with our platform, you must:
          </p>
          
          <h3 className="text-lg font-medium mb-2">Eligibility Criteria</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
            <li>Operate a legitimate wellness or beauty business</li>
            <li>Possess all required business licenses and permits</li>
            <li>Maintain appropriate professional insurance</li>
            <li>Comply with local health and safety regulations</li>
            <li>Provide accurate business registration information</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Documentation Required</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Business registration certificate</li>
            <li>Professional licenses (where applicable)</li>
            <li>Tax identification numbers</li>
            <li>Proof of insurance coverage</li>
            <li>Banking information for payment processing</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Revenue Sharing and Payment Processing</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Our platform facilitates payment processing for your business with the following terms:
          </p>
          
          <h3 className="text-lg font-medium mb-2">Transaction Processing</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
            <li>Secure payment processing through Stripe</li>
            <li>Support for major credit cards and digital payments</li>
            <li>Real-time transaction reporting and analytics</li>
            <li>Automated settlement to your business account</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Fee Structure</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
            <li>Platform subscription fees as per your selected plan</li>
            <li>Payment processing fees (standard Stripe rates apply)</li>
            <li>No hidden charges or setup fees</li>
            <li>Transparent pricing with detailed breakdowns</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Settlement Terms</h3>
          <p className="text-muted-foreground leading-relaxed">
            Payments are typically settled within 2-7 business days, subject to standard payment processor hold periods 
            and risk assessment procedures.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Business Responsibilities</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            As a business partner, you are responsible for:
          </p>
          
          <h3 className="text-lg font-medium mb-2">Service Delivery</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
            <li>Providing services as advertised and booked</li>
            <li>Maintaining professional standards and qualifications</li>
            <li>Ensuring staff are properly trained and licensed</li>
            <li>Handling customer service and complaint resolution</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Compliance and Legal</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
            <li>Compliance with all applicable laws and regulations</li>
            <li>Maintaining required business licenses and permits</li>
            <li>Data protection and client privacy compliance</li>
            <li>Health and safety standard adherence</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Platform Usage</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Accurate listing of services and pricing</li>
            <li>Timely updates to availability and scheduling</li>
            <li>Professional communication with clients</li>
            <li>Proper use of integrated WhatsApp features</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Client Relationship Management</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Your relationship with clients includes the following guidelines:
          </p>
          
          <h3 className="text-lg font-medium mb-2">Client Data Protection</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
            <li>Secure handling of client personal information</li>
            <li>Compliance with GDPR and local privacy laws</li>
            <li>Obtaining proper consent for data processing</li>
            <li>Implementing appropriate data security measures</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Communication Standards</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
            <li>Professional and courteous communication</li>
            <li>Timely responses to inquiries and bookings</li>
            <li>Clear communication of policies and procedures</li>
            <li>Appropriate use of WhatsApp business features</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Dispute Resolution</h3>
          <p className="text-muted-foreground leading-relaxed">
            You are primarily responsible for resolving disputes with clients. Our platform provides tools and support 
            but cannot mediate service-related disputes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Marketing and Branding</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Guidelines for marketing your business through our platform:
          </p>
          
          <h3 className="text-lg font-medium mb-2">Brand Representation</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
            <li>Accurate representation of your business and services</li>
            <li>Professional imagery and content</li>
            <li>Compliance with advertising standards</li>
            <li>Respect for our platform's brand guidelines</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Promotional Activities</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Creating and managing promotional offers</li>
            <li>Seasonal campaigns and special events</li>
            <li>Loyalty program integration</li>
            <li>Social media marketing support</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibent mb-4">7. Performance Standards</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We expect business partners to maintain certain performance standards:
          </p>
          
          <h3 className="text-lg font-medium mb-2">Service Quality Metrics</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
            <li>Minimum customer satisfaction ratings</li>
            <li>Timely appointment fulfillment</li>
            <li>Professional service delivery</li>
            <li>Consistent availability and scheduling</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Response Time Requirements</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Booking confirmations within 2 hours</li>
            <li>Customer inquiries responded to within 24 hours</li>
            <li>Cancellation notices provided with adequate notice</li>
            <li>Schedule updates reflected in real-time</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Intellectual property rights and licensing terms:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>You retain ownership of your business content and branding</li>
            <li>Limited license granted to display your content on our platform</li>
            <li>Respect for our platform's intellectual property rights</li>
            <li>No unauthorized use of our trademarks or branding</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Termination and Suspension</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Partnership termination terms and procedures:
          </p>
          
          <h3 className="text-lg font-medium mb-2">Voluntary Termination</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
            <li>30 days' written notice required</li>
            <li>Data export tools available during notice period</li>
            <li>Outstanding payments settled according to terms</li>
            <li>Ongoing bookings honored or transferred</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Suspension or Termination for Cause</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Breach of terms or policies</li>
            <li>Failure to maintain required licenses</li>
            <li>Consistent poor performance ratings</li>
            <li>Fraudulent or illegal activities</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            Our platform serves as a technology facilitator. We are not liable for the quality of services provided by business partners, 
            client disputes, or issues arising from the business relationship between partners and their clients.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
          <p className="text-muted-foreground leading-relaxed">
            For questions about these Terms of Business, contact us at:
            <br />
            Email: partners@nimos.app
            <br />
            Business Support: business@nimos.app
            <br />
            Phone: +1 (555) 123-4567
          </p>
        </section>
      </div>
    </div>
  );
}