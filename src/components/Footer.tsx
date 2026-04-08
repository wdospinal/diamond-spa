import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-surface-container-low py-20 px-6 md:px-12">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">

        {/* Brand */}
        <div className="md:col-span-1">
          <div className="text-xl font-headline tracking-tighter text-primary mb-6">Diamond Spa</div>
          <p className="text-slate-500 font-body text-sm leading-relaxed">
            The intersection of high-performance recovery and quiet luxury. Curated for the modern professional.
          </p>
        </div>

        {/* Sanctuary */}
        <div className="flex flex-col gap-3">
          <h5 className="text-on-surface font-label text-xs tracking-widest uppercase mb-2">Sanctuary</h5>
          <Link href="/services" className="text-slate-500 hover:text-primary font-body text-sm transition-colors duration-200">Services</Link>
          <Link href="/about"    className="text-slate-500 hover:text-primary font-body text-sm transition-colors duration-200">Philosophy</Link>
          <Link href="/about"    className="text-slate-500 hover:text-primary font-body text-sm transition-colors duration-200">Our Heritage</Link>
          <Link href="/location" className="text-slate-500 hover:text-primary font-body text-sm transition-colors duration-200">Location</Link>
        </div>

        {/* Legal */}
        <div className="flex flex-col gap-3">
          <h5 className="text-on-surface font-label text-xs tracking-widest uppercase mb-2">Legal</h5>
          <Link href="#" className="text-slate-500 hover:text-primary font-body text-sm transition-colors duration-200">Privacy Policy</Link>
          <Link href="#" className="text-slate-500 hover:text-primary font-body text-sm transition-colors duration-200">Terms of Service</Link>
          <Link href="#" className="text-slate-500 hover:text-primary font-body text-sm transition-colors duration-200">Press Inquiries</Link>
          <Link href="#" className="text-slate-500 hover:text-primary font-body text-sm transition-colors duration-200">Contact</Link>
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-4">
          <h5 className="text-on-surface font-label text-xs tracking-widest uppercase mb-2">Inquiry</h5>
          <p className="text-slate-500 font-body text-sm">concierge@diamondspa.intl</p>
          <p className="text-slate-500 font-body text-sm">+1 (800) DIAMOND</p>
          <div className="flex gap-4 mt-2">
            <span className="material-symbols-outlined text-slate-500 text-xl hover:text-primary cursor-pointer transition-colors">share</span>
            <span className="material-symbols-outlined text-slate-500 text-xl hover:text-primary cursor-pointer transition-colors">public</span>
            <span className="material-symbols-outlined text-slate-500 text-xl hover:text-primary cursor-pointer transition-colors">mail</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-screen-2xl mx-auto mt-16 pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-slate-500 font-body text-xs tracking-widest uppercase">
          © 2024 Diamond Spa Sanctuary. International Standards of Excellence.
        </p>
        <div className="flex gap-6">
          <Link href="#" className="text-slate-500 hover:text-primary font-body text-xs tracking-widest uppercase transition-colors">Privacy</Link>
          <Link href="#" className="text-slate-500 hover:text-primary font-body text-xs tracking-widest uppercase transition-colors">Terms</Link>
          <Link href="#" className="text-slate-500 hover:text-primary font-body text-xs tracking-widest uppercase transition-colors">Press</Link>
        </div>
      </div>
    </footer>
  )
}
