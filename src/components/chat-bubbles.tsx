import { useEffect, useState } from "react";
import { subscribeSettings, SiteSettings } from "@/lib/app";
import { Phone, MessageCircle, X } from "lucide-react";

const DEFAULT: SiteSettings = {
  whatsappNumber: "8801998778632",
  phoneNumber: "01998778632",
  messengerLink: "https://m.me/shzone",
  showWhatsapp: true,
  showPhone: true,
  showMessenger: true,
  showCod: true,
  showBkash: true,
  showNagad: true,
  showBankTransfer: false,
  bkashNumber: "01998778632",
  nagadNumber: "01998778632",
  bankAccount: "",
  bankDetails: "",
  siteName: "SHZONE",
  siteLogo: "",
  bannerImage: "",
  freeShippingThreshold: 5000,
  contactEmail: "shzone@example.com",
  address: "Bogra, Bangladesh",
  facebookUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
  businessHours: "Sat-Thu: 10AM - 8PM",
  adminLogo: "",
  adminBanner: "",
  deliveryChargeInside: 60,
  deliveryChargeOutside: 120,
  deliveryBaseCity: "Bogra",
};

export function ChatBubbles() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const unsub = subscribeSettings(setSettings);
    return unsub;
  }, []);

  const hasAny =
    (settings.showWhatsapp && settings.whatsappNumber) ||
    (settings.showPhone && settings.phoneNumber) ||
    (settings.showMessenger && settings.messengerLink);

  if (!hasAny) return null;

  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-2">
      {/* Expanded bubbles */}
      {expanded && (
        <>
          {settings.showWhatsapp && settings.whatsappNumber && (
            <a
              href={`https://wa.me/${settings.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-full shadow-lg text-white text-sm font-medium transition-transform hover:scale-105"
              style={{ backgroundColor: "#25D366" }}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>WhatsApp</span>
            </a>
          )}

          {settings.showMessenger && settings.messengerLink && (
            <a
              href={settings.messengerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-full shadow-lg text-white text-sm font-medium transition-transform hover:scale-105"
              style={{
                background:
                  "linear-gradient(135deg, #0099FF 0%, #A033FF 60%, #FF5C87 100%)",
              }}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12 0C5.374 0 0 4.975 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.626 0 12-4.974 12-11.111C24 4.975 18.626 0 12 0zm1.193 14.963l-3.056-3.259-5.963 3.259L10.733 8.1l3.13 3.259 5.89-3.259-6.56 6.863z" />
              </svg>
              <span>Messenger</span>
            </a>
          )}

          {settings.showPhone && settings.phoneNumber && (
            <a
              href={`tel:${settings.phoneNumber}`}
              className="flex items-center gap-2 px-3 py-2 rounded-full shadow-lg text-white text-sm font-medium transition-transform hover:scale-105"
              style={{ backgroundColor: "hsl(25 100% 50%)" }}
            >
              <Phone className="w-5 h-5" />
              <span>Call Us</span>
            </a>
          )}
        </>
      )}

      {/* Main toggle button */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95"
        style={{
          background: expanded
            ? "hsl(0 60% 45%)"
            : "linear-gradient(135deg, hsl(25 100% 50%), hsl(25 100% 40%))",
        }}
        aria-label="Contact us"
      >
        {expanded ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}
