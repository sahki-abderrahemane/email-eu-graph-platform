'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Network,
  ArrowRight,
  BarChart3,
  Users,
  Target,
  Lightbulb,
  ChevronRight,
  Play,
  Sparkles
} from 'lucide-react';

const features = [
  {
    icon: BarChart3,
    title: 'Network Analytics',
    description: 'Comprehensive analysis of email communication patterns with real-time statistics.',
    color: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
  },
  {
    icon: Target,
    title: 'ML Predictions',
    description: 'Department prediction and link prediction powered by Node2Vec embeddings.',
    color: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
  },
  {
    icon: Users,
    title: 'Community Detection',
    description: 'Discover organizational clusters using Louvain & Leiden algorithms.',
    color: 'linear-gradient(135deg, #22d3ee 0%, #10b981 100%)',
  },
  {
    icon: Lightbulb,
    title: 'Explainability',
    description: 'Understand model decisions with feature importance and neighbor analysis.',
    color: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
  },
];

const stats = [
  { value: '1,005', label: 'Network Nodes' },
  { value: '25,571', label: 'Email Connections' },
  { value: '42', label: 'Departments' },
  { value: '97%', label: 'Prediction Accuracy' },
];

// Inline styles for guaranteed centering
const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0f',
  },
  nav: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    background: 'rgba(10, 10, 15, 0.85)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  navContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 2rem',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textDecoration: 'none',
  },
  logoIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #818cf8 0%, #22d3ee 50%, #a855f7 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  navActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  navLink: {
    padding: '0.625rem 1.25rem',
    color: '#94a3b8',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: '0.9rem',
    transition: 'color 0.2s ease',
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
    textDecoration: 'none',
  },
  btnSecondary: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: 'transparent',
    color: '#f8fafc',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  btnLarge: {
    padding: '1rem 2rem',
    fontSize: '1rem',
  },
  heroSection: {
    position: 'relative' as const,
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '120px 2rem 80px',
    overflow: 'hidden',
  },
  heroBg: {
    position: 'absolute' as const,
    inset: 0,
    pointerEvents: 'none' as const,
    overflow: 'hidden',
  },
  heroContent: {
    position: 'relative' as const,
    zIndex: 10,
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  heroText: {
    textAlign: 'center' as const,
    maxWidth: '900px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1.25rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '9999px',
    marginBottom: '2rem',
  },
  badgeText: {
    fontSize: '0.875rem',
    color: '#94a3b8',
  },
  title: {
    fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
    fontWeight: 700,
    lineHeight: 1.1,
    marginBottom: '1.5rem',
    textAlign: 'center' as const,
  },
  titleWhite: {
    color: '#f8fafc',
    display: 'block',
  },
  titleGradient: {
    display: 'block',
    background: 'linear-gradient(135deg, #818cf8 0%, #22d3ee 50%, #a855f7 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  description: {
    fontSize: 'clamp(1rem, 2vw, 1.25rem)',
    color: '#94a3b8',
    lineHeight: 1.7,
    maxWidth: '650px',
    marginBottom: '2.5rem',
    textAlign: 'center' as const,
  },
  heroButtons: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '4rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.5rem',
    width: '100%',
    maxWidth: '1000px',
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '16px',
    padding: '1.5rem 1.25rem',
    textAlign: 'center' as const,
    transition: 'all 0.3s ease',
  },
  statValue: {
    fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #818cf8 0%, #22d3ee 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '0.375rem',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  featuresSection: {
    padding: '6rem 2rem',
    background: '#12121a',
  },
  sectionContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  sectionHeader: {
    textAlign: 'center' as const,
    maxWidth: '700px',
    margin: '0 auto 4rem',
  },
  sectionTitle: {
    fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
    fontWeight: 700,
    color: '#f8fafc',
    marginBottom: '1rem',
  },
  sectionSubtitle: {
    fontSize: '1.1rem',
    color: '#94a3b8',
    lineHeight: 1.6,
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.5rem',
  },
  featureCard: {
    background: '#16161f',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '20px',
    padding: '2rem',
    transition: 'all 0.3s ease',
  },
  featureIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
    boxShadow: '0 8px 20px rgba(99, 102, 241, 0.2)',
  },
  featureTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#f8fafc',
    marginBottom: '0.75rem',
  },
  featureDescription: {
    fontSize: '0.95rem',
    color: '#94a3b8',
    lineHeight: 1.6,
  },
  ctaSection: {
    padding: '6rem 2rem',
  },
  ctaCard: {
    position: 'relative' as const,
    maxWidth: '1000px',
    margin: '0 auto',
    background: '#16161f',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '24px',
    padding: '4rem 3rem',
    overflow: 'hidden',
  },
  ctaBg: {
    position: 'absolute' as const,
    inset: 0,
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
    pointerEvents: 'none' as const,
  },
  ctaContent: {
    position: 'relative' as const,
    zIndex: 10,
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
    fontWeight: 700,
    color: '#f8fafc',
    marginBottom: '1rem',
  },
  ctaDescription: {
    fontSize: '1.1rem',
    color: '#94a3b8',
    maxWidth: '550px',
    marginBottom: '2rem',
    lineHeight: 1.6,
  },
  footer: {
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    padding: '2rem',
  },
  footerContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: '1.5rem',
  },
  footerBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: '#64748b',
    fontSize: '0.9rem',
  },
  footerLogo: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  footerLink: {
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '0.875rem',
    transition: 'color 0.2s ease',
  },
};

