import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Printer,
  Check,
  Scissors,
  Layers,
  Sparkles,
  ChevronRight,
  Package,
  Building2,
  FileCheck,
  Info
} from 'lucide-react';
import api from '../services/api';
import { businessConfig } from '../config/businessConfig';

/**
 * Procedural SVG Barcode Generator for Batch Slip
 */
function CourierBarcodeSvg({ value, height = 40 }) {
  const text = String(value || 'ZEBA-SHIP').toUpperCase().trim();
  const bars = [3, 1, 1, 2]; // Start guard

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const b1 = (code % 3) + 1.2;
    const s1 = ((code >> 1) % 2) + 1.2;
    const b2 = ((code >> 2) % 3) + 1.6;
    const s2 = ((code >> 3) % 2) + 1.2;
    const b3 = ((code >> 4) % 2) + 1.1;
    const s3 = ((code >> 2) % 3) + 1.3;
    bars.push(b1, s1, b2, s2, b3, s3);
  }
  bars.push(3, 1, 2, 3); // Stop guard

  let totalWidth = 0;
  bars.forEach(w => totalWidth += w);

  let currentX = 4;
  const rects = [];
  bars.forEach((w, idx) => {
    if (idx % 2 === 0) {
      rects.push(
        <rect
          key={idx}
          x={currentX}
          y="0"
          width={w}
          height={height}
          fill="#000000"
        />
      );
    }
    currentX += w;
  });

  return (
    <div className="w-full flex flex-col items-center justify-center text-center">
      <svg
        viewBox={`0 0 ${currentX + 4} ${height}`}
        style={{ width: '100%', maxWidth: '210px', height: '32px', display: 'block', margin: '0 auto' }}
        preserveAspectRatio="none"
      >
        {rects}
      </svg>
      <span style={{ display: 'block', textAlign: 'center', fontFamily: 'monospace', fontWeight: 900, letterSpacing: '1.8px', marginTop: '2px', fontSize: '9px', color: '#000000' }}>
        *{text}*
      </span>
    </div>
  );
}

/**
 * Packaging Symbols matching standard courier shipping labels:
 * 1. Broken Wine Glass (Fragile)
 * 2. Flame (Keep away from heat / Flammable)
 * 3. Recycle (Mobius loop)
 * 4. Umbrella (Keep dry)
 */
function FragileGlassIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 100 100" width="26" height="26" className={className} fill="currentColor">
      <rect x="28" y="82" width="44" height="6" rx="1" />
      <rect x="47" y="54" width="6" height="28" />
      <path d="M24 16 h52 v16 c0 14 -11 24 -26 24 s-26 -10 -26 -24 Z" />
      <path
        d="M50 16 l-7 10 l9 7 l-8 10 l7 9"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

function FlameIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 100 100" width="26" height="26" className={className} fill="currentColor">
      <path d="M50 10 c3 10 -4 18 -10 24 c-7 8 -10 17 -10 27 c0 18 14 31 30 31 s30 -13 30 -31 c0 -14 -9 -25 -20 -34 c0 9 -5 15 -12 18 c0 -12 4 -23 12 -31 c-9 2 -16 7 -20 16 Z" />
    </svg>
  );
}

function RecycleIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 100 100" width="26" height="26" className={className} fill="currentColor">
      <path d="M50 8 L38 24 H47 V34 H53 V24 H62 Z" />
      <path d="M22 62 L10 44 L24 40 L22 45 L31 50 L29 54 L20 49 Z" />
      <path d="M26 68 L36 50 L40 52 L32 66 L44 66 L44 71 L26 71 Z" />
      <path d="M78 62 L69 49 L60 54 L58 50 L67 45 L65 40 L79 44 Z" />
      <path d="M74 68 L56 71 L56 66 L68 66 L60 52 L64 50 Z" />
    </svg>
  );
}

function UmbrellaIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 100 100" width="26" height="26" className={className} fill="currentColor">
      <path d="M50 16 C30 16 16 30 16 48 h9 c0 -2.5 2 -4.5 4.5 -4.5 s4.5 2 4.5 4.5 h9 c0 -2.5 2 -4.5 4.5 -4.5 s4.5 2 4.5 4.5 h9 c0 -2.5 2 -4.5 4.5 -4.5 s4.5 2 4.5 4.5 h9 C84 30 70 16 50 16 Z" />
      <path d="M47 48 v26 c0 3.8 -3.2 7 -7 7 s-7 -3.2 -7 -7 h-5 c0 6.6 5.4 12 12 12 s12 -5.4 12 -12 V48 h-5 Z" />
    </svg>
  );
}

