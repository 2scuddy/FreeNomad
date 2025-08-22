"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Mail,
  Phone,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { href: "/cities", label: "Browse Cities" },
      { href: "/featured", label: "Featured Destinations" },
      { href: "/guides", label: "Travel Guides" },
      { href: "/reviews", label: "Reviews" },
    ],
    company: [
      { href: "/about", label: "About Us" },
      { href: "/careers", label: "Careers" },
      { href: "/blog", label: "Blog" },
      { href: "/press", label: "Press" },
    ],
    support: [
      { href: "/help", label: "Help Center" },
      { href: "/contact", label: "Contact Us" },
      { href: "/faq", label: "FAQ" },
      { href: "/community", label: "Community" },
    ],
    legal: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/cookies", label: "Cookie Policy" },
      { href: "/disclaimer", label: "Disclaimer" },
    ],
  };

  const socialLinks = [
    { href: "https://github.com/freenomad", icon: Github, label: "GitHub" },
    { href: "https://twitter.com/freenomad", icon: Twitter, label: "Twitter" },
    {
      href: "https://linkedin.com/company/freenomad",
      icon: Linkedin,
      label: "LinkedIn",
    },
    {
      href: "https://instagram.com/freenomad",
      icon: Instagram,
      label: "Instagram",
    },
  ];

  return (
    <footer className={cn("border-t bg-background", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-8">
          {/* Brand and Contact Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-8 mb-6 lg:mb-0">
              <Link
                href="/"
                className="flex items-center space-x-2 mb-4 lg:mb-0"
              >
                <MapPin className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-foreground">
                  FreeNomad
                </span>
              </Link>

              {/* Contact Information */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a
                    href="mailto:hello@freenomad.com"
                    className="hover:text-foreground transition-colors"
                  >
                    hello@freenomad.com
                  </a>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <a
                    href="tel:+1-555-0123"
                    className="hover:text-foreground transition-colors"
                  >
                    +1 (555) 012-3456
                  </a>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-2">
              {socialLinks.map(social => {
                const Icon = social.icon;
                return (
                  <Button
                    key={social.href}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    asChild
                  >
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Navigation Links - Horizontal Layout */}
          <div className="flex flex-wrap gap-x-8 gap-y-4 justify-center lg:justify-start">
            {/* Product Links */}
            <div className="flex items-center space-x-1">
              <span className="text-sm font-semibold text-foreground mr-3">
                Product:
              </span>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {footerLinks.product.map((link, index) => (
                  <span key={link.href} className="flex items-center">
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                    {index < footerLinks.product.length - 1 && (
                      <span className="text-muted-foreground mx-2">•</span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Company Links */}
            <div className="flex items-center space-x-1">
              <span className="text-sm font-semibold text-foreground mr-3">
                Company:
              </span>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {footerLinks.company.map((link, index) => (
                  <span key={link.href} className="flex items-center">
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                    {index < footerLinks.company.length - 1 && (
                      <span className="text-muted-foreground mx-2">•</span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Support Links */}
            <div className="flex items-center space-x-1">
              <span className="text-sm font-semibold text-foreground mr-3">
                Support:
              </span>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {footerLinks.support.map((link, index) => (
                  <span key={link.href} className="flex items-center">
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                    {index < footerLinks.support.length - 1 && (
                      <span className="text-muted-foreground mx-2">•</span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex items-center space-x-1">
              <span className="text-sm font-semibold text-foreground mr-3">
                Legal:
              </span>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {footerLinks.legal.map((link, index) => (
                  <span key={link.href} className="flex items-center">
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                    {index < footerLinks.legal.length - 1 && (
                      <span className="text-muted-foreground mx-2">•</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Bottom Footer */}
        <div className="py-6">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <span>© {currentYear} FreeNomad. All rights reserved.</span>
            </div>

            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>for digital nomads worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