export default function HomePage() {
  return (
    <div style={styles.page}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navContainer}>
          <Link href="/" style={styles.logo}>
            <div style={styles.logoIcon}>
              <Network style={{ width: 24, height: 24, color: 'white' }} />
            </div>
            <span style={styles.logoText}>GraphInsight</span>
          </Link>
          <div style={styles.navActions}>
            <Link href="/login" style={styles.navLink}>
              Sign In
            </Link>
            <Link href="/register" style={styles.btnPrimary}>
              Get Started
              <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        {/* Background Effects */}
        <div style={styles.heroBg}>
          <div style={{
            position: 'absolute',
            top: '20%',
            left: '20%',
            width: '500px',
            height: '500px',
            background: 'rgba(99, 102, 241, 0.15)',
            borderRadius: '50%',
            filter: 'blur(100px)',
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '20%',
            right: '20%',
            width: '400px',
            height: '400px',
            background: 'rgba(168, 85, 247, 0.12)',
            borderRadius: '50%',
            filter: 'blur(100px)',
          }}></div>
        </div>

        <div style={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={styles.heroText}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={styles.badge}
            >
              <Sparkles style={{ width: 16, height: 16, color: '#818cf8' }} />
              <span style={styles.badgeText}>Powered by Graph ML & Node2Vec</span>
            </motion.div>

            {/* Heading */}
            <h1 style={styles.title}>
              <span style={styles.titleWhite}>Unlock Insights from</span>
              <span style={styles.titleGradient}>Email Network Data</span>
            </h1>

            {/* Description */}
            <p style={styles.description}>
              Analyze organizational communication patterns, predict department membership,
              and discover hidden communities using cutting-edge graph machine learning.
            </p>

            {/* Buttons */}
            <div style={styles.heroButtons}>
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ ...styles.btnPrimary, ...styles.btnLarge }}
                >
                  <Play style={{ width: 20, height: 20 }} />
                  Start Exploring
                </motion.button>
              </Link>
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ ...styles.btnSecondary, ...styles.btnLarge }}
                >
                  View Demo
                  <ChevronRight style={{ width: 20, height: 20 }} />
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={styles.statsGrid}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                style={styles.statCard}
              >
                <div style={styles.statValue}>{stat.value}</div>
                <div style={styles.statLabel}>{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.featuresSection}>
        <div style={styles.sectionContainer}>
          {/* Section Header */}
          <div style={styles.sectionHeader}>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              style={styles.sectionTitle}
            >
              Powerful Analytics Features
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={styles.sectionSubtitle}
            >
              Everything you need to understand and leverage your organizational network data
            </motion.p>
          </div>

          {/* Features Grid */}
          <div style={styles.featuresGrid}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  style={styles.featureCard}
                >
                  <div style={{ ...styles.featureIcon, background: feature.color }}>
                    <Icon style={{ width: 28, height: 28, color: 'white' }} />
                  </div>
                  <h3 style={styles.featureTitle}>{feature.title}</h3>
                  <p style={styles.featureDescription}>{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={styles.ctaCard}
        >
          <div style={styles.ctaBg}></div>
          <div style={styles.ctaContent}>
            <h2 style={styles.ctaTitle}>
              Ready to Analyze Your Network?
            </h2>
            <p style={styles.ctaDescription}>
              Join researchers and data scientists who use GraphInsight to uncover insights from organizational networks.
            </p>
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ ...styles.btnPrimary, ...styles.btnLarge }}
              >
                Get Started for Free
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContainer}>
          <div style={styles.footerBrand}>
            <div style={styles.footerLogo}>
              <Network style={{ width: 20, height: 20, color: 'white' }} />
            </div>
            <span>© 2024 GraphInsight. All rights reserved.</span>
          </div>
          <div style={styles.footerLinks}>
            <Link href="/privacy" style={styles.footerLink}>Privacy</Link>
            <Link href="/terms" style={styles.footerLink}>Terms</Link>
            <Link href="https://github.com" style={styles.footerLink}>GitHub</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
