'use client'

import Link from 'next/link'
import { Leaf } from 'lucide-react'
import Section from '@/components/legal/Section'

const LAST_UPDATED = 'June 9, 2026'
const CONTACT_EMAIL = 'support@moment-app.com'

export default function TermsPage() {
  return (
    <>
      {/* Header */}
      <div className="pt-8 pb-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--gp)' }}>
            <Leaf size={16} color="white" strokeWidth={1.75} />
          </div>
          <span className="text-[14px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--gp)' }}>
            Moment
          </span>
        </div>
        <h1 className="text-[28px] font-bold mb-2"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}>
          Terms of Service
        </h1>
        <p className="text-[13px]" style={{ color: 'var(--tg)' }}>
          Last updated: {LAST_UPDATED}
        </p>
      </div>

      {/* Content */}
      <div className="py-6 flex flex-col gap-6" style={{ color: 'var(--td)' }}>

        <Section title="1. Acceptance of Terms">
          By accessing or using Moment: One at a Time (&quot;the App&quot;), you agree to be bound
          by these Terms of Service. If you do not agree to these terms, please do not use the App.
          These terms apply to all visitors, users, and others who access or use the App.
        </Section>

        <Section title="2. Description of Service">
          Moment is a productivity web application that helps users focus on one task at a time.
          The App offers a free tier and a paid Pro subscription. Features differ between tiers
          as described on our{' '}
          <Link href="/upgrade" style={{ color: 'var(--gp)' }}>pricing page</Link>.
        </Section>

        <Section title="3. Accounts">
          You must provide accurate and complete information when creating an account. You are
          responsible for maintaining the security of your account and password. You are
          responsible for all activity that occurs under your account. We reserve the right to
          terminate accounts that violate these terms.
        </Section>

        <Section title="4. Subscriptions and Payments">
          Pro subscriptions are billed on a monthly or annual basis through Paddle, our payment
          processor. By subscribing, you authorize Paddle to charge your payment method on a
          recurring basis. You may cancel your subscription at any time. Cancellation takes
          effect at the end of the current billing period — you retain Pro access until then.
          No partial refunds are issued for unused time within a billing period unless required
          by applicable law.
        </Section>

        <Section title="5. Free Trial">
          New accounts receive a 7-day free Pro trial. No credit card is required to start the
          trial. At the end of the trial period, your account will revert to the free tier unless
          you subscribe to Pro. No charges are applied automatically at trial end.
        </Section>

        <Section title="6. Acceptable Use">
          You agree not to misuse the App. Prohibited activities include attempting to gain
          unauthorised access to any part of the App, using automated means to access the App
          without permission, transmitting malware or harmful code, or using the App for any
          unlawful purpose.
        </Section>

        <Section title="7. Intellectual Property">
          The App and its original content, features, and functionality are owned by Moment and
          are protected by applicable intellectual property laws. You retain ownership of any
          content you create within the App, such as task titles and notes.
        </Section>

        <Section title="8. Data and Privacy">
          Your use of the App is also governed by our{' '}
          <Link href="/privacy" style={{ color: 'var(--gp)' }}>Privacy Policy</Link>, which is
          incorporated into these Terms by reference.
        </Section>

        <Section title="9. Disclaimers">
          The App is provided &quot;as is&quot; without warranties of any kind, either express or
          implied. We do not warrant that the App will be uninterrupted, error-free, or free of
          harmful components. We are not responsible for any loss of data.
        </Section>

        <Section title="10. Limitation of Liability">
          To the maximum extent permitted by law, Moment shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages arising from your use of the
          App, even if we have been advised of the possibility of such damages.
        </Section>

        <Section title="11. Termination">
          We reserve the right to suspend or terminate your account at our discretion if you
          violate these Terms. Upon termination, your right to use the App ceases. Free tier
          data is retained for 90 days after termination to allow for reactivation.
        </Section>

        <Section title="12. Changes to Terms">
          We may update these Terms from time to time. We will notify users of significant
          changes via email or an in-app notice. Continued use of the App after changes
          constitutes acceptance of the updated Terms.
        </Section>

        <Section title="13. Contact">
          If you have any questions about these Terms, please contact us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--gp)' }}>
            {CONTACT_EMAIL}
          </a>.
        </Section>

      </div>

      {/* Footer links */}
      <div className="flex gap-4 pb-8 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <Link href="/privacy" className="text-[13px]" style={{ color: 'var(--gp)' }}>Privacy Policy</Link>
        <Link href="/refund" className="text-[13px]" style={{ color: 'var(--gp)' }}>Refund Policy</Link>
        <Link href="/dashboard" className="text-[13px]" style={{ color: 'var(--tg)' }}>Back to App</Link>
      </div>
    </>
  )
}