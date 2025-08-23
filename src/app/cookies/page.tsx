import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | FreeNomad",
  description:
    "Learn about how FreeNomad uses cookies and similar technologies to improve your browsing experience.",
};

export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h1>Cookie Policy</h1>
        <p className="text-muted-foreground text-lg">
          Last updated: January 22, 2025
        </p>

        <h2>What Are Cookies</h2>
        <p>
          Cookies are small text files that are placed on your computer or
          mobile device when you visit a website. They are widely used to make
          websites work more efficiently and to provide information to website
          owners.
        </p>

        <h2>How We Use Cookies</h2>
        <p>
          FreeNomad uses cookies to enhance your browsing experience, analyze
          site traffic, and understand where our visitors are coming from. We
          use both first-party cookies (set by our website) and third-party
          cookies (set by other services we use).
        </p>

        <h2>Types of Cookies We Use</h2>

        <h3>Essential Cookies</h3>
        <p>
          These cookies are necessary for the website to function properly. They
          enable basic functions like page navigation, access to secure areas,
          and user authentication. The website cannot function properly without
          these cookies.
        </p>
        <ul>
          <li>
            <strong>Session cookies:</strong> Keep you logged in during your
            visit
          </li>
          <li>
            <strong>Security cookies:</strong> Protect against cross-site
            request forgery
          </li>
          <li>
            <strong>Load balancing cookies:</strong> Ensure optimal website
            performance
          </li>
        </ul>

        <h3>Analytics Cookies</h3>
        <p>
          These cookies help us understand how visitors interact with our
          website by collecting and reporting information anonymously. This
          helps us improve our website and services.
        </p>
        <ul>
          <li>
            <strong>Google Analytics:</strong> Tracks website usage and user
            behavior
          </li>
          <li>
            <strong>Performance monitoring:</strong> Helps identify and fix
            technical issues
          </li>
          <li>
            <strong>User experience tracking:</strong> Understands how users
            navigate our site
          </li>
        </ul>

        <h3>Functional Cookies</h3>
        <p>
          These cookies enable enhanced functionality and personalization. They
          may be set by us or by third-party providers whose services we use on
          our pages.
        </p>
        <ul>
          <li>
            <strong>Preference cookies:</strong> Remember your settings and
            preferences
          </li>
          <li>
            <strong>Language cookies:</strong> Remember your language selection
          </li>
          <li>
            <strong>Theme cookies:</strong> Remember your dark/light mode
            preference
          </li>
        </ul>

        <h3>Marketing Cookies</h3>
        <p>
          These cookies track your online activity to help advertisers deliver
          more relevant advertising or to limit how many times you see an ad. We
          may share this information with other organizations or advertisers.
        </p>
        <ul>
          <li>
            <strong>Advertising cookies:</strong> Show relevant ads based on
            your interests
          </li>
          <li>
            <strong>Social media cookies:</strong> Enable social media sharing
            features
          </li>
          <li>
            <strong>Retargeting cookies:</strong> Show ads for our services on
            other websites
          </li>
        </ul>

        <h2>Third-Party Cookies</h2>
        <p>
          We use several third-party services that may set cookies on your
          device:
        </p>

        <h3>Google Services</h3>
        <ul>
          <li>
            <strong>Google Analytics:</strong> Website analytics and user
            behavior tracking
          </li>
          <li>
            <strong>Google Ads:</strong> Advertising and conversion tracking
          </li>
          <li>
            <strong>Google Maps:</strong> Interactive maps and location services
          </li>
        </ul>

        <h3>Social Media Platforms</h3>
        <ul>
          <li>
            <strong>Facebook:</strong> Social sharing and advertising
          </li>
          <li>
            <strong>Twitter:</strong> Social sharing and embedded content
          </li>
          <li>
            <strong>LinkedIn:</strong> Professional networking and sharing
          </li>
        </ul>

        <h3>Other Services</h3>
        <ul>
          <li>
            <strong>Hotjar:</strong> User experience and heatmap tracking
          </li>
          <li>
            <strong>Intercom:</strong> Customer support and messaging
          </li>
          <li>
            <strong>Stripe:</strong> Payment processing (if applicable)
          </li>
        </ul>

        <h2>Managing Your Cookie Preferences</h2>

        <h3>Browser Settings</h3>
        <p>
          Most web browsers allow you to control cookies through their settings.
          You can usually find these settings in the &quot;Options&quot; or
          &quot;Preferences&quot; menu of your browser. Here are links to cookie
          settings for popular browsers:
        </p>
        <ul>
          <li>
            <a
              href="https://support.google.com/chrome/answer/95647"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Chrome
            </a>
          </li>
          <li>
            <a
              href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
              target="_blank"
              rel="noopener noreferrer"
            >
              Mozilla Firefox
            </a>
          </li>
          <li>
            <a
              href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac"
              target="_blank"
              rel="noopener noreferrer"
            >
              Safari
            </a>
          </li>
          <li>
            <a
              href="https://support.microsoft.com/en-us/help/17442/windows-internet-explorer-delete-manage-cookies"
              target="_blank"
              rel="noopener noreferrer"
            >
              Internet Explorer
            </a>
          </li>
          <li>
            <a
              href="https://support.microsoft.com/en-us/help/4027947/microsoft-edge-delete-cookies"
              target="_blank"
              rel="noopener noreferrer"
            >
              Microsoft Edge
            </a>
          </li>
        </ul>

        <h3>Cookie Consent</h3>
        <p>
          When you first visit our website, you&apos;ll see a cookie consent
          banner that allows you to choose which types of cookies you want to
          accept. You can change your preferences at any time by clicking the
          &quot;Cookie Settings&quot; link in our website footer.
        </p>

        <h3>Opt-Out Options</h3>
        <p>You can opt out of specific tracking services:</p>
        <ul>
          <li>
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Analytics Opt-out
            </a>
          </li>
          <li>
            <a
              href="https://www.facebook.com/settings?tab=ads"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook Ad Preferences
            </a>
          </li>
          <li>
            <a
              href="http://optout.aboutads.info/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Digital Advertising Alliance Opt-out
            </a>
          </li>
        </ul>

        <h2>Impact of Disabling Cookies</h2>
        <p>
          If you choose to disable cookies, some features of our website may not
          function properly. Specifically, you may experience:
        </p>
        <ul>
          <li>Difficulty staying logged in to your account</li>
          <li>Loss of personalized settings and preferences</li>
          <li>Reduced website functionality and user experience</li>
          <li>Inability to use certain interactive features</li>
        </ul>

        <h2>Cookie Retention</h2>
        <p>Different cookies have different retention periods:</p>
        <ul>
          <li>
            <strong>Session cookies:</strong> Deleted when you close your
            browser
          </li>
          <li>
            <strong>Persistent cookies:</strong> Remain on your device for a set
            period (usually 1-2 years)
          </li>
          <li>
            <strong>Analytics cookies:</strong> Typically expire after 2 years
          </li>
          <li>
            <strong>Marketing cookies:</strong> Usually expire after 30-90 days
          </li>
        </ul>

        <h2>Updates to This Policy</h2>
        <p>
          We may update this Cookie Policy from time to time to reflect changes
          in our practices or for other operational, legal, or regulatory
          reasons. We will notify you of any material changes by posting the
          updated policy on our website.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about our use of cookies or this Cookie
          Policy, please contact us:
        </p>
        <ul>
          <li>Email: privacy@freenomad.com</li>
          <li>
            Address: 123 Digital Nomad Street, Remote City, RC 12345, United
            States
          </li>
        </ul>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Quick Summary</h3>
          <p className="text-sm">
            We use cookies to improve your experience on our website, analyze
            usage patterns, and provide personalized content. You can control
            cookie settings through your browser or our cookie consent tool.
            Essential cookies are necessary for basic website functionality and
            cannot be disabled.
          </p>
        </div>
      </div>
    </div>
  );
}
