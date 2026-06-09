'use client'

import Link from 'next/link'
import { Leaf } from 'lucide-react'
import BottomNav from '@/components/ui/BottomNav'
import DesktopSidebar from '@/components/ui/DesktopSidebar'

const LAST_UPDATED = 'June 9, 2026'
const CONTACT_EMAIL = 'support@moment-app.com'

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--ow)' }}>
      <DesktopSidebar />

      <div className="flex flex-col flex-1 min-w-0 pb-24 md:pb-8 px-5 md:px-8 max-w-2xl">
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
            Privacy Policy
          </h1>
          <p className="text-[13px]" style={{ color: 'var(--tg)' }}>
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        {/* Content */}
        <div className="py-6 flex flex-col gap-6">

          <Section title="1. Overview">
            Moment: One at a Time (&quot;we&quot;, &quot;our&quot;, or &quot;the App&quot;) is
            committed to protecting your privacy. This policy explains what data we collect, how
            we use it, and your rights regarding that data.
          </Section>

          <Section title="2. Data We Collect">
            We collect the following types of data:
            <ul>
              <li><strong>Account data:</strong> your name and email address when you register.</li>
              <li><strong>Task data:</strong> task titles, descriptions, priorities, statuses, and scheduled dates that you create within the App.</li>
              <li><strong>Usage data:</strong> check-ins, momentum scores, and recap summaries generated from your task activity.</li>
              <li><strong>Payment data:</strong> subscription status and billing period. We do not store card details — payments are handled by Paddle.</li>
              <li><strong>Device data:</strong> push notification subscription tokens if you opt in to notifications.</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Data">
            We use your data solely to provide and improve the App:
            <ul>
              <li>To authenticate you and maintain your session.</li>
              <li>To display your tasks, history, and momentum stats.</li>
              <li>To process your subscription and manage access to Pro features.</li>
              <li>To send push notifications if you have opted in.</li>
              <li>To improve App performance and fix bugs.</li>
            </ul>
            We do not sell your data. We do not use your data for advertising.
          </Section>

          <Section title="4. Data Storage">
            Your data is stored in Supabase, a secure PostgreSQL database provider. Data is
            encrypted at rest and in transit. The App also stores a local offline copy of your
            tasks in your browser&apos;s IndexedDB for offline functionality. This data stays
            on your device.
          </Section>

          <Section title="5. Third-Party Services">
            We use the following third-party services:
            <ul>
              <li><strong>Supabase</strong> — database and authentication.</li>
              <li><strong>Paddle</strong> — payment processing and subscription management.</li>
              <li><strong>Vercel</strong> — hosting and deployment.</li>
              <li><strong>Upstash Redis</strong> — rate limiting (no personal data stored).</li>
            </ul>
            Each provider has their own privacy policy governing their data handling.
          </Section>

          <Section title="6. Cookies and Local Storage">
            The App uses cookies to maintain your authentication session via Supabase. We also
            use localStorage to store your in-app preferences (such as display settings) scoped
            to your account. We do not use tracking or advertising cookies.
          </Section>

          <Section title="7. Data Retention">
            Your data is retained for as long as your account is active. If you delete your
            account, your personal data is deleted within 30 days. Task data and check-ins
            associated with your account are deleted at the same time.
          </Section>

          <Section title="8. Your Rights">
            Depending on your location, you may have the right to access, correct, or delete
            your personal data. To exercise these rights, contact us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--gp)' }}>
              {CONTACT_EMAIL}
            </a>. We will respond within 30 days.
          </Section>

          <Section title="9. Children's Privacy">
            The App is not intended for children under 13. We do not knowingly collect personal
            data from children under 13. If you believe a child has provided us with personal
            data, please contact us immediately.
          </Section>

          <Section title="10. Changes to This Policy">
            We may update this Privacy Policy from time to time. We will notify you of significant
            changes via email or an in-app notice. Continued use of the App after changes
            constitutes acceptance of the updated policy.
          </Section>

          <Section title="11. Contact">
            For privacy-related questions or requests, contact us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--gp)' }}>
              {CONTACT_EMAIL}
            </a>.
          </Section>

        </div>

        {/* Footer links */}
        <div className="flex gap-4 pb-8 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <Link href="/terms" className="text-[13px]" style={{ color: 'var(--gp)' }}>Terms of Service</Link>
          <Link href="/refund" className="text-[13px]" style={{ color: 'var(--gp)' }}>Refund Policy</Link>
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