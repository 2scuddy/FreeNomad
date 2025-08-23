import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | FreeNomad",
  description:
    "Read the terms and conditions for using FreeNomad's digital nomad platform.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h1>Terms of Service</h1>
        <p className="text-muted-foreground text-lg">
          Last updated: January 22, 2025
        </p>

        <h2>Agreement to Terms</h2>
        <p>
          By accessing and using FreeNomad (&quot;the Service&quot;), you accept
          and agree to be bound by the terms and provision of this agreement. If
          you do not agree to abide by the above, please do not use this
          service.
        </p>

        <h2>Description of Service</h2>
        <p>
          FreeNomad is a platform that provides information about cities around
          the world for digital nomads, including cost of living data, internet
          speeds, safety ratings, and user reviews. We aim to help remote
          workers make informed decisions about their travel destinations.
        </p>

        <h2>User Accounts</h2>

        <h3>Account Creation</h3>
        <p>
          To access certain features of the Service, you may be required to
          create an account. You agree to:
        </p>
        <ul>
          <li>Provide accurate, current, and complete information</li>
          <li>Maintain and update your account information</li>
          <li>Keep your password secure and confidential</li>
          <li>Accept responsibility for all activities under your account</li>
          <li>Notify us immediately of any unauthorized use</li>
        </ul>

        <h3>Account Termination</h3>
        <p>
          We reserve the right to terminate or suspend your account at any time
          for violations of these terms or for any other reason at our sole
          discretion.
        </p>

        <h2>User Content and Conduct</h2>

        <h3>Content Guidelines</h3>
        <p>When using our Service, you agree not to:</p>
        <ul>
          <li>Post false, misleading, or inaccurate information</li>
          <li>
            Submit content that is offensive, defamatory, or inappropriate
          </li>
          <li>Violate any applicable laws or regulations</li>
          <li>Infringe on intellectual property rights</li>
          <li>Spam or harass other users</li>
          <li>Attempt to gain unauthorized access to our systems</li>
        </ul>

        <h3>Content Ownership</h3>
        <p>
          You retain ownership of any content you submit to the Service.
          However, by submitting content, you grant us a worldwide,
          non-exclusive, royalty-free license to use, display, and distribute
          your content in connection with the Service.
        </p>

        <h3>Content Moderation</h3>
        <p>
          We reserve the right to review, edit, or remove any content that
          violates these terms or that we deem inappropriate for any reason.
        </p>

        <h2>Intellectual Property</h2>
        <p>
          The Service and its original content, features, and functionality are
          owned by FreeNomad and are protected by international copyright,
          trademark, patent, trade secret, and other intellectual property laws.
        </p>

        <h2>Privacy Policy</h2>
        <p>
          Your privacy is important to us. Please review our Privacy Policy,
          which also governs your use of the Service, to understand our
          practices.
        </p>

        <h2>Disclaimers</h2>

        <h3>Information Accuracy</h3>
        <p>
          While we strive to provide accurate and up-to-date information, we
          make no warranties about the completeness, reliability, or accuracy of
          the information on our platform. City data, costs, and conditions can
          change rapidly.
        </p>

        <h3>Third-Party Content</h3>
        <p>
          Our Service may contain links to third-party websites or services. We
          are not responsible for the content, privacy policies, or practices of
          any third-party sites.
        </p>

        <h3>User Reviews</h3>
        <p>
          User reviews and ratings represent the opinions of individual users
          and do not reflect our views. We do not endorse or guarantee the
          accuracy of user-generated content.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, FreeNomad shall not be liable
          for any indirect, incidental, special, consequential, or punitive
          damages, or any loss of profits or revenues, whether incurred directly
          or indirectly, or any loss of data, use, goodwill, or other intangible
          losses.
        </p>

        <h2>Indemnification</h2>
        <p>
          You agree to defend, indemnify, and hold harmless FreeNomad and its
          officers, directors, employees, and agents from and against any
          claims, liabilities, damages, judgments, awards, losses, costs,
          expenses, or fees arising out of or relating to your violation of
          these Terms or your use of the Service.
        </p>

        <h2>Termination</h2>
        <p>
          We may terminate or suspend your access immediately, without prior
          notice or liability, for any reason whatsoever, including without
          limitation if you breach the Terms.
        </p>

        <h2>Governing Law</h2>
        <p>
          These Terms shall be interpreted and governed by the laws of the
          United States, without regard to conflict of law provisions. Any
          disputes shall be resolved in the courts of the United States.
        </p>

        <h2>Changes to Terms</h2>
        <p>
          We reserve the right to modify or replace these Terms at any time. If
          a revision is material, we will try to provide at least 30 days notice
          prior to any new terms taking effect.
        </p>

        <h2>Severability</h2>
        <p>
          If any provision of these Terms is held to be unenforceable or
          invalid, such provision will be changed and interpreted to accomplish
          the objectives of such provision to the greatest extent possible under
          applicable law.
        </p>

        <h2>Contact Information</h2>
        <p>
          If you have any questions about these Terms of Service, please contact
          us:
        </p>
        <ul>
          <li>Email: legal@freenomad.com</li>
          <li>
            Address: 123 Digital Nomad Street, Remote City, RC 12345, United
            States
          </li>
        </ul>
      </div>
    </div>
  );
}