/**
 * Single Shipping Slip Item (Quadrant for 4-in-1 A4 Layout)
 */
function SingleBatchSlip({ order, fromInfo, logoStyle, barcodeData }) {
  if (!order) {
    // Blank quadrant to preserve 2x2 grid if page has < 4 orders
    return (
      <div className="batch-slip-empty border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-4 text-center">
        <Scissors className="w-6 h-6 text-gray-300 mb-1" />
        <span className="text-[10px] text-gray-400 font-medium">Empty quadrant (Blank parcel spot)</span>
      </div>
    );
  }

  const toName = order.customer_name || 'Customer';
  const toAddress = [order.house_building, order.street, order.area].filter(Boolean).join(', ') || 'Address not provided';
  const toCityZip = `${order.city ? order.city + ', ' : ''}${order.state ? order.state + ' - ' : ''}${order.pincode || ''}`;
  const toPhone = order.customer_phone || '';

  // Barcode resolution
  const barcodeImg = barcodeData?.image || null;
  const barcodeValue = barcodeData?.code || order.tracking_number || order.order_number || 'ZEBA-PARCEL';

  return (
    <div
      className="batch-slip-card bg-white p-2 rounded-2xl border-[2.5px] border-black text-black font-sans box-border overflow-hidden flex flex-col justify-between"
      style={{
        backgroundColor: '#ffffff',
        border: '2.5px solid #000000',
        borderRadius: '14px',
        padding: '5px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        width: '100%',
        height: '100%'
      }}
    >
      {/* Inner Black Border Frame */}
      <div
        className="batch-slip-inner border-2 border-black p-2 bg-white flex flex-col justify-between h-full box-border overflow-hidden"
        style={{
          border: '2px solid #000000',
          borderRadius: '0px',
          padding: '6px 8px',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* TOP ROW: LOGO + FROM SENDER */}
        <div
          className="batch-top-row flex items-start justify-between gap-2.5"
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '8px',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          {/* Black Square Logo */}
          <div
            className="batch-logo-box bg-black text-white flex flex-col items-center justify-center font-black leading-none rounded-xs shrink-0 select-none"
            style={{
              backgroundColor: '#000000',
              color: '#ffffff',
              width: '44px',
              height: '44px',
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '15px',
              lineHeight: 1,
              letterSpacing: '1.5px',
              borderRadius: '2px',
              flexShrink: 0,
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact'
            }}
          >
            {logoStyle === 'ZEBA' ? (
              <>
                <span style={{ color: '#ffffff', lineHeight: 1 }}>ZE</span>
                <span style={{ color: '#ffffff', lineHeight: 1, marginTop: '2px' }}>BA</span>
              </>
            ) : (
              <>
                <span style={{ color: '#ffffff', lineHeight: 1 }}>LO</span>
                <span style={{ color: '#ffffff', lineHeight: 1, marginTop: '2px' }}>GO</span>
              </>
            )}
          </div>

          {/* FROM: Sender Info */}
          <div
            className="batch-from-col flex-1 flex items-start gap-1.5 min-w-0"
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: '6px',
              flex: 1,
              minWidth: 0
            }}
          >
            <span
              className="batch-field-label font-black uppercase text-black pt-0.5 select-none shrink-0"
              style={{
                fontWeight: 900,
                fontSize: '10.5px',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
                color: '#000000',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              FROM :
            </span>
            <div
              className="batch-address-content text-black leading-tight flex-1 min-w-0"
              style={{
                fontSize: '9.5px',
                lineHeight: 1.2,
                color: '#000000',
                flex: 1,
                minWidth: 0
              }}
            >
              <p
                style={{
                  fontWeight: 900,
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  marginBottom: '1px',
                  color: '#000000',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {fromInfo.shop}
              </p>
              <p
                style={{
                  fontWeight: 500,
                  fontSize: '9px',
                  color: '#111111',
                  marginBottom: '1px',
                  lineHeight: 1.15,
                  wordBreak: 'break-word',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {fromInfo.address}
              </p>
              <p style={{ fontWeight: 700, fontSize: '9.5px', color: '#000000', marginBottom: '1px' }}>
                {fromInfo.cityZip}
              </p>
              {fromInfo.phone && (
                <p style={{ fontWeight: 600, fontSize: '9px', color: '#222222', margin: 0 }}>
                  Ph: {fromInfo.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* THICK DIVIDER 1 */}
        <div
          style={{
            borderBottom: '2px solid #000000',
            width: '100%',
            margin: '3px 0',
            flexShrink: 0
          }}
        />

        {/* MIDDLE ROW: TO: CUSTOMER RECIPIENT */}
        <div
          className="batch-to-row flex items-start gap-1.5"
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: '6px',
            width: '100%',
            padding: '1px 0',
            boxSizing: 'border-box'
          }}
        >
          <span
            className="batch-field-label font-black uppercase text-black pt-0.5 select-none shrink-0"
            style={{
              fontWeight: 900,
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              color: '#000000',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            TO :
          </span>
          <div
            className="batch-address-content text-black leading-tight flex-1 min-w-0"
            style={{
              fontSize: '9.5px',
              lineHeight: 1.2,
              color: '#000000',
              flex: 1,
              minWidth: 0
            }}
          >
            <p
              style={{
                fontWeight: 900,
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.2px',
                marginBottom: '1px',
                color: '#000000',
                wordBreak: 'break-word'
              }}
            >
              {toName}
            </p>
            <p
              style={{
                fontWeight: 500,
                fontSize: '9.5px',
                color: '#111111',
                marginBottom: '1px',
                lineHeight: 1.2,
                wordBreak: 'break-word',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {toAddress}
            </p>
            <p
              style={{
                fontWeight: 900,
                fontSize: '11px',
                marginBottom: '1px',
                color: '#000000'
              }}
            >
              {toCityZip}
            </p>
            {toPhone && (
              <p
                style={{
                  fontWeight: 900,
                  fontSize: '10px',
                  color: '#000000',
                  margin: 0
                }}
              >
                Ph: {toPhone}
              </p>
            )}
          </div>
        </div>

        {/* THICK DIVIDER 2 */}
        <div
          style={{
            borderBottom: '2px solid #000000',
            width: '100%',
            margin: '3px 0',
            flexShrink: 0
          }}
        />

        {/* BARCODE SECTION */}
        <div
          className="batch-barcode-wrapper flex flex-col items-center justify-center min-h-[44px] max-h-[56px] overflow-hidden text-center"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '2px 0',
            minHeight: '44px',
            maxHeight: '56px',
            overflow: 'hidden',
            flexShrink: 0,
            textAlign: 'center'
          }}
        >
          {barcodeImg ? (
            <div className="flex flex-col items-center justify-center max-w-full">
              <img
                src={barcodeImg}
                alt="Barcode"
                className="batch-barcode-img max-h-10 max-w-[200px] w-auto object-contain block mx-auto"
                style={{
                  maxHeight: '40px',
                  maxWidth: '200px',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto'
                }}
              />
            </div>
          ) : (
            <CourierBarcodeSvg value={barcodeValue} height={32} />
          )}
        </div>

        {/* DOUBLE DIVIDER LINE */}
        <div
          className="batch-double-divider my-1 w-full"
          style={{
            width: '100%',
            margin: '2px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5px',
            flexShrink: 0
          }}
        >
          <div style={{ height: '1.5px', backgroundColor: '#000000', width: '100%' }} />
          <div style={{ height: '1.5px', backgroundColor: '#000000', width: '100%' }} />
        </div>

        {/* BOTTOM ROW: 4 ICONIC PACKAGING SYMBOLS */}
        <div
          className="batch-symbols-row flex items-center justify-around py-1 text-black"
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            width: '100%',
            padding: '1px 0 0 0',
            color: '#000000',
            flexShrink: 0
          }}
        >
          <div title="Fragile / Handle With Care" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px' }}>
            <FragileGlassIcon className="w-5 h-5" />
          </div>
          <div title="Keep away from heat / Flammable" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px' }}>
            <FlameIcon className="w-5 h-5" />
          </div>
          <div title="Recycle / Environment Friendly" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px' }}>
            <RecycleIcon className="w-5 h-5" />
          </div>
          <div title="Keep Dry / Protect from water" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px' }}>
            <UmbrellaIcon className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Batch Shipping Slips Modal
 * Prints 4 slips in one A4 size page (2x2 grid layout)
 */
export default function BatchShippingSlipsModal({
  orders = [],
  settings = {},
  isOpen,
  onClose
}) {
  const [logoStyle, setLogoStyle] = useState('ZEBA'); // 'ZEBA' | 'LOGO'
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [selectedBarcodeKey, setSelectedBarcodeKey] = useState('auto'); // 'auto' | product_id
  const [isPrinting, setIsPrinting] = useState(false);

  // Sender details
  const fromInfo = {
    shop: settings?.brandFullName || settings?.brandName || businessConfig.brandFullName || 'ZEBA Wellness',
    address: `${settings?.address?.building || businessConfig.address.building}, ${settings?.address?.street || businessConfig.address.street}`,
    cityZip: `${settings?.address?.city || businessConfig.address.city}, ${settings?.address?.state || businessConfig.address.state} ${settings?.address?.pincode || businessConfig.address.pincode}`,
    phone: settings?.supportPhone || businessConfig.supportPhone
  };

  // Fetch catalog products on mount to resolve real barcode images
  useEffect(() => {
    let active = true;
    async function loadProducts() {
      try {
        const res = await api.get('/admin/products');
        if (active && res.success && Array.isArray(res.products)) {
          setCatalogProducts(res.products);
        }
      } catch (err) {
        console.error('Failed to load products for barcode images', err);
      }
    }
    if (isOpen) {
      loadProducts();
    }
    return () => { active = false; };
  }, [isOpen]);

  if (!isOpen || !orders || orders.length === 0) return null;

  // Split selected orders into chunks of 4 (4 slips per A4 page)
  const pageSize = 4;
  const pages = [];
  for (let i = 0; i < orders.length; i += pageSize) {
    const chunk = orders.slice(i, i + pageSize);
    // Pad to 4 if last page has fewer than 4
    while (chunk.length < 4) {
      chunk.push(null);
    }
    pages.push(chunk);
  }

  // Resolve barcode data for an order
  const getOrderBarcode = (order) => {
    if (!order) return null;

    // If admin explicitly picked a product barcode from catalog
    if (selectedBarcodeKey !== 'auto') {
      const chosen = catalogProducts.find(p => String(p.id) === String(selectedBarcodeKey));
      if (chosen) {
        return {
          image: chosen.barcode_image || null,
          code: chosen.barcode || chosen.name
        };
      }
    }

    // Auto resolution: match against products summary or first catalog product with image
    if (catalogProducts.length > 0) {
      const prodWithImg = catalogProducts.find(p => p.barcode_image);
      if (prodWithImg) {
        return {
          image: prodWithImg.barcode_image,
          code: prodWithImg.barcode || prodWithImg.name
        };
      }
    }

    return {
      image: null,
      code: order.tracking_number || order.order_number
    };
  };

  /**
   * Execute Native Print Window with strict 4-in-1 A4 CSS
   */
  const handlePrint = () => {
    setIsPrinting(true);

    const printContainer = document.getElementById('batch-slips-printable-document');
    if (!printContainer) {
      setIsPrinting(false);
      return;
    }

    const printWindow = window.open('', '_blank', 'width=950,height=1000');
    if (!printWindow) {
      alert('Pop-up was blocked. Please allow pop-ups for this website to print shipping slips.');
      setIsPrinting(false);
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ZEBA Shipping Slips - Batch 4-in-1 A4</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: A4 portrait;
              margin: 4mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background-color: #ffffff !important;
              color: #000000 !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
            }

            .a4-batch-page {
              width: 202mm !important;
              height: 289mm !important;
              max-height: 289mm !important;
              margin: 0 auto !important;
              padding: 0 !important;
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              grid-template-rows: 1fr 1fr !important;
              gap: 3mm !important;
              position: relative !important;
              box-sizing: border-box !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              page-break-after: always !important;
              break-after: page !important;
              overflow: hidden !important;
            }

            .a4-batch-page:last-child {
              page-break-after: avoid !important;
              break-after: avoid !important;
            }

            /* Cut guides */
            .cut-guide-horizontal {
              position: absolute !important;
              left: 0 !important;
              right: 0 !important;
              top: 50% !important;
              transform: translateY(-50%) !important;
              border-top: 1px dashed #cccccc !important;
              pointer-events: none !important;
              z-index: 10 !important;
              display: flex !important;
              justify-content: center !important;
            }
            .cut-guide-vertical {
              position: absolute !important;
              top: 0 !important;
              bottom: 0 !important;
              left: 50% !important;
              transform: translateX(-50%) !important;
              border-left: 1px dashed #cccccc !important;
              pointer-events: none !important;
              z-index: 10 !important;
            }

            /* Single Quadrant Slip */
            .batch-slip-card {
              width: 100% !important;
              height: 100% !important;
              max-height: 142mm !important;
              background-color: #ffffff !important;
              border: 2.5px solid #000000 !important;
              border-radius: 14px !important;
              padding: 5px !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
              box-sizing: border-box !important;
              overflow: hidden !important;
            }

            .batch-slip-inner {
              border: 2px solid #000000 !important;
              border-radius: 0 !important;
              padding: 6px 8px !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
              height: 100% !important;
              box-sizing: border-box !important;
              overflow: hidden !important;
            }

            .batch-top-row {
              display: flex !important;
              flex-direction: row !important;
              align-items: flex-start !important;
              justify-content: space-between !important;
              gap: 8px !important;
              width: 100% !important;
              box-sizing: border-box !important;
            }

            .batch-logo-box {
              width: 44px !important;
              height: 44px !important;
              min-width: 44px !important;
              min-height: 44px !important;
              background-color: #000000 !important;
              color: #ffffff !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              justify-content: center !important;
              font-weight: 900 !important;
              font-size: 15px !important;
              line-height: 1 !important;
              letter-spacing: 1.5px !important;
              border-radius: 2px !important;
              flex-shrink: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .batch-logo-box span {
              color: #ffffff !important;
              display: block !important;
              line-height: 1 !important;
            }

            .batch-from-col {
              display: flex !important;
              flex-direction: row !important;
              align-items: flex-start !important;
              gap: 6px !important;
              flex: 1 !important;
              min-width: 0 !important;
            }

            .batch-field-label {
              font-weight: 900 !important;
              font-size: 10.5px !important;
              text-transform: uppercase !important;
              letter-spacing: 0.4px !important;
              color: #000000 !important;
              white-space: nowrap !important;
              flex-shrink: 0 !important;
            }

            .batch-address-content {
              font-size: 9.5px !important;
              line-height: 1.2 !important;
              color: #000000 !important;
              flex: 1 !important;
              min-width: 0 !important;
            }

            .batch-to-row {
              display: flex !important;
              flex-direction: row !important;
              align-items: flex-start !important;
              gap: 6px !important;
              width: 100% !important;
              padding: 1px 0 !important;
              box-sizing: border-box !important;
            }

            .batch-barcode-wrapper {
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              justify-content: center !important;
              width: 100% !important;
              padding: 2px 0 !important;
              min-height: 44px !important;
              max-height: 56px !important;
              overflow: hidden !important;
              flex-shrink: 0 !important;
              text-align: center !important;
            }

            .batch-barcode-img {
              max-height: 40px !important;
              max-width: 200px !important;
              width: auto !important;
              height: auto !important;
              object-fit: contain !important;
              display: block !important;
              margin: 0 auto !important;
            }

            .batch-symbols-row {
              display: flex !important;
              flex-direction: row !important;
              align-items: center !important;
              justify-content: space-around !important;
              width: 100% !important;
              padding: 1px 0 0 0 !important;
              color: #000000 !important;
              flex-shrink: 0 !important;
            }

            .batch-slip-empty {
              visibility: hidden !important;
            }
          </style>
        </head>
        <body>
          ${printContainer.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();

    // Ensure all images are fully loaded before calling window.print()
    const checkImagesAndPrint = () => {
      const images = printWindow.document.querySelectorAll('img');
      const totalImages = images.length;
      let loadedImages = 0;

      if (totalImages === 0) {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          setIsPrinting(false);
        }, 250);
        return;
      }

      const onImageFinish = () => {
        loadedImages++;
        if (loadedImages >= totalImages) {
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            setIsPrinting(false);
          }, 300);
        }
      };

      images.forEach((img) => {
        if (img.complete && img.naturalHeight !== 0) {
          onImageFinish();
        } else {
          img.onload = onImageFinish;
          img.onerror = onImageFinish;
        }
      });
    };

    if (printWindow.document.readyState === 'complete') {
      checkImagesAndPrint();
    } else {
      printWindow.onload = checkImagesAndPrint;
    }
  };

  const totalSheets = pages.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full flex flex-col max-h-[96vh] overflow-hidden shadow-2xl border border-brand-primaryPink/25">
        
        {/* Top Control Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-brand-deepPurple via-brand-plum to-brand-deepPurple text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-xl bg-white/15 backdrop-blur-md text-amber-300">
                <Printer className="w-5 h-5" />
              </span>
              <h2 className="font-display font-black text-lg sm:text-xl text-white">
                Print Shipping Slips (4 Slips in 1 A4 Page)
              </h2>
            </div>
            <p className="text-xs text-brand-softPink/90 mt-1 flex items-center gap-1.5 flex-wrap">
              <span>Selected <strong>{orders.length} order{orders.length > 1 ? 's' : ''}</strong></span>
              <span>•</span>
              <span className="bg-white/20 text-white font-bold px-2 py-0.5 rounded-full text-[11px]">
                {totalSheets} A4 Page{totalSheets > 1 ? 's' : ''}
              </span>
              <span>•</span>
              <span className="text-amber-200 font-semibold">2 × 2 Quadrant Grid Layout</span>
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Logo Style Toggle */}
            <button
              type="button"
              onClick={() => setLogoStyle(prev => prev === 'ZEBA' ? 'LOGO' : 'ZEBA')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors cursor-pointer border border-white/20"
              title="Toggle Logo text"
            >
              Logo: <strong className="font-mono">{logoStyle === 'ZEBA' ? 'ZE / BA' : 'LO / GO'}</strong>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-brand-deepPurple font-black px-4 py-2 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all text-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isPrinting ? 'Preparing Print...' : 'Print All Slips'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barcode Source Customizer Strip */}
        <div className="px-4 py-2.5 bg-brand-softPink/50 border-b border-brand-primaryPink/20 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-1.5 text-brand-darkPurple font-bold">
            <Sparkles className="w-4 h-4 text-brand-brightPink" />
            <span>Barcode Source:</span>
          </div>
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <button
              type="button"
              onClick={() => setSelectedBarcodeKey('auto')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                selectedBarcodeKey === 'auto'
                  ? 'bg-brand-deepPurple text-white shadow-xs'
                  : 'bg-white text-brand-deepPurple border border-brand-primaryPink/30 hover:border-brand-brightPink'
              }`}
            >
              Auto (Product Image / Order No)
            </button>

            {catalogProducts.filter(p => p.barcode_image).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedBarcodeKey(p.id)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center space-x-1 transition-colors cursor-pointer ${
                  String(selectedBarcodeKey) === String(p.id)
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50'
                }`}
                title={`Use ${p.pack_size || p.name} barcode image`}
              >
                <span>📦 {p.pack_size || p.name}</span>
                <span className="text-[9px] bg-white/20 text-current px-1 rounded">Image</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable A4 Document Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200/80 flex flex-col items-center gap-6">
          <div className="text-center text-xs text-slate-500 font-medium flex items-center space-x-1.5">
            <Scissors className="w-3.5 h-3.5 text-slate-400" />
            <span>Previewing {totalSheets} A4 sheet{totalSheets > 1 ? 's' : ''}. Each sheet fits exactly 4 slips (2×2 grid) with dashed cut lines.</span>
          </div>

          {/* Actual Printable Container */}
          <div id="batch-slips-printable-document" className="w-full flex flex-col items-center gap-8">
            {pages.map((pageChunk, pageIdx) => (
              <div
                key={pageIdx}
                className="a4-batch-page bg-white shadow-2xl border border-slate-300 relative"
                style={{
                  width: '202mm',
                  minHeight: '289mm',
                  maxHeight: '289mm',
                  height: '289mm',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gridTemplateRows: '1fr 1fr',
                  gap: '3mm',
                  padding: '3mm',
                  boxSizing: 'border-box',
                  position: 'relative',
                  backgroundColor: '#ffffff'
                }}
              >
                {/* Visual Center Scissors Cut Guides */}
                <div
                  className="cut-guide-horizontal"
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    borderTop: '1px dashed #d1d5db',
                    pointerEvents: 'none',
                    zIndex: 10
                  }}
                />
                <div
                  className="cut-guide-vertical"
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    borderLeft: '1px dashed #d1d5db',
                    pointerEvents: 'none',
                    zIndex: 10
                  }}
                />

                {/* 4 Quadrants */}
                {pageChunk.map((orderItem, quadIdx) => (
                  <SingleBatchSlip
                    key={quadIdx}
                    order={orderItem}
                    fromInfo={fromInfo}
                    logoStyle={logoStyle}
                    barcodeData={getOrderBarcode(orderItem)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-brand-primaryPink/20 flex items-center justify-between text-xs shrink-0">
          <div className="text-slate-600 font-medium">
            Ready to print: <strong className="text-brand-deepPurple font-bold">{orders.length} slips</strong> on <strong className="text-brand-deepPurple font-bold">{totalSheets} A4 page{totalSheets > 1 ? 's' : ''}</strong>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              className="inline-flex items-center space-x-1.5 bg-brand-deepPurple hover:bg-brand-plum text-white font-bold px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Print {orders.length} Slip{orders.length > 1 ? 's' : ''}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
