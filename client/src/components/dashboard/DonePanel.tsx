const quotes = [
  "That's one less thing between you and the rest of your day.",
  "Progress is still progress. Even the small ones.",
  "You showed up. That's everything.",
  "One moment at a time — and you just finished one.",
]

export default function DonePanel({ taskTitle }: { taskTitle: string }) {
  const quote = quotes[Math.floor(Math.random() * quotes.length)]
  return (
    <div className="mx-5 mt-2 rounded-2xl bg-[#eaf3de] border border-[#c0dd97] px-5 py-4 animate-[slideUp_0.3s_ease]">
      <p
        className="text-[15px] leading-relaxed text-[#27500A] mb-1"
        style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
      >
        "{quote}"
      </p>
      <p className="text-[12px] text-[#3B6D11]">
        <span className="line-through opacity-60">{taskTitle}</span> — completed
      </p>
    </div>
  )
}