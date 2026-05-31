import Link from "next/link";
import { Home, List, BarChart2, Leaf, Settings } from "lucide-react"; // Assuming Lucide for clean icons

export function Navigation() {
  const navItems = [
    { label: "Today", href: "/dashboard", icon: Home },
    { label: "Moments", href: "/moments", icon: List },
    { label: "Recap", href: "/recap", icon: BarChart2 },
    { label: "Reflections", href: "/reflections", icon: Leaf },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-pale-green pb-safe z-50">
        <ul className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Link href={item.href} className="flex flex-col items-center p-2 text-text-gray hover:text-nature-green transition-colors">
                  <Icon size={20} />
                  <span className="text-[10px] mt-1 font-inter">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-pale-green p-6 z-50">
        <div className="font-playfair text-2xl text-nature-green mb-12">Moment.</div>
        <ul className="flex flex-col space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Link href={item.href} className="flex items-center space-x-3 p-3 rounded-lg text-text-gray hover:bg-pale-green/20 hover:text-nature-green transition-colors">
                  <Icon size={20} />
                  <span className="font-inter text-sm">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}