export default function DataProtection() {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Data Protection Policy</h1>
        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            This Data Protection Policy outlines how we collect, process, store, and protect personal data in compliance with 
            the General Data Protection Regulation (GDPR) and other applicable data protection laws.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            We are committed to protecting your privacy and ensuring that your personal data is handled securely and transparently.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Legal Basis for Processing</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We process personal data under the following legal bases:
          </p>
          
          <h3 className="text-lg font-medium mb-2">Legitimate Interest</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
            <li>Providing and improving our services</li>
            <li>Security monitoring and fraud prevention</li>
            <li>Analytics and business intelligence</li>
            <li>Marketing communications (with opt-out options)</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Contractual Necessity</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
            <li>Processing payments and transactions</li>
            <li>Delivering requested services</li>
            <li>Account management and support</li>
            <li>Communication regarding your bookings</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Consent</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
            <li>Marketing communications</li>
            <li>Optional data processing activities</li>
            <li>Third-party integrations (e.g., WhatsApp)</li>
            <li>Cookies and tracking technologies</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Legal Compliance</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Regulatory reporting requirements</li>
            <li>Tax and financial obligations</li>
            <li>Legal investigations and proceedings</li>
            <li>Health and safety compliance</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Types of Personal Data</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We process the following categories of personal data:
          </p>
          
          <h3 className="text-lg font-medium mb-2">Identity Data</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
            <li>Full name and title</li>
            <li>Date of birth (where required)</li>
            <li>Profile photographs</li>
            <li>Government-issued ID numbers (for verification)</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Contact Data</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
            <li>Email addresses</li>
            <li>Telephone numbers</li>
            <li>Physical addresses</li>
            <li>WhatsApp contact information</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Financial Data</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
            <li>Payment card information (tokenized)</li>
            <li>Bank account details</li>
            <li>Transaction history</li>
            <li>Billing addresses</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Usage Data</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
            <li>Service booking history</li>
            <li>Preferences and settings</li>
            <li>Platform interaction data</li>
            <li>Communication records</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Technical Data</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>IP addresses and device identifiers</li>
            <li>Browser and operating system information</li>
            <li>Cookies and tracking data</li>
            <li>Log files and error reports</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Data Security Measures</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We implement comprehensive security measures to protect your personal data:
          </p>
          
          <h3 className="text-lg font-medium mb-2">Technical Safeguards</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
            <li>End-to-end encryption for data in transit</li>
            <li>AES-256 encryption for data at rest</li>
            <li>Secure cloud infrastructure (Supabase)</li>
            <li>Regular security audits and penetration testing</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Access Controls</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
            <li>Multi-factor authentication requirements</li>
            <li>Role-based access permissions</li>
            <li>Regular access reviews and deprovisioning</li>
            <li>Audit logging for all data access</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Organizational Measures</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
            <li>Employee data protection training</li>
            <li>Confidentiality agreements for all staff</li>
            <li>Incident response procedures</li>
            <li>Data protection impact assessments</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Third-Party Security</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Due diligence on data processor agreements</li>
            <li>Regular security assessments of vendors</li>
            <li>Contractual security requirements</li>
            <li>Monitoring of third-party compliance</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Data Subject Rights</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Under GDPR and applicable data protection laws, you have the following rights:
          </p>
          
          <h3 className="text-lg font-medium mb-2">Right of Access</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You can request a copy of all personal data we hold about you, including information about how it's processed.
          </p>

          <h3 className="text-lg font-medium mb-2">Right to Rectification</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You can request correction of inaccurate or incomplete personal data.
          </p>

          <h3 className="text-lg font-medium mb-2">Right to Erasure ("Right to be Forgotten")</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You can request deletion of your personal data in certain circumstances, such as when:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
            <li>The data is no longer necessary for the original purpose</li>
            <li>You withdraw consent and there's no other legal basis</li>
            <li>The data has been unlawfully processed</li>
            <li>Erasure is required for compliance with legal obligations</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Right to Restrict Processing</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You can request limitation of data processing while disputes about accuracy or legitimacy are resolved.
          </p>

          <h3 className="text-lg font-medium mb-2">Right to Data Portability</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You can receive your personal data in a structured, machine-readable format and transmit it to another controller.
          </p>

          <h3 className="text-lg font-medium mb-2">Right to Object</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You can object to processing based on legitimate interests, direct marketing, or automated decision-making.
          </p>

          <h3 className="text-lg font-medium mb-2">Right to Withdraw Consent</h3>
          <p className="text-muted-foreground leading-relaxed">
            Where processing is based on consent, you can withdraw it at any time without affecting the lawfulness of processing based on consent before withdrawal.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. International Data Transfers</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            When transferring personal data outside the European Economic Area (EEA), we ensure adequate protection through:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>European Commission adequacy decisions</li>
            <li>Standard Contractual Clauses (SCCs)</li>
            <li>Binding Corporate Rules (BCRs)</li>
            <li>Certification schemes and codes of conduct</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We retain personal data only as long as necessary for the purposes outlined in this policy:
          </p>
          
          <h3 className="text-lg font-medium mb-2">Retention Periods</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
            <li>Account data: Retained while account is active + 2 years</li>
            <li>Transaction records: 7 years for financial compliance</li>
            <li>Communication logs: 3 years for customer service</li>
            <li>Marketing data: Until consent is withdrawn</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Secure Deletion</h3>
          <p className="text-muted-foreground leading-relaxed">
            When retention periods expire, we securely delete or anonymize personal data using industry-standard methods.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Data Breach Procedures</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            In the event of a personal data breach, we will:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Contain and assess the breach within 24 hours</li>
            <li>Notify the supervisory authority within 72 hours (if required)</li>
            <li>Notify affected individuals without undue delay (if high risk)</li>
            <li>Document the breach and remedial actions taken</li>
            <li>Review and improve security measures as needed</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Children's Data Protection</h2>
          <p className="text-muted-foreground leading-relaxed">
            Our services are not directed to children under 16. We do not knowingly collect personal data from children. 
            If we become aware that we have collected data from a child, we will delete it promptly.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
          <p className="text-muted-foreground leading-relaxed">
            For questions about data protection or to exercise your rights, contact:
            <br />
            <br />
            <strong>Data Protection Officer</strong>
            <br />
            Email: dpo@nimos.app
            <br />
            Phone: +1 (555) 123-4567
            <br />
            <br />
            <strong>Supervisory Authority</strong>
            <br />
            You also have the right to lodge a complaint with your local data protection authority.
          </p>
        </section>
      </div>
    </div>
  );
}