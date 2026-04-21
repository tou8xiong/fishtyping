import { TypingSettings } from "@/features/typing-test/components/TypingSettings";

export default function SettingsPage() {
  return (
    <div className="flex-1 flex flex-col items-center py-20 px-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-3xl z-10 space-y-12 animate-fade-in">
        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tighter">Settings</h1>
          <p className="text-lg text-foreground/40 font-medium">Fine-tune your experience for maximum efficiency.</p>
        </div>

        <div className="glass p-8 rounded-md shadow-2xl">
          <TypingSettings />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 glass glass-hover rounded-md space-y-3">
            <div className="text-primary font-black text-xs tracking-widest uppercase">Visuals</div>
            <h3 className="text-xl font-bold">Custom Themes</h3>
            <p className="text-sm text-foreground/40 leading-relaxed">Choose from our curated collection of themes or create your own CSS-based styles.</p>
            <button className="mt-4 text-sm font-bold text-primary underline underline-offset-4 decoration-2">Coming Soon</button>
          </div>
          <div className="p-6 glass glass-hover rounded-md space-y-3">
            <div className="text-primary font-black text-xs tracking-widest uppercase">Controls</div>
            <h3 className="text-xl font-bold">Key Bindings</h3>
            <p className="text-sm text-foreground/40 leading-relaxed">Remap your keyboard shortcuts for resetting, navigating, and managing tests.</p>
            <button className="mt-4 text-sm font-bold text-primary underline underline-offset-4 decoration-2">Coming Soon</button>
          </div>
        </div>
      </div>
    </div>
  );
}
