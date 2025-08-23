import { Metadata } from "next";
import { ChevronDown, Search, MessageCircle, Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// Simple accordion implementation without external dependency

export const metadata: Metadata = {
  title: "FAQ | FreeNomad",
  description:
    "Find answers to frequently asked questions about FreeNomad, digital nomad destinations, and remote work travel.",
};

const faqCategories = [
  {
    title: "Getting Started",
    questions: [
      {
        question: "What is FreeNomad?",
        answer:
          "FreeNomad is a comprehensive platform that helps digital nomads find the perfect destinations for remote work. We provide detailed information about cities worldwide, including cost of living, internet speeds, safety ratings, and community reviews.",
      },
      {
        question: "How do I create an account?",
        answer:
          "You can create a free account by clicking the 'Sign Up' button in the top navigation. You can register using your email address or sign up with Google for faster access.",
      },
      {
        question: "Is FreeNomad free to use?",
        answer:
          "Yes! FreeNomad is completely free to use. You can browse cities, read reviews, and access all our destination information without any cost.",
      },
      {
        question: "How often is the city data updated?",
        answer:
          "We update our city data regularly based on user reviews, official statistics, and real-time information. Cost of living and internet speed data is refreshed monthly, while safety ratings are updated quarterly.",
      },
    ],
  },
  {
    title: "City Information",
    questions: [
      {
        question: "How do you calculate cost of living?",
        answer:
          "Our cost of living estimates are based on average monthly expenses for a digital nomad lifestyle, including accommodation, food, transportation, and entertainment. We source data from user reports, local statistics, and cost-tracking websites.",
      },
      {
        question: "What internet speed do I need for remote work?",
        answer:
          "For most remote work, 25+ Mbps download speed is sufficient. Video calls require 5-10 Mbps, while file uploads may need 10+ Mbps upload speed. We provide both download and upload speeds for each city.",
      },
      {
        question: "How are safety ratings determined?",
        answer:
          "Safety ratings combine multiple factors including crime statistics, political stability, healthcare quality, and user experiences. We use a 1-10 scale where 10 represents the safest destinations.",
      },
      {
        question: "Can I suggest a new city to be added?",
        answer:
          "Absolutely! We're always looking to expand our database. You can suggest new cities by contacting us through our contact form or emailing suggestions@freenomad.com.",
      },
    ],
  },
  {
    title: "Reviews and Ratings",
    questions: [
      {
        question: "How do I write a city review?",
        answer:
          "To write a review, create an account and visit any city page. Click the 'Write Review' button and share your experience. Include details about internet quality, cost of living, safety, and overall experience.",
      },
      {
        question: "Can I edit or delete my reviews?",
        answer:
          "Yes, you can edit or delete your reviews at any time from your profile page. Go to 'My Reviews' section to manage all your submitted reviews.",
      },
      {
        question: "How do you ensure review authenticity?",
        answer:
          "We use several methods to verify reviews including account verification, location verification, and community moderation. Suspicious reviews are flagged and reviewed by our team.",
      },
      {
        question: "What makes a helpful review?",
        answer:
          "Helpful reviews include specific details about your experience, mention the time period you stayed, provide context about your work setup, and offer practical tips for other nomads.",
      },
    ],
  },
  {
    title: "Technical Support",
    questions: [
      {
        question: "The website is loading slowly. What should I do?",
        answer:
          "Try refreshing the page, clearing your browser cache, or using a different browser. If the issue persists, it might be a temporary server issue. Contact us if problems continue.",
      },
      {
        question: "I can't log into my account. What should I do?",
        answer:
          "First, try resetting your password using the 'Forgot Password' link. If that doesn't work, check if you're using the correct email address. Contact support if you still can't access your account.",
      },
      {
        question: "How do I change my email address?",
        answer:
          "You can update your email address in your account settings. Go to Profile > Settings > Account Information and update your email. You'll need to verify the new email address.",
      },
      {
        question: "Can I delete my account?",
        answer:
          "Yes, you can delete your account from the account settings page. Note that this action is permanent and will remove all your reviews and saved data.",
      },
    ],
  },
  {
    title: "Digital Nomad Tips",
    questions: [
      {
        question: "What should I consider when choosing a nomad destination?",
        answer:
          "Key factors include internet reliability, cost of living, time zone compatibility with your work, visa requirements, safety, healthcare quality, and the presence of a nomad community.",
      },
      {
        question: "How do I handle taxes as a digital nomad?",
        answer:
          "Tax obligations vary by your citizenship and residence status. Consult with a tax professional familiar with international tax law. Many countries have specific digital nomad visa programs with tax implications.",
      },
      {
        question: "What are the best tools for nomad life?",
        answer:
          "Essential tools include VPN services, international banking apps, travel insurance, coworking space finders, language learning apps, and reliable communication tools for remote work.",
      },
      {
        question: "How do I find accommodation in a new city?",
        answer:
          "Popular options include Airbnb for short-term stays, local rental websites for longer stays, nomad-specific housing platforms, and coworking spaces that offer accommodation packages.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Find answers to common questions about FreeNomad, digital nomad
          destinations, and remote work travel.
        </p>
      </div>

      {/* Search */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search for answers..." className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {/* FAQ Categories */}
      <div className="space-y-8">
        {faqCategories.map((category, categoryIndex) => (
          <Card key={categoryIndex}>
            <CardHeader>
              <CardTitle>{category.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full space-y-2">
                {category.questions.map((faq, questionIndex) => (
                  <details key={questionIndex} className="border-b group">
                    <summary className="flex cursor-pointer items-center justify-between py-4 font-medium transition-all hover:underline list-none">
                      <span className="text-left">{faq.question}</span>
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180" />
                    </summary>
                    <div className="overflow-hidden text-sm transition-all">
                      <div className="pb-4 pt-0 text-muted-foreground">
                        {faq.answer}
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact Support */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Still have questions?
          </CardTitle>
          <CardDescription>
            Can&apos;t find what you&apos;re looking for? Our support team is
            here to help.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto p-4">
              <div className="text-center">
                <Mail className="h-6 w-6 mx-auto mb-2" />
                <div className="font-semibold">Email Support</div>
                <div className="text-sm text-muted-foreground">
                  support@freenomad.com
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4">
              <div className="text-center">
                <MessageCircle className="h-6 w-6 mx-auto mb-2" />
                <div className="font-semibold">Contact Form</div>
                <div className="text-sm text-muted-foreground">
                  Send us a message
                </div>
              </div>
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Before contacting support:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Check if your question is answered above</li>
              <li>• Try clearing your browser cache for technical issues</li>
              <li>• Include specific details about your issue</li>
              <li>
                • Mention your browser and device type for technical problems
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
