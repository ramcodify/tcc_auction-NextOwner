import React from 'react';

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-border bg-stone/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-border/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-ink">NEXTowner</span>
              <span className="text-xs text-olive font-normal">— Campus Auction Web Platform</span>
            </div>
            <p className="text-xs text-olive max-w-md">
              A peer-to-peer campus marketplace designed for seamless student bidding, transparent handovers, and sustainable reuse of goods.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-olive">
          <div>
            &copy; {new Date().getFullYear()} NEXTowner. Phase 1 Foundation Active.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-olive">Built by ramvignesh</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
