export default function Header() {
  return (
    <header className="w-full bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <a href="https://innotrax.io" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="InnoTrax Logo"
            className="h-8 w-auto hover:opacity-90 transition"
          />
          <span className="text-xl font-semibold text-gray-800 hover:text-green-700 transition">
            InnoTrax
          </span>
        </a>
      </div>

      <nav className="hidden md:flex gap-6 text-gray-600">
        <a href="https://innotrax.io" className="hover:text-green-700">
          Startseite
        </a>
        <a href="#" className="hover:text-green-700">
          Leistungen
        </a>
        <a href="#" className="hover:text-green-700">
          ParkPred
        </a>
        <a href="#" className="hover:text-green-700">
          Kontakt
        </a>
      </nav>
    </header>
  );
}
