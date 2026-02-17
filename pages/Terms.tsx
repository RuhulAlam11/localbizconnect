
import React from 'react';

const Terms: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="bg-white p-12 md:p-20 rounded-[4rem] shadow-2xl border border-slate-100">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-12">Terms & Conditions</h1>
        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest mb-4">1. Acceptance of Terms</h3>
            <p className="text-slate-500 font-medium leading-relaxed">By accessing LocalBiz Connect, you agree to be bound by these terms. We connect neighbors with verified local shops to empower neighborhood commerce.</p>
          </section>
          <section>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest mb-4">2. Marketplace Conduct</h3>
            <p className="text-slate-500 font-medium leading-relaxed">Shopkeepers must provide accurate product and pricing information. Customers are expected to respect local businesses and neighborhood delivery guidelines.</p>
          </section>
          <section>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest mb-4">3. Payments & Quotes</h3>
            <p className="text-slate-500 font-medium leading-relaxed">Payments for custom quotes are final. LocalBiz Connect facilitates the transaction, but actual product fulfillment is the responsibility of the local merchant.</p>
          </section>
          <section>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest mb-4">4. Verification</h3>
            <p className="text-slate-500 font-medium leading-relaxed">Admin verification is required for all shops to ensure community trust. Verification is at the sole discretion of the LocalBiz administration.</p>
          </section>
          <div className="pt-12 border-t border-slate-100">
            <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.4em]">Last Updated: Oct 2023 • Community Shield Policy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
