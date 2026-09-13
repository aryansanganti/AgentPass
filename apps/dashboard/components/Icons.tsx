import React from "react";

type IconProps = {
    className?: string;
};

export function AgentIcon({ className = "h-5 w-5" }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden="true">
            <path d="M7.5 15.5a4.5 4.5 0 1 1 9 0" />
            <circle cx="12" cy="8" r="3.25" />
            <path d="M4.5 18.25c1.1-2.2 3.15-3.25 7.5-3.25s6.4 1.05 7.5 3.25" />
        </svg>
    );
}

export function ShieldCheckIcon({ className = "h-5 w-5" }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
            <path d="M12 3.5 18 5.8v5.3c0 3.7-2.2 6.9-6 8.8-3.8-1.9-6-5.1-6-8.8V5.8l6-2.3Z" />
            <path d="m8.8 12.2 2 2 4.4-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export function WalletIcon({ className = "h-5 w-5" }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
            <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5v7A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5v-7Z" />
            <path d="M15 12h5" strokeLinecap="round" />
            <circle cx="16" cy="12" r="1" fill="currentColor" stroke="none" />
        </svg>
    );
}

export function WorldIcon({ className = "h-5 w-5" }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
            <circle cx="12" cy="12" r="8.5" />
            <path d="M3.8 12h16.4M12 3.5c2.5 2.2 3.9 5.3 3.9 8.5S14.5 18.3 12 20.5M12 3.5C9.5 5.7 8.1 8.8 8.1 12S9.5 18.3 12 20.5" strokeLinecap="round" />
        </svg>
    );
}

export function GraphIcon({ className = "h-5 w-5" }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
            <path d="M7 16V9m5 7V5m5 11v-6" strokeLinecap="round" />
            <circle cx="7" cy="16" r="1.6" fill="currentColor" stroke="none" />
            <circle cx="12" cy="16" r="1.6" fill="currentColor" stroke="none" />
            <circle cx="17" cy="16" r="1.6" fill="currentColor" stroke="none" />
            <circle cx="12" cy="5" r="1.6" fill="currentColor" stroke="none" />
        </svg>
    );
}

export function ActivityIcon({ className = "h-5 w-5" }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
            <path d="M5 12h3l2-5 4 10 2-5h3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export function ReceiptIcon({ className = "h-5 w-5" }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
            <path d="M7 4.5h10a2 2 0 0 1 2 2V20l-3-2-3 2-3-2-3 2V6.5a2 2 0 0 1 2-2Z" />
            <path d="M9 8h6M9 11h6" strokeLinecap="round" />
        </svg>
    );
}

export function ArrowUpRightIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
            <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export function XMarkIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
        </svg>
    );
}

export function CheckIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
            <path d="m5 12.5 4.2 4.2L19 2.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export function AlertIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
            <path d="M12 8v5" strokeLinecap="round" />
            <circle cx="12" cy="16.5" r="1" fill="currentColor" stroke="none" />
            <path d="M10.4 4.2 3.6 16.2A1.7 1.7 0 0 0 5.1 18.8h13.8a1.7 1.7 0 0 0 1.5-2.6L13.6 4.2a1.7 1.7 0 0 0-3.2 0Z" />
        </svg>
    );
}
