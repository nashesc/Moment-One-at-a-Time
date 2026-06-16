'use client'

import Link from 'next/link'
import { Leaf } from 'lucide-react'
import BottomNav from '@/components/ui/BottomNav'
import DesktopSidebar from '@/components/ui/DesktopSidebar'

const LAST_UPDATED = 'June 9, 2026'
const CONTACT_EMAIL = 'support@moment-app.com'

export default function RefundPage() {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--ow)' }}>
      <DesktopSidebar />

      <div className="flex flex-col flex-1 min-w-0 pb-24 md:pb-8 px-5 md:px-8 max-w-2xl moment-col moment-col--center w-full">
        {/* Header */}
        <div className="pt-8 pb-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--gp)' }}>
              <Leaf size={16} color="white" strokeWidth={1.75} />
            </div>
            <span className="text-[14px] font-semibold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--gp)' }}>
              Moment
            </span>
          </div>
          <h1 className="text-[28px] font-bold mb-2"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}>
            Refund Policy
          </h1>
          <p className="text-[13px]" style={{ color: 'var(--tg)' }}>
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        {/* Content */}
        <div className="py-6 flex flex-col gap-6">

          <Section title="Our Approach">
            We want you to feel confident subscribing to Moment Pro. If something goes wrong,
            we will do our best to make it right. This policy outlines when refunds apply and
            how to request one.
          </Section>

          <Section title="Free Trial">
            All new accounts receive a 7-day free Pro trial with no credit card required.
            We encourage you to use the trial to evaluate Pro features before subscribing.
            No charges are applied at the end of the trial — your account simply reverts
            to the free tier.
          </Section>

          <Section title="Cancellations">
            You may cancel your Pro subscription at any time from your account settings or
            by contacting us. Cancellation takes effect at the end of your current billing
            period. You will retain full Pro access until that date. No further charges
            will be made after cancellation.
          </Section>

          <Section title="Refund Eligibility">
            We offer refunds in the following situations:
            <ul>
              <li>You were charged after cancelling your subscription due to a technical error.</li>
              <li>You were charged twice for the same billing period.</li>
              <li>The App experienced significant downtime or critical failure during your
                  paid period that materially prevented you from using it.</li>
              <li>You subscribed within the last 7 days and have not made significant use
                  of Pro features.</li>
            </ul>
            We do not offer refunds for partial unused billing periods in general, or for
            forgetting to cancel before a renewal date.
          </Section>

          <Section title="How to Request a Refund">
            To request a refund, email us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--gp)' }}>
              {CONTACT_EMAIL}
            </a>{' '}
            with the subject line &quot;Refund Request&quot; and include:
            <ul>
              <li>The email address associated with your account.</li>
              <li>The date of the charge.</li>
              <li>The reason for your refund request.</li>
            </ul>
            We will respond within 3 business days. Approved refunds are processed through
            Paddle and typically appear within 5–10 business days depending on your bank.
          </Section>

          <Section title="Chargebacks">
            We ask that you contact us before initiating a chargeback with your bank.
            We can usually resolve issues faster directly. Accounts with active chargebacks
            may be suspended while the dispute is in progress.
          </Section>

          <Section title="Changes to This Policy">
            We may update this Refund Policy from time to time. Changes will be posted on
            this page with an updated date. Continued use of the App after changes constitutes
            acceptance of the updated policy.
          </Section>

          <Section title="Contact">
            Questions about refunds? Reach us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--gp)' }}>
              {CONTACT_EMAIL}
            </a>.
          </Section>

        </div>

        {/* Footer links */}
        <div className="flex gap-4 pb-8 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <Link href="/terms" className="text-[13px]" style={{ color: 'var(--gp)' }}>Terms of Service</Link>
          <Link href="/privacy" className="text-[13px]" style={{ color: 'var(--gp)' }}>Privacy Policy</Link>
          <Link href="/dashboard" className="text-[13px]" style={{ color: 'var(--tg)' }}>Back to App</Link>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[16px] font-semibold mb-2"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--td)' }}>
        {title}
      </h2>
      <div className="text-[14px] leading-relaxed [&_ul]:mt-2 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5 [&_ul]:pl-4 [&_li]:list-disc"
        style={{ color: 'var(--tg)' }}>
        {children}
      </div>
    </div>
  )
}