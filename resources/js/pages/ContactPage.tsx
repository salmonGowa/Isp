import { useState } from "react";
import {
    Mail, Phone, MapPin, Send, Clock, ShieldCheck, CheckCircle2, Loader2,
    HelpCircle, ChevronDown, AlertCircle, MessageCircle, MessageCircleQuestion,
    Sparkles, Wrench, Hash, Gauge,
} from "lucide-react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { useOfficeStatus } from "../lib/officeStatus";

const WHATSAPP_NUMBER = "254700000000";

const CONTACT_FAQS = [
    {
        q: "How do I report a service outage?",
        a: "Select \"Technical Support\" below and include your subscriber ID and affected service — outage reports are triaged first. If you're already a subscriber, you can also open a ticket directly from the customer portal for faster tracking.",
    },
    {
        q: "Can I get help migrating my existing subscriber data?",
        a: "Yes. Our onboarding team can help import subscribers, plans, and billing history from spreadsheets or another platform. Tell us roughly how many records you're moving and we'll scope the migration with you.",
    },
    {
        q: "Do you offer onboarding and staff training?",
        a: "Every plan includes guided onboarding for your admin and NOC staff, covering subscriber management, billing runs, and network monitoring. Growth and Scale plans include live training sessions.",
    },
    {
        q: "What are your support hours?",
        a: "Our support desk is staffed Monday–Friday, 8am–6pm EAT (see the live status badge on this page). Growth and Scale plans include priority queuing outside those hours for critical outages.",
    },
];

const SUBJECT_OPTIONS = [
    { value: "Sales Inquiry", label: "Sales", icon: Sparkles },
    { value: "Technical Support", label: "Support", icon: Wrench },
    { value: "General Inquiry", label: "General", icon: MessageCircleQuestion },
] as const;

