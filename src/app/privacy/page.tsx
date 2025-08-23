import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | FreeNomad",
  description:
    "Learn how FreeNomad collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h1>Privacy Policy</h1>
        <p className="text-muted-foreground text-lg">
          Last updated: January 22, 2025
        </p>

        <h2>Introduction</h2>
        <p>
          FreeNomad (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is
          committed to protecting your privacy. This Privacy Policy explains how
          we collect, use, disclose, and safeguard your information when you
          visit our website and use our services.
        </p>

        <h2>Information We Collect</h2>

        <h3>Personal Information</h3>
        <p>
          We may collect personal information that you voluntarily provide to us
          when you:
        </p>
        <ul>
          <li>Register for an account</li>
          <li>Submit reviews or ratings</li>
          <li>Contact us through our contact form</li>
          <li>Subscribe to our newsletter</li>
          <li>Participate in surveys or promotions</li>
        </ul>

        <p>This information may include:</p>
        <ul>
          <li>Name and email address</li>
          <li>Profile information and preferences</li>
          <li>Location data (if you choose to share it)</li>
          <li>Communication preferences</li>
        </ul>

        <h3>Automatically Collected Information</h3>
        <p>
          When you visit our website, we may automatically collect certain
          information, including:
        </p>
        <ul>
          <li>IP address and browser type</li>
          <li>Device information and operating system</li>
          <li>Pages visited and time spent on our site</li>
          <li>Referring website addresses</li>
          <li>Cookies and similar tracking technologies</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, operate, and maintain our services</li>
          <li>Improve and personalize your experience</li>
          <li>Process your transactions and manage your account</li>
          <li>Send you updates, newsletters, and promotional materials</li>
          <li>
            Respond to your comments, questions, and customer service requests
          </li>
          <li>Analyze usage patterns and improve our website</li>
          <li>Prevent fraud and enhance security</li>
          <li>Comply with legal obligations</li>
        </ul>

        <h2>Information Sharing and Disclosure</h2>
        <p>
          We do not sell, trade, or rent your personal information to third
          parties. We may share your information in the following circumstances:
        </p>

        <h3>Service Providers</h3>
        <p>
          We may share your information with third-party service providers who
          perform services on our behalf, such as hosting, analytics, email
          delivery, and customer support.
        </p>

        <h3>Legal Requirements</h3>
        <p>
          We may disclose your information if required to do so by law or in
          response to valid requests by public authorities.
        </p>

        <h3>Business Transfers</h3>
        <p>
          In the event of a merger, acquisition, or sale of assets, your
          information may be transferred as part of that transaction.
        </p>

        <h2>Data Security</h2>
        <p>
          We implement appropriate technical and organizational security
          measures to protect your personal information against unauthorized
          access, alteration, disclosure, or destruction. However, no method of
          transmission over the internet or electronic storage is 100% secure.
        </p>

        <h2>Cookies and Tracking Technologies</h2>
        <p>
          We use cookies and similar tracking technologies to enhance your
          browsing experience, analyze site traffic, and understand where our
          visitors are coming from. You can control cookie settings through your
          browser preferences.
        </p>

        <h2>Your Rights and Choices</h2>
        <p>
          Depending on your location, you may have the following rights
          regarding your personal information:
        </p>
        <ul>
          <li>Access: Request access to your personal information</li>
          <li>Correction: Request correction of inaccurate information</li>
          <li>Deletion: Request deletion of your personal information</li>
          <li>
            Portability: Request a copy of your information in a portable format
          </li>
          <li>Opt-out: Unsubscribe from marketing communications</li>
        </ul>

        <p>
          To exercise these rights, please contact us at privacy@freenomad.com.
        </p>

        <h2>Children&apos;s Privacy</h2>
        <p>
          Our services are not intended for children under the age of 13. We do
          not knowingly collect personal information from children under 13. If
          you believe we have collected information from a child under 13,
          please contact us immediately.
        </p>

        <h2>International Data Transfers</h2>
        <p>
          Your information may be transferred to and processed in countries
          other than your own. We ensure that such transfers comply with
          applicable data protection laws and implement appropriate safeguards.
        </p>

        <h2>Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of any material changes by posting the new Privacy Policy on this
          page and updating the &quot;Last updated&quot; date.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact
          us:
        </p>
        <ul>
          <li>Email: privacy@freenomad.com</li>
          <li>
            Address: 123 Digital Nomad Street, Remote City, RC 12345, United
            States
          </li>
        </ul>
      </div>
    </div>
  );
}
