export default function PrivacyPolicy() {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
          </p>
          
          <h3 className="text-lg font-medium mb-2">Personal Information</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
            <li>Name, email address, and phone number</li>
            <li>Business information (studio name, address, business type)</li>
            <li>Payment information (processed securely through Stripe)</li>
            <li>Profile information and preferences</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Usage Information</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Log data (IP address, browser type, pages visited)</li>
            <li>Device information (device type, operating system)</li>
            <li>Usage analytics and performance data</li>
            <li>WhatsApp integration data (with your consent)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send administrative messages and updates</li>
            <li>Respond to your comments, questions, and customer service requests</li>
            <li>Monitor and analyze trends, usage, and activities</li>
            <li>Detect and prevent fraud and abuse</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Information Sharing and Disclosure</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this policy:
          </p>
          
          <h3 className="text-lg font-medium mb-2">Service Providers</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We may share your information with third-party service providers who perform services on our behalf, such as:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
            <li>Payment processing (Stripe)</li>
            <li>Cloud hosting and storage (Supabase)</li>
            <li>Analytics and monitoring services</li>
            <li>Email and communication services</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Legal Requirements</h3>
          <p className="text-muted-foreground leading-relaxed">
            We may disclose your information if required to do so by law or in response to valid requests by public authorities.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We implement appropriate technical and organizational security measures to protect your personal information:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security assessments and updates</li>
            <li>Access controls and authentication measures</li>
            <li>Employee training on data protection</li>
            <li>Incident response procedures</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
          <p className="text-muted-foreground leading-relaxed">
            We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, 
            and enforce our agreements. When we no longer need your information, we will securely delete or anonymize it.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Your Rights and Choices</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Depending on your location, you may have the following rights regarding your personal information:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Access and receive a copy of your personal information</li>
            <li>Rectify inaccurate or incomplete information</li>
            <li>Delete your personal information</li>
            <li>Restrict or object to certain processing</li>
            <li>Data portability</li>
            <li>Withdraw consent (where applicable)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking Technologies</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We use cookies and similar tracking technologies to collect and use personal information about you. For more information about our use of cookies, 
            please see our Cookie Policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
          <p className="text-muted-foreground leading-relaxed">
            Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable 
            data protection laws and implement appropriate safeguards.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
          <p className="text-muted-foreground leading-relaxed">
            Our services are not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16. 
            If we become aware that a child under 16 has provided us with personal information, we will delete such information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and 
            updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at:
            <br />
            Email: privacy@nimos.app
            <br />
            Data Protection Officer: dpo@nimos.app
            <br />
            Phone: +1 (555) 123-4567
          </p>
        </section>
      </div>
    </div>
  );
}