const MESSAGE_MAX_LENGTH = 800;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [errorFeedback, setErrorFeedback] = useState<string | null>(null);
    const [emailTouched, setEmailTouched] = useState(false);
    const officeStatus = useOfficeStatus();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "Sales Inquiry",
        message: "",
        // ── SUPPORT INTAKE METADATA KEYS ──
        affectedService: "Internet connectivity",
        subscriberId: "",
        urgency: "Medium",
        contactMethod: "Email",
    });

    const isSupportQuery = formData.subject === "Technical Support";
    const emailValid = formData.email.length === 0 || EMAIL_PATTERN.test(formData.email);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorFeedback(null);

        if (!EMAIL_PATTERN.test(formData.email)) {
            setEmailTouched(true);
            return;
        }

        setIsSubmitting(true);

        try {
            // No public contact endpoint exists yet — this simulates the round
            // trip so the form is fully interactive; wire to a real backend
            // route when one is ready.
            await new Promise((resolve) => setTimeout(resolve, 900));
            setSubmitted(true);
            setEmailTouched(false);
            setFormData({
                name: "",
                email: "",
                subject: "Sales Inquiry",
                message: "",
                affectedService: "Internet connectivity",
                subscriberId: "",
                urgency: "Medium",
                contactMethod: "Email",
            });
        } catch (error: any) {
            setErrorFeedback("We couldn't send your message right now. Please check your details and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 antialiased">
            <Nav />

            {/* ── PAGE HEADER ── */}
            <div className="border-b border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900/40 px-4 sm:px-6 py-12 sm:py-16">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3.5 py-1 text-[13px] font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 mb-4">
                        Get in touch
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                        Talk to the Latticefi team
                    </h1>
                    <p className="mt-3 text-slate-600 dark:text-slate-400 text-[15px] max-w-xl mx-auto">
                        Sales questions, technical support, or just curious how the platform fits your network —
                        send us a message and we'll reply within 24 hours.
                    </p>
                </div>
            </div>

            {/* ── CORE CENTRAL WORKSPACE DIVISION GRID ── */}
            <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* LEFT 7-COLUMNS: THE PRIMARY CONTACT FORM */}
                    <section className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 p-6 md:p-8 shadow-xs space-y-6">
                        <div>
                            <span className="block uppercase text-xs font-black tracking-widest text-indigo-600 dark:text-indigo-400 mb-1.5">
                                Send a message
                            </span>
                            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
                                Tell us what you need, and our team will reply within 24 hours.
                            </h3>
                        </div>

                        {submitted ? (
                            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 text-emerald-900 dark:text-emerald-300 space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shadow-2xs">
                                    <CheckCircle2 size={20} />
                                </div>
                                <div>
                                    <h4 className="font-black text-sm uppercase tracking-wide">
                                        Message sent
                                    </h4>
                                    <p className="text-xs font-semibold text-emerald-700/90 dark:text-emerald-400/90 mt-1 leading-relaxed">
                                        Thanks for reaching out — we've received your message and a member
                                        of our team will get back to you within 24 hours.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="text-xs font-bold underline text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-300 transition-colors pt-2 cursor-pointer"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleFormSubmit} className="space-y-4">
                                {errorFeedback && (
                                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-red-700 dark:text-red-400 text-xs font-semibold flex items-start gap-2">
                                        <AlertCircle size={15} className="shrink-0 mt-0.5" />
                                        {errorFeedback}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Name Input */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                            Full name <span className="text-indigo-600 dark:text-indigo-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            disabled={isSubmitting}
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Amina Wanjiru"
                                            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-bold p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-medium transition-all"
                                        />
                                    </div>

                                    {/* Email Input */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                            Email address <span className="text-indigo-600 dark:text-indigo-400">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            disabled={isSubmitting}
                                            value={formData.email}
                                            onBlur={() => setEmailTouched(true)}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="e.g. amina@example.com"
                                            aria-invalid={emailTouched && !emailValid}
                                            className={`w-full bg-slate-50 dark:bg-slate-800/60 border text-slate-900 dark:text-slate-100 text-xs font-bold p-3.5 rounded-xl focus:outline-none focus:ring-2 placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-medium transition-all ${
                                                emailTouched && !emailValid
                                                    ? "border-red-300 dark:border-red-800 focus:ring-red-400/30 focus:border-red-400"
                                                    : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/40 focus:border-indigo-500"
                                            }`}
                                        />
                                        {emailTouched && !emailValid && (
                                            <p className="text-[10px] font-bold text-red-500 dark:text-red-400 flex items-center gap-1 pt-0.5">
                                                <AlertCircle size={10} /> Enter a valid email address
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Subject Selector: interactive icon cards */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                        What can we help with? <span className="text-indigo-600 dark:text-indigo-400">*</span>
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {SUBJECT_OPTIONS.map((opt) => {
                                            const active = formData.subject === opt.value;
                                            const Icon = opt.icon;
                                            return (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    disabled={isSubmitting}
                                                    onClick={() => setFormData({ ...formData, subject: opt.value })}
                                                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all cursor-pointer disabled:opacity-50 ${
                                                        active
                                                            ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                                                            : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-200"
                                                    }`}
                                                >
                                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${active ? "bg-white/15" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"}`}>
                                                        <Icon size={15} />
                                                    </span>
                                                    <span className="text-[10px] font-black leading-tight">{opt.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* ── INTERACTIVE SUPPORT INTAKE SUB-FORM ── */}
                                {isSupportQuery && (
                                    <div className="p-4 bg-indigo-50/50 dark:bg-indigo-500/10 border border-indigo-200/70 dark:border-indigo-800/50 rounded-2xl space-y-4">
                                        <div className="flex items-center gap-2 border-b border-indigo-200/50 dark:border-indigo-800/40 pb-2">
                                            <Wrench size={15} className="text-indigo-600 dark:text-indigo-400" />
                                            <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                                                Support ticket details
                                            </h4>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {/* Affected service */}
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
                                                    Affected service
                                                </label>
                                                <select
                                                    value={formData.affectedService}
                                                    onChange={(e) => setFormData({ ...formData, affectedService: e.target.value })}
                                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-bold p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                                                >
                                                    <option value="Internet connectivity">Internet connectivity</option>
                                                    <option value="Billing & invoices">Billing & invoices</option>
                                                    <option value="Router / equipment">Router / equipment</option>
                                                    <option value="Account access">Account access</option>
                                                </select>
                                            </div>

                                            {/* Subscriber / account ID */}
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
                                                    <Hash size={10} /> Subscriber ID (if known)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.subscriberId}
                                                    onChange={(e) => setFormData({ ...formData, subscriberId: e.target.value })}
                                                    placeholder="e.g. SUB-1042"
                                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-bold p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400 placeholder:font-medium"
                                                />
                                            </div>

                                            {/* Urgency */}
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
                                                    <Gauge size={10} /> Urgency
                                                </label>
                                                <select
                                                    value={formData.urgency}
                                                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-bold p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                                                >
                                                    <option value="Low">Low</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="High">High</option>
                                                    <option value="Urgent">Urgent — service down</option>
                                                </select>
                                            </div>

                                            {/* Preferred contact method */}
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
                                                    Preferred contact method
                                                </label>
                                                <select
                                                    value={formData.contactMethod}
                                                    onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value })}
                                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-bold p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                                                >
                                                    <option value="Email">Email</option>
                                                    <option value="Phone">Phone call</option>
                                                    <option value="WhatsApp">WhatsApp</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Message Field Block */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                            Message <span className="text-indigo-600 dark:text-indigo-400">*</span>
                                        </label>
                                        <span className={`text-[10px] font-bold font-mono ${formData.message.length > MESSAGE_MAX_LENGTH - 40 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-600'}`}>
                                            {formData.message.length}/{MESSAGE_MAX_LENGTH}
                                        </span>
                                    </div>
                                    <textarea
                                        rows={5}
                                        required
                                        disabled={isSubmitting}
                                        maxLength={MESSAGE_MAX_LENGTH}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder={isSupportQuery ? "Describe the issue, when it started, and anything you've already tried..." : "Tell us about your network size, subscriber count, and what you're hoping to solve — the more detail, the better we can help."}
                                        className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-medium transition-all resize-none"
                                    />
                                </div>

                                {/* Submit Action Trigger */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 active:scale-99 disabled:opacity-50 shadow-md cursor-pointer"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={13} className="animate-spin" /> Sending...
                                        </>
                                    ) : (
                                        <>
                                            Send Message <Send size={13} />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </section>

                    {/* RIGHT 5-COLUMNS: CONTACT METHODS + FAQ */}
                    <aside className="lg:col-span-5 space-y-6">
                        {/* Quick Contact Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 p-5 shadow-xs space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                                    <Clock size={13} className="text-indigo-500 dark:text-indigo-400" /> Reach out
                                </h3>
                                <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${
                                    officeStatus.open
                                        ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                                        : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${officeStatus.open ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                    {officeStatus.open ? 'Online' : 'Offline'}
                                </span>
                            </div>

                            <div className="space-y-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                <a
                                    href="mailto:support@latticefi.com"
                                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shadow-2xs shrink-0">
                                        <Mail size={14} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase">Email</div>
                                        <div className="text-slate-900 dark:text-slate-100 font-bold group-hover:underline">support@latticefi.com</div>
                                    </div>
                                </a>

                                <a
                                    href="tel:+254700000000"
                                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shadow-2xs shrink-0">
                                        <Phone size={14} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase">Phone</div>
                                        <div className="text-slate-900 dark:text-slate-100 font-bold group-hover:underline">+254 700 000 000</div>
                                    </div>
                                </a>

                                <a
                                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shadow-2xs shrink-0">
                                        <MessageCircle size={14} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase">WhatsApp</div>
                                        <div className="text-slate-900 dark:text-slate-100 font-bold group-hover:underline">Chat with us</div>
                                    </div>
                                </a>

                                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl">
                                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shadow-2xs shrink-0">
                                        <MapPin size={14} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase">Address</div>
                                        <div className="text-slate-900 dark:text-slate-100 font-bold">Nairobi, Kenya</div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 h-36">
                                <iframe
                                    title="Latticefi HQ location"
                                    src="https://www.google.com/maps?q=Nairobi,Kenya&output=embed"
                                    className="w-full h-full grayscale-[15%] dark:invert dark:hue-rotate-180 dark:grayscale-[10%]"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            </div>
                        </div>

                        {/* Micro FAQ Accordion Block */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 p-5 shadow-xs space-y-3">
                            <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                                <HelpCircle size={13} className="text-indigo-500 dark:text-indigo-400" /> Frequently Asked Questions
                            </h3>

                            <div className="space-y-2">
                                {CONTACT_FAQS.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/40"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                            className="w-full flex items-center justify-between p-3.5 text-left text-xs font-black text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                        >
                                            <span className="pr-4 tracking-tight leading-snug">{item.q}</span>
                                            <ChevronDown
                                                size={14}
                                                className={`shrink-0 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${openFaq === idx ? "rotate-180" : ""}`}
                                            />
                                        </button>

                                        {openFaq === idx && (
                                            <div className="px-3.5 pb-3.5 pt-0 text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                                {item.a}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Trust Widget */}
                        <div className="bg-slate-900 dark:bg-slate-900 text-slate-300 dark:text-slate-400 rounded-3xl p-4.5 border border-slate-800 space-y-2 shadow-sm text-[11px] font-medium leading-normal">
                            <div className="flex items-center gap-1.5 text-xs font-black text-white uppercase tracking-wider mb-1">
                                <ShieldCheck size={13} className="text-indigo-400" /> Your privacy matters
                            </div>
                            <p>
                                Everything you share with us is encrypted in transit and only ever used to
                                route your inquiry to the right team — we never sell or share your details
                                with third parties.
                            </p>
                        </div>
                    </aside>
                </div>
            </main>

            <Footer />
        </div>
    );
}
