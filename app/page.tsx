export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a5f 0%, #0f1e30 100%)' }}>
      <div style={{ textAlign: 'center', color: 'white', padding: '40px' }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: '#e85d04', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 24, fontWeight: 900 }}>
          RQ
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 900, margin: '0 0 12px' }}>RoofQuote</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18, margin: '0 0 40px' }}>
          Automated Roofing Estimates Powered by Aerial Intelligence
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/admin/signup" style={{ padding: '14px 28px', borderRadius: 12, background: '#e85d04', color: 'white', fontWeight: 700, textDecoration: 'none', fontSize: 15 }}>
            Get Started Free →
          </a>
          <a href="/admin/login" style={{ padding: '14px 28px', borderRadius: 12, background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 700, textDecoration: 'none', fontSize: 15, border: '1px solid rgba(255,255,255,0.2)' }}>
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
