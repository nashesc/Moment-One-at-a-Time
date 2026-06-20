export default function Section({ title, children }: { title: string; children: React.ReactNode }) {
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