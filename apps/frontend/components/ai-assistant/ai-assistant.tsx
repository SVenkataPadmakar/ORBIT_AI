"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Bot, ChevronRight, LoaderCircle, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { cofounderApi } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import type { CofounderMessage } from "@/types/api";

export function AiAssistant() {
    const pathname = usePathname(); const params = useParams();
    const projectId = typeof params.projectId === "string" ? params.projectId : undefined;
    const [open, setOpen] = useState(false); const [message, setMessage] = useState("");
    const [local, setLocal] = useState<CofounderMessage[]>([]); const bottom = useRef<HTMLDivElement>(null);
    const history = useQuery({ queryKey: ["cofounder-history", projectId], queryFn: () => cofounderApi.history(projectId), enabled: open });
    useEffect(() => { if (history.data) setLocal(history.data); }, [history.data]);
    useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [local]);
    const send = useMutation({ mutationFn: (text: string) => cofounderApi.chat(text, projectId, pathname), onSuccess: (data) => setLocal((items) => [...items, { role: "assistant", content: data.answer, created_at: new Date().toISOString() }]) });
    function submit(event: FormEvent) { event.preventDefault(); const text = message.trim(); if (!text || send.isPending) return; setLocal((items) => [...items, { role: "user", content: text, created_at: new Date().toISOString() }]); setMessage(""); send.mutate(text); }
    return <>
        <button onClick={() => setOpen(true)} aria-label="Open AI co-founder" className={cn("fixed bottom-5 right-5 z-50 flex h-14 items-center gap-3 rounded-full border border-accent/30 bg-[#111525] px-4 text-sm font-bold shadow-[0_12px_45px_rgba(0,0,0,.5)] hover:border-accent", open && "hidden")}><span className="relative flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-accent to-indigo-700"><Sparkles className="size-4 text-white" /><span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-emerald-400 ring-2 ring-[#111525]" /></span><span className="hidden sm:inline">AI Co-Founder</span></button>
        {open && <aside className="fixed inset-x-3 bottom-3 z-[70] flex h-[min(720px,calc(100vh-24px))] flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#0c0f1a]/95 shadow-2xl backdrop-blur-2xl sm:left-auto sm:w-[420px]">
            <header className="flex items-center gap-3 border-b border-white/10 p-4"><span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent/50 to-indigo-800"><Bot className="size-5" /></span><div><h2 className="text-sm font-bold">Your AI Co-Founder</h2><p className="text-[11px] text-muted-foreground">Gemini · project memory active</p></div><button onClick={() => setOpen(false)} className="icon-button ml-auto" aria-label="Close assistant"><X className="size-4" /></button></header>
            <div className="border-b border-white/10 bg-accent-soft/10 px-4 py-3 text-xs leading-5 text-muted-foreground">I can challenge strategy, explain agent decisions, design your stack, and turn uncertainty into the next executable step.</div>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">{local.length === 0 && !history.isLoading && <div className="py-8 text-center"><MessageCircle className="mx-auto size-8 text-accent" /><h3 className="mt-4 font-bold">What should we build next?</h3><p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-muted-foreground">Ask about product, market, architecture, launch, finances, or why an agent made a recommendation.</p><div className="mt-5 space-y-2 text-left">{["Challenge my riskiest assumption", "Design the MVP architecture", "What should I execute this week?"].map((item) => <button key={item} onClick={() => setMessage(item)} className="flex w-full items-center rounded-lg border border-white/10 p-3 text-xs hover:bg-white/[.04]">{item}<ChevronRight className="ml-auto size-3.5 text-coral" /></button>)}</div></div>}{local.map((item, index) => <div key={`${item.created_at}-${index}`} className={cn("max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6", item.role === "user" ? "ml-auto rounded-br-sm bg-accent text-white" : "rounded-bl-sm border border-white/10 bg-white/[.04] text-foreground")}>{item.content}</div>)}{send.isPending && <div className="flex items-center gap-2 text-xs text-muted-foreground"><LoaderCircle className="size-4 animate-spin text-accent" />Reviewing project memory and reasoning…</div>}<div ref={bottom} /></div>
            <form onSubmit={submit} className="border-t border-white/10 p-3"><div className="flex items-end gap-2 rounded-xl border border-white/10 bg-black/20 p-2 focus-within:border-accent/50"><textarea rows={2} value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} className="min-h-11 flex-1 resize-none bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground" placeholder="Ask your co-founder…" /><button disabled={!message.trim() || send.isPending} className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-coral text-white disabled:opacity-40"><Send className="size-4" /></button></div><p className="mt-2 text-center text-[10px] text-muted-foreground">AI advice includes explicit assumptions. Verify critical decisions.</p></form>
        </aside>}
    </>;
}
