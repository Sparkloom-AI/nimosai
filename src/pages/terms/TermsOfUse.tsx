export default function TermsOfUse() {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Terms of Use</h1>
        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing and using our website and mobile applications ("Platform"), you accept and agree to be bound by the terms and provision of this agreement. 
            If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Our Platform provides wellness studio management services, including but not limited to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Appointment scheduling and management</li>
            <li>Staff scheduling and resource allocation</li>
            <li>Client management and communication</li>
            <li>Payment processing and financial reporting</li>
            <li>WhatsApp integration for business communications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            As a user of our Platform, you agree to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Provide accurate and complete information when creating an account</li>
            <li>Maintain the confidentiality of your account credentials</li>
            <li>Use the Platform only for lawful purposes</li>
            <li>Respect the intellectual property rights of others</li>
            <li>Not interfere with or disrupt the Platform's functionality</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Account Registration</h2>
          <p className="text-muted-foreground leading-relaxed">
            To access certain features of our Platform, you must register for an account. You are responsible for maintaining the confidentiality of your account 
            information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Privacy and Data Protection</h2>
          <p className="text-muted-foreground leading-relaxed">
            Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Platform, to understand our practices 
            regarding the collection, use, and disclosure of your personal information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Prohibited Uses</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You may not use our Platform:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
            <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
            <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
            <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
            <li>To submit false or misleading information</li>
            <li>To upload or transmit viruses or any other type of malicious code</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property Rights</h2>
          <p className="text-muted-foreground leading-relaxed">
            The Platform and its original content, features, and functionality are and will remain the exclusive property of our company and its licensors. 
            The Platform is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product 
            or service without our prior written consent.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may terminate or suspend your account and bar access to the Platform immediately, without prior notice or liability, under our sole discretion, 
            for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            In no event shall our company, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, 
            special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, 
            resulting from your use of the Platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 
            30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have any questions about these Terms of Use, please contact us at:
            <br />
            Email: legal@nimos.app
            <br />
            Phone: +1 (555) 123-4567
          </p>
        </section>
      </div>
    </div>
  );
